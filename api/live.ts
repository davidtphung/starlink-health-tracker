import type { VercelRequest, VercelResponse } from "@vercel/node";
import { DataService } from "../server/dataService.js";

const dataService = new DataService();

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const liveData = await dataService.getLiveLaunchData();
    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=300");
    return res.status(200).json(liveData);
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Failed to fetch live launch data" });
  }
}
