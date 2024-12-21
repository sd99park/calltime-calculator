import type { BusinessHours } from "./getCallTimeWindow";

export function buildLuxonCompatibleBusinessHours(
  businessHours: BusinessHours
) {
  return {
    1: businessHours[1],
    2: businessHours[2],
    3: businessHours[3],
    4: businessHours[4],
    5: businessHours[5],
    6: businessHours[6],
    7: businessHours[0],
  };
}
