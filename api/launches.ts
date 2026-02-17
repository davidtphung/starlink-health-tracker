import type { VercelRequest, VercelResponse } from "@vercel/node";
import { DataService } from "../server/dataService.js";

const dataService = new DataService();

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const launches = await dataService.getLaunches();
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=1200");
    return res.status(200).json(launches);
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Failed to fetch launch data" });
  }
}
