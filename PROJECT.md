# Starlink Health Tracker

**Version:** 2.2  
**Date:** April 9, 2026  
**Live:** [starlinkhealth.davidtphung.com](https://starlinkhealth.davidtphung.com/)  
**Author:** [David T Phung](https://x.com/davidtphung)

---

## Overview

Real-time monitoring dashboard for SpaceX's Starlink satellite constellation. Aggregates public data from SpaceX API and CelesTrak to provide orbital health assessments, mission history, booster tracking, and 3D constellation visualization.

## Features

- **Dashboard** — Key constellation metrics, health breakdown, yearly growth charts, recent missions
- **3D Globe** — Interactive Three.js globe with real-time satellite positions color-coded by health status (nominal/degraded/critical)
- **Mission History** — Complete Falcon 9 Starlink launch database with booster serials, flight counts, landing records, searchable and filterable
- **Live Launch** — Countdown timer, webcast links, mission details for next Starlink launch
- **Health Scoring** — Satellite health based on BSTAR drag, orbital eccentricity, and altitude analysis

## Tech Stack

- React 18 + TypeScript
- Three.js / React Three Fiber (3D globe)
- Framer Motion (animations)
- Recharts (data visualization)
- TailwindCSS (styling)
- Express.js (API server)
- Vite (build tool)
- Vercel (deployment)

## Data Sources

- **SpaceX REST API** — Satellite catalog, launch history, core/booster data
- **CelesTrak / Space-Track** — TLE orbital elements, BSTAR drag, GP data

## Design

- Inspired by Starlink's minimal, premium design language
- Inter typeface (clean geometric sans-serif)
- Pure black background with white/opacity-based text hierarchy
- Subtle card borders, restrained color palette
- WCAG 2.1 AA accessible (keyboard nav, ARIA labels, focus indicators)
- Responsive across all device sizes

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.2 | 2026-04-09 | Starlink-inspired redesign: Inter font, minimal nav, refined cards, improved readability, new favicon, removed tech stack from About, updated footer to v2.2 |
| 2.1 | 2025-03-31 | Live launch page with countdown timer and webcast links |
| 2.0 | 2025-02-19 | Golden ratio layout, Helvetica typography, aggregate dashboard |
| 1.0 | 2025-02-17 | Initial release with globe, dashboard, launches |
