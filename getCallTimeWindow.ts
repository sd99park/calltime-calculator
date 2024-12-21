import { DateTime } from "luxon";
import { buildLuxonCompatibleBusinessHours } from "./buildLuxonCompatibleBusinessHours";
import { add30Minutes } from "./add30Minutes";
import { nextOpenHour } from "./nextOpenHour";

export type OperatingDay = { start: string; end: string };
export type NonOperatingDay = { start: null; end: null };
export type BusinessHours = Record<number, OperatingDay | NonOperatingDay>;

/**
 *
 * @param callTime The beginning of the call time window in ISO format
 * @param timeZone The timezone of the call time
 * @param durationMinutes The duration of the call time window in minutes
 * @param businessHours The hours of operation for the branch
 * @returns The call time window in ISO format and UTC timezone
 */
export function getCallTimeWindow(
  callTime: string,
  timeZone: string,
  durationMinutes: number,
  businessHours: BusinessHours
) {
  const luxonCompatibleBusinessHours =
    buildLuxonCompatibleBusinessHours(businessHours);
  // TODO: Verify duration minutes is divisible by minimum duration
  // TODO:  Do initial check if callTimeInterval is in the current day business hours and avoid the loop, maybe?

  const callStart = nextOpenHour(
    DateTime.fromISO(callTime, { zone: timeZone }),
    luxonCompatibleBusinessHours,
    timeZone
  );

  let currentEndTime = callStart;
  let durationMinutesTemp = durationMinutes;
  while (durationMinutesTemp > 0) {
    currentEndTime = add30Minutes(
      currentEndTime,
      luxonCompatibleBusinessHours,
      timeZone
    );
    durationMinutesTemp -= 30;
  }

  return {
    start: callStart?.toJSDate().toISOString(),
    end: currentEndTime?.toJSDate().toISOString(),
  };
}
