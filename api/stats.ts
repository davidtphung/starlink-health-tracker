import type { VercelRequest, VercelResponse } from "@vercel/node";
import { DataService } from "../server/dataService.js";

const dataService = new DataService();

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const stats = await dataService.getConstellationStats();
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(stats);
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
}
