/**
 * ⚠️ DEMO DESTINATION DATASET — live-database preview, clearly labelled ⚠️
 *
 * Used ONLY when Supabase credentials are absent, so the destination
 * discovery flow (destination → famous foods → attractions & stays) stays
 * fully testable without a database connection. Every response still
 * carries `mode: "demo"` and the UI shows the DEMO DATA banner.
 *
 * HONESTY: this is NOT invented content. The rows are transcribed 1:1 from
 * supabase/insert-batch-003-destinations-foods.sql (the reviewed,
 * owner-executed seed batch — fixed UUIDs, sourced descriptions, published
 * city coordinates), so demo mode previews exactly what the live database
 * serves. No review/photo/content fabrication rides along with it: demo
 * destination foods have zero curated place links (the link table is
 * evidence-gated), and demo restaurants remain the labelled corridor set.
 */

import type { Destination, DestinationFood } from "@/lib/foodie/types";

/** The three seeded destinations (insert-batch-003, verbatim values). */
export const DEMO_DESTINATIONS: Destination[] = [
  {
    id: "b7e2a1c4-3d59-4f8a-9c21-6e4d0a5b8f31",
    slug: "bengaluru",
    name: "Bengaluru",
    region: "Karnataka",
    country: "India",
    description:
      'Capital of the Indian state of Karnataka, known as India\'s "Garden City" for its parks and greenery.',
    latitude: 12.97889,
    longitude: 77.59167,
  },
  {
    id: "c3d84e17-92ab-4b6e-a7f0-5819d2c4e7b2",
    slug: "tirupati",
    name: "Tirupati",
    region: "Andhra Pradesh",
    country: "India",
    description:
      "City in Andhra Pradesh, home to the renowned Tirumala Venkateswara Temple — a major Hindu pilgrimage site.",
    latitude: 13.6355,
    longitude: 79.4236,
  },
  {
    id: "e5a92c68-14fb-4d3c-b087-7a26f9d3e1c4",
    slug: "mumbai",
    name: "Mumbai",
    region: "Maharashtra",
    country: "India",
    description:
      "Capital of the Indian state of Maharashtra and India's financial capital.",
    latitude: 19.07611,
    longitude: 72.8775,
  },
];

/**
 * The five seeded destination foods (insert-batch-003, verbatim values —
 * descriptions are the same source-backed texts the live database serves).
 * No image_url anywhere: the seed batch deliberately kept images NULL and
 * demo data never invents them.
 */
export const DEMO_DESTINATION_FOODS: DestinationFood[] = [
  {
    id: "a4b6d8f2-5c31-4e97-8d26-90b4c1e3f7a5",
    destinationId: "b7e2a1c4-3d59-4f8a-9c21-6e4d0a5b8f31",
    name: "Benne Masala Dosa",
    description:
      "The buttery (benne) masala dosa that Bengaluru's legacy tiffin rooms are famous for — Vidyarthi Bhavan (est. 1943, Basavanagudi) is an iconic Bengaluru establishment whose crispy, buttery masala dosa is particularly recognized.",
    foodType: "breakfast",
    designation: "famous",
  },
  {
    id: "d2e7f9a3-6b48-4c15-9e73-2f80a6c4d9b1",
    destinationId: "b7e2a1c4-3d59-4f8a-9c21-6e4d0a5b8f31",
    name: "Bisi Bele Bath",
    description:
      "Spicy rice-and-lentil dish with origins in the state of Karnataka — said to have originated in the Mysore Palace kitchen.",
    foodType: "rice dish",
    designation: "local",
  },
  {
    id: "f6c1a9d4-8e25-4b73-a2c9-3d70e5b1f8c2",
    destinationId: "c3d84e17-92ab-4b6e-a7f0-5819d2c4e7b2",
    name: "Tirupati Laddu",
    description:
      "The popular sweet offered as prasadam at the Sri Venkateswara Temple, first introduced in 1715 and made by Tirumala Tirupati Devasthanams. Received a Geographical Indication (GI) tag in 2009.",
    foodType: "sweet / prasadam",
    designation: "signature",
  },
  {
    id: "b9d3e6a7-1f52-4c84-9b06-58e2a7c3d1f4",
    destinationId: "e5a92c68-14fb-4d3c-b087-7a26f9d3e1c4",
    name: "Vada Pav",
    description:
      "Mumbai's iconic affordable street food — a deep-fried potato dumpling in a bread bun, which originated as street food in the city around 1966.",
    foodType: "street food / snack",
    designation: "signature",
  },
  {
    id: "c8a2f5d9-4b17-4e63-8d92-70c5e1a4b6f3",
    destinationId: "e5a92c68-14fb-4d3c-b087-7a26f9d3e1c4",
    name: "Pav Bhaji",
    description:
      "A thick spiced vegetable curry (bhaji) served with a buttered bread roll (pav) — originated as a fast lunchtime dish for textile mill workers in Mumbai.",
    foodType: "street food / main",
    designation: "famous",
  },
];
