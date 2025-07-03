'use client';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculates the distance between two geographic coordinates using the Haversine formula.
 * @param p1 The first coordinate.
 * @param p2 The second coordinate.
 * @returns The distance in meters.
 */
export function getDistance(p1: Coordinates, p2: Coordinates): number {
  const R = 6371e3; // Earth's radius in metres
  const φ1 = (p1.latitude * Math.PI) / 180;
  const φ2 = (p2.latitude * Math.PI) / 180;
  const Δφ = ((p2.latitude - p1.latitude) * Math.PI) / 180;
  const Δλ = ((p2.longitude - p1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}

/**
 * Generates a random geographic coordinate within a specified radius from a center point.
 * @param center The center coordinate.
 * @param radius The radius in meters.
 * @returns A new random coordinate.
 */
export function generateRandomPoint(center: Coordinates, radius: number): Coordinates {
  const y0 = center.latitude;
  const x0 = center.longitude;
  
  // Convert radius from meters to degrees
  const rd = radius / 111300;

  const u = Math.random();
  const v = Math.random();

  const w = rd * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);

  // Adjust for longitude shrinking with latitude
  const newX = x / Math.cos(y0 * (Math.PI / 180));

  return {
    latitude: y + y0,
    longitude: newX + x0,
  };
}
