import type { VercelRequest, VercelResponse } from "@vercel/node";
import { DataService } from "../server/dataService.js";

const dataService = new DataService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Check for single satellite request
    const { noradId } = req.query;
    const satellites = await dataService.getSatellites();

    if (noradId && typeof noradId === "string") {
      const sat = satellites.find((s) => s.noradId === parseInt(noradId));
      if (!sat) return res.status(404).json({ error: "Satellite not found" });
      return res.status(200).json(sat);
    }

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(satellites);
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Failed to fetch satellite data" });
  }
}
