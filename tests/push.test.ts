/// <reference types="bun-types" />
/**
 * Unit tests for the push-notification feature — the pure logic that keeps
 * opt-in honest, delivery retries bounded, and every failure classified.
 *
 * Scope (NO browser is launched, NO network is touched, NO fake
 * subscriptions are created, NO delivery is simulated as success):
 *   1. VAPID env resolution — missing / partial / complete configurations,
 *      subject format validation (the owner's server-only secrets never
 *      appear here — only what a test literal provides).
 *   2. Retry policy — exactly one retry for transient push-service
 *      statuses (429/500/502/503), never for terminal ones (400/403/404/410).
 *   3. Payload normalization — the service-worker contract: nothing is
 *      invented, unknown urls fall back to the app root, tags pass through.
 *   4. VAPID key decoding + endpoint hashing — the duplicate-prevention key.
 *   5. Error description mapping — user-safe messages that never leak raw
 *      exceptions (storage-missing, timeout, network, generic).
 *   6. Delivery-route helpers — Bearer-token parsing (server-side identity
 *      input), the push_subscriptions query time budget, and user-safe
 *      storage-error classification for /api/push/test.
 *
 * The full flow (real permission prompt, real push service delivery) needs
 * the owner's VAPID credentials + migration-010 and is covered by the
 * manual verification steps in supabase/README.md §10 — never faked here.
 *
 * Run: bun test tests/push.test.ts
 */

import { describe, expect, test } from "bun:test";

import {
  describePushError,
  hashPushEndpoint,
  normalizePushPayload,
  urlBase64ToUint8Array,
} from "../src/lib/foodie/push";
import {
  PushQueryTimeoutError,
  describeSubscriptionStoreError,
  isRetryablePushStatus,
  parseBearerToken,
  resolvePushConfig,
  sendToSubscription,
  withPushQueryTimeout,
  type PushSender,
  type StoredSubscription,
} from "../src/lib/foodie/pushServer";

describe("push VAPID env resolution", () => {
  test("missing everything → not configured, no keys", () => {
    const cfg = resolvePushConfig({});
    expect(cfg.configured).toBe(false);
    expect(cfg.publicKey).toBeNull();
    expect(cfg.privateKey).toBeNull();
    expect(cfg.subject).toBeNull();
  });

  test("partial configurations are never 'configured' (each missing var flips it off)", () => {
    const base = { publicKey: "B" + "x".repeat(80), privateKey: "Y" + "y".repeat(40), subject: "mailto:owner@example.com" };
    expect(resolvePushConfig({ ...base, publicKey: "" }).configured).toBe(false);
    expect(resolvePushConfig({ ...base, privateKey: "  " }).configured).toBe(false);
    expect(resolvePushConfig({ ...base, subject: undefined }).configured).toBe(false);
    // Complete configuration is required — all three present.
    expect(resolvePushConfig(base).configured).toBe(true);
  });

  test("subject must look like mailto: or https: (Web Push spec contact)", () => {
    const base = { publicKey: "k".repeat(87), privateKey: "s".repeat(43) };
    expect(resolvePushConfig({ ...base, subject: "mailto:owner@example.com" }).subject).toBe("mailto:owner@example.com");
    expect(resolvePushConfig({ ...base, subject: "https://foodie.example/contact" }).subject).toBe("https://foodie.example/contact");
    // Junk / bare emails / http: are rejected → not configured.
    expect(resolvePushConfig({ ...base, subject: "owner@example.com" }).subject).toBeNull();
    expect(resolvePushConfig({ ...base, subject: "http://insecure.example" }).subject).toBeNull();
    expect(resolvePushConfig({ ...base, subject: "hello world" }).subject).toBeNull();
    expect(resolvePushConfig({ ...base, subject: "mailto:" }).subject).toBeNull();
  });

  test("whitespace-padded values are trimmed before validation", () => {
    const cfg = resolvePushConfig({
      publicKey: "  " + "k".repeat(87) + "  ",
      privateKey: "\n" + "s".repeat(43),
      subject: " mailto:owner@example.com ",
    });
    expect(cfg.configured).toBe(true);
    expect(cfg.publicKey).toBe("k".repeat(87));
    expect(cfg.subject).toBe("mailto:owner@example.com");
  });
});

