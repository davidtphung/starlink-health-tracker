import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/queryClient";
import type { StarlinkSatellite, SpaceXLaunch, ConstellationStats, FunFact, LiveLaunchData } from "@shared/types";

export function useSatellites() {
  return useQuery<StarlinkSatellite[]>({
    queryKey: ["satellites"],
    queryFn: () => apiFetch("/api/satellites"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLaunches() {
  return useQuery<SpaceXLaunch[]>({
    queryKey: ["launches"],
    queryFn: () => apiFetch("/api/launches"),
    staleTime: 10 * 60 * 1000,
  });
}

export function useStats() {
  return useQuery<ConstellationStats>({
    queryKey: ["stats"],
    queryFn: () => apiFetch("/api/stats"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFunFacts() {
  return useQuery<FunFact[]>({
    queryKey: ["funfacts"],
    queryFn: () => apiFetch("/api/fun-facts"),
    staleTime: 10 * 60 * 1000,
  });
}

export function useLiveLaunch() {
  return useQuery<LiveLaunchData>({
    queryKey: ["live"],
    queryFn: () => apiFetch("/api/live"),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 60 * 1000, // Refetch every 60s for live data
  });
}
