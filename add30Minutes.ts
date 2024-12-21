import { type DateTime } from "luxon";
import type { BusinessHours } from "./getCallTimeWindow";
import { isInUnavailableDays } from "./isInUnavailableDays";
import { getBusinessHoursAsInterval } from "./businessHours";
import { nextOpenHour } from "./nextOpenHour";

export function add30Minutes(
  currentEndTime: DateTime,
  businessHours: BusinessHours,
  timeZone: string
) {
  let newEndTime = currentEndTime.plus({ minutes: 30 });

  const businessHoursInterval = getBusinessHoursAsInterval(
    newEndTime,
    businessHours
  );

  if (
    isInBusinessHours(newEndTime, businessHours) &&
    !isInUnavailableDays(newEndTime, timeZone)
  ) {
    return newEndTime;
  }

  // TODO: Handle case where it is in business hours but is also on an unavailable day, do we need the diff?
  const diff = businessHoursInterval.end
    ? newEndTime.diff(businessHoursInterval.end).as("minutes")
    : 0; // TODO: is this default fallback fine?

  newEndTime = nextOpenHour(newEndTime, businessHours, timeZone);

  // this sets the new end time for the next business day and adds diff for the time that went over previous days business hours maximum of 30 min
  newEndTime = newEndTime.plus({ minutes: diff > 30 ? 30 : diff });

  return newEndTime;

  // TODO: think about case where diff puts us in unavailable time or outside of business hours
}

function isInBusinessHours(dateTime: DateTime, businessHours: BusinessHours) {
  const businessHoursInterval = getBusinessHoursAsInterval(
    dateTime,
    businessHours
  );

  // contains function is inclusive start/exlusive end so we need to check if the end is equal to the newEndTime
  return (
    businessHoursInterval.contains(dateTime) ||
    businessHoursInterval.end?.equals(dateTime)
  );
}