describe("push retry policy (transient vs terminal)", () => {
  test("429/500/502/503 are retryable", () => {
    expect(isRetryablePushStatus(429)).toBe(true);
    expect(isRetryablePushStatus(500)).toBe(true);
    expect(isRetryablePushStatus(502)).toBe(true);
    expect(isRetryablePushStatus(503)).toBe(true);
  });

  test("terminal statuses are never retried (no duplicate failure spam)", () => {
    for (const status of [400, 401, 403, 404, 410]) {
      expect(isRetryablePushStatus(status)).toBe(false);
    }
  });

  const sub: StoredSubscription = { id: "sub-1", endpoint: "https://push.example/abc", p256dh: "p", auth_key: "a" };
  const payload = { title: "t", body: "b", url: "/", tag: "foodie-test" };

  test("success on first attempt → exactly one send, ok", async () => {
    let calls = 0;
    const sender: PushSender = async () => {
      calls += 1;
      return { ok: true };
    };
    const result = await sendToSubscription({ configured: true, publicKey: "k", privateKey: "s", subject: "mailto:o@e.com" }, sub, payload, sender);
    expect(result).toEqual({ ok: true });
    expect(calls).toBe(1);
  });

  test("terminal 410 → single attempt, status preserved for stale cleanup", async () => {
    let calls = 0;
    const sender: PushSender = async () => {
      calls += 1;
      return { ok: false, status: 410 };
    };
    const result = await sendToSubscription({ configured: true, publicKey: "k", privateKey: "s", subject: "mailto:o@e.com" }, sub, payload, sender);
    expect(result).toEqual({ ok: false, status: 410 });
    expect(calls).toBe(1);
  });

  test("transient 429 then success → retried once, delivered", async () => {
    const statuses = [429];
    const calls: number[] = [];
    const sender: PushSender = async () => {
      calls.push(1);
      const s = statuses.shift();
      return s === undefined ? { ok: true } : { ok: false, status: s };
    };
    const result = await sendToSubscription({ configured: true, publicKey: "k", privateKey: "s", subject: "mailto:o@e.com" }, sub, payload, sender);
    expect(result).toEqual({ ok: true });
    expect(calls.length).toBe(2);
  });

  test("persistent transient failure → exactly one retry, final status reported (never ok)", async () => {
    let calls = 0;
    const sender: PushSender = async () => {
      calls += 1;
      return { ok: false, status: 503 };
    };
    const result = await sendToSubscription({ configured: true, publicKey: "k", privateKey: "s", subject: "mailto:o@e.com" }, sub, payload, sender);
    expect(result).toEqual({ ok: false, status: 503 });
    expect(calls).toBe(2); // 1 retry max — bounded, no loops
  });
});

describe("push payload normalization (SW contract)", () => {
  test("full valid payload passes through unchanged", () => {
    expect(normalizePushPayload({ title: "Hello", body: "World", url: "/place/x", tag: "t1" })).toEqual({
      title: "Hello",
      body: "World",
      url: "/place/x",
      tag: "t1",
    });
  });

  test("missing fields fall back to honest defaults (never invented content)", () => {
    expect(normalizePushPayload({})).toEqual({ title: "Foodie", body: "", url: "/", tag: undefined });
  });

  test("non-string junk is ignored, not trusted", () => {
    expect(
      normalizePushPayload({ title: 42, body: { evil: true }, url: "https://evil.example", tag: ["x"] })
    ).toEqual({ title: "Foodie", body: "", url: "/", tag: undefined });
  });

  test("non-object payloads (string / null / undefined / bad JSON shape) → defaults", () => {
    expect(normalizePushPayload("plain text")).toEqual({ title: "Foodie", body: "", url: "/", tag: undefined });
    expect(normalizePushPayload(null)).toEqual({ title: "Foodie", body: "", url: "/", tag: undefined });
    expect(normalizePushPayload(undefined)).toEqual({ title: "Foodie", body: "", url: "/", tag: undefined });
  });

  test("relative urls are kept, absolute/foreign urls collapse to the app root", () => {
    expect(normalizePushPayload({ url: "/destinations/tirupati" }).url).toBe("/destinations/tirupati");
    expect(normalizePushPayload({ url: "javascript:alert(1)" }).url).toBe("/");
    expect(normalizePushPayload({ url: "//cdn.example/x" }).url).toBe("/");
  });

  test("whitespace-only titles fall back to Foodie; empty-string tag is dropped", () => {
    const p = normalizePushPayload({ title: "   ", tag: "" });
    expect(p.title).toBe("Foodie");
    expect(p.tag).toBeUndefined();
  });
});

describe("VAPID key decode + endpoint hash (duplicate-prevention key)", () => {
  test("url-base64 (no padding, - and _) decodes to exact bytes", () => {
    // "-"/"_" map to "+"/"/"; padding is restored deterministically
    // (vectors verified against the runtime decoder).
    expect(Array.from(urlBase64ToUint8Array("QQ--"))).toEqual([65, 15, 190]); // → "QQ++"
    expect(Array.from(urlBase64ToUint8Array("QQ_-"))).toEqual([65, 15, 254]); // → "QQ/+"
    expect(Array.from(urlBase64ToUint8Array("Q-"))).toEqual([67]);            // → "Q+"
  });

  test("already-padded standard base64 is unaffected", () => {
    const bytes = urlBase64ToUint8Array("QQ==");
    expect(Array.from(bytes)).toEqual([0x41]);
  });

  test("invalid base64 throws (a malformed VAPID key must fail loudly, not silently)", () => {
    expect(() => urlBase64ToUint8Array("!!!not-base64!!!")).toThrow();
  });

  test("hashPushEndpoint is SHA-256 hex: 64 chars, lowercase, deterministic", async () => {
    const h1 = await hashPushEndpoint("https://fcm.googleapis.com/fcm/send/abc");
    const h2 = await hashPushEndpoint("https://fcm.googleapis.com/fcm/send/abc");
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
  });

  test("different endpoints hash differently (per-browser row key)", async () => {
    const a = await hashPushEndpoint("https://push.example/a");
    const b = await hashPushEndpoint("https://push.example/b");
    expect(a).not.toBe(b);
  });
});

