import type { Express } from "express";
import { DataService } from "./dataService.js";

const dataService = new DataService();

export function registerRoutes(app: Express) {
  // Get all Starlink satellites with orbital data
  app.get("/api/satellites", async (_req, res) => {
    try {
      const satellites = await dataService.getSatellites();
      res.json(satellites);
    } catch (err) {
      console.error("Error fetching satellites:", err);
      res.status(500).json({ error: "Failed to fetch satellite data" });
    }
  });

  // Get constellation statistics
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await dataService.getConstellationStats();
      res.json(stats);
    } catch (err) {
      console.error("Error fetching stats:", err);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Get all Starlink launches with rocket/booster info
  app.get("/api/launches", async (_req, res) => {
    try {
      const launches = await dataService.getLaunches();
      res.json(launches);
    } catch (err) {
      console.error("Error fetching launches:", err);
      res.status(500).json({ error: "Failed to fetch launch data" });
    }
  });

  // Get fun facts
  app.get("/api/fun-facts", async (_req, res) => {
    try {
      const facts = await dataService.getFunFacts();
      res.json(facts);
    } catch (err) {
      console.error("Error fetching fun facts:", err);
      res.status(500).json({ error: "Failed to fetch fun facts" });
    }
  });

  // Get live/upcoming launch data
  app.get("/api/live", async (_req, res) => {
    try {
      const liveData = await dataService.getLiveLaunchData();
      res.json(liveData);
    } catch (err) {
      console.error("Error fetching live data:", err);
      res.status(500).json({ error: "Failed to fetch live launch data" });
    }
  });

  // Single satellite detail
  app.get("/api/satellites/:noradId", async (req, res) => {
    try {
      const satellites = await dataService.getSatellites();
      const sat = satellites.find((s) => s.noradId === parseInt(req.params.noradId));
      if (!sat) {
        return res.status(404).json({ error: "Satellite not found" });
      }
      res.json(sat);
    } catch (err) {
      console.error("Error fetching satellite:", err);
      res.status(500).json({ error: "Failed to fetch satellite" });
    }
  });
}
