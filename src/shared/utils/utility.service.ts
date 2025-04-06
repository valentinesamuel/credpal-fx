import { Injectable } from "@nestjs/common";

@Injectable()
export class UtilityService {
  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  /**
   * Calculate the distance between two points using the Haversine formula
   *
   * @param lat1 - Latitude of the first point in degrees
   * @param lng1 - Longitude of the first point in degrees
   * @param lat2 - Latitude of the second point in degrees
   * @param lng2 - Longitude of the second point in degrees
   * @returns The distance between the points in kilometers
   */
  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    // Earth's radius in kilometers
    const earthRadiusKm = 6371;

    // Convert latitude and longitude from degrees to radians
    const lat1Rad = this.degreesToRadians(lat1);
    const lng1Rad = this.degreesToRadians(lng1);
    const lat2Rad = this.degreesToRadians(lat2);
    const lng2Rad = this.degreesToRadians(lng2);

    // Calculate differences
    const latDiff = lat2Rad - lat1Rad;
    const lngDiff = lng2Rad - lng1Rad;

    // Haversine formula
    const a =
      Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
      Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(lngDiff / 2) *
        Math.sin(lngDiff / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadiusKm * c;

    // Round to 1 decimal place
    return Math.round(distance * 10) / 10;
  }
}