describe("user-safe error description (raw exceptions never reach the UI)", () => {
  test("missing push_subscriptions table → storage-not-set-up message", () => {
    expect(describePushError(new Error('relation "public.push_subscriptions" does not exist'))).toContain(
      "storage isn't set up"
    );
    expect(describePushError(new Error("Could not find the 'push_subscriptions' table in the schema cache"))).toContain(
      "storage isn't set up"
    );
  });

  test("timeouts map to a retryable timeout message", () => {
    expect(describePushError(new Error("The operation timed out"))).toContain("took too long");
    expect(describePushError(new Error("AbortError: signal is aborted without reason"))).toContain("took too long");
  });

  test("network failures map to a retryable reachability message", () => {
    expect(describePushError(new Error("Failed to fetch"))).toContain("try again");
    expect(describePushError(new Error("Load failed"))).toContain("try again");
  });

  test("unknown errors map to the generic message (no exception text leaks)", () => {
    const described = describePushError(new Error("TypeError: cannot read properties of undefined (reading 'keys')"));
    expect(described).not.toContain("TypeError");
    expect(described).not.toContain("undefined");
    expect(described).toContain("Something went wrong");
  });

  test("non-Error throwables are handled", () => {
    expect(describePushError("boom")).toContain("Something went wrong");
  });
});

describe("delivery route: bearer token parsing (server-side identity input)", () => {
  test("well-formed Bearer header yields the token", () => {
    expect(parseBearerToken("Bearer abc.def.ghi")).toBe("abc.def.ghi");
    expect(parseBearerToken("bearer abc.def.ghi")).toBe("abc.def.ghi"); // scheme is case-insensitive
    expect(parseBearerToken("  Bearer   tok  ")).toBe("tok"); // tolerated whitespace
  });

  test("missing / malformed headers yield null (never a guessed token)", () => {
    expect(parseBearerToken(null)).toBeNull();
    expect(parseBearerToken("")).toBeNull();
    expect(parseBearerToken("Bearer")).toBeNull();
    expect(parseBearerToken("Bearer ")).toBeNull();
    expect(parseBearerToken("Token abc")).toBeNull();
    expect(parseBearerToken("Basic dXNlcjpwYXNz")).toBeNull();
  });
});

describe("delivery route: push_subscriptions query time budget", () => {
  test("resolves passthrough when the query beats the budget", async () => {
    const result = await withPushQueryTimeout(Promise.resolve("row"), 50);
    expect(result).toBe("row");
  });

  test("rejects PushQueryTimeoutError when the budget is exceeded", async () => {
    const hung = new Promise<string>(() => undefined); // never settles
    try {
      await withPushQueryTimeout(hung, 10);
      throw new Error("expected withPushQueryTimeout to reject");
    } catch (err) {
      expect(err).toBeInstanceOf(PushQueryTimeoutError);
      expect((err as Error).name).toBe("PushQueryTimeoutError");
    }
  });

  test("an already-rejected query propagates unchanged (error identity kept)", async () => {
    const boom = new Error("boom");
    try {
      await withPushQueryTimeout(Promise.reject(boom), 50);
      throw new Error("expected rejection");
    } catch (err) {
      expect(err).toBe(boom);
    }
  });
});

describe("delivery route: user-safe subscription-store errors (raw text never leaks)", () => {
  test("missing push_subscriptions table → storage-not-set-up, nothing-sent wording", () => {
    expect(describeSubscriptionStoreError(new Error('relation "public.push_subscriptions" does not exist'))).toContain(
      "storage isn't set up"
    );
    expect(
      describeSubscriptionStoreError(new Error("Could not find the table 'push_subscriptions' in the schema cache"))
    ).toContain("storage isn't set up");
    expect(describeSubscriptionStoreError(new Error("PGRST205 shape error"))).toContain("storage isn't set up");
  });

  test("timeouts map to the took-too-long message", () => {
    expect(describeSubscriptionStoreError(new PushQueryTimeoutError())).toContain("took too long");
    expect(describeSubscriptionStoreError(new Error("Query timed out"))).toContain("took too long");
  });

  test("anything else maps to the reachability message (no exception text leaks)", () => {
    const described = describeSubscriptionStoreError(new Error("jwt malformed segment eyJ..."));
    expect(described).not.toContain("eyJ");
    expect(described).toContain("try again");
    expect(describeSubscriptionStoreError("weird")).toContain("try again");
  });
});
