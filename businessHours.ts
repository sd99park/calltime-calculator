import { DateTime, Interval } from "luxon";
import type {
  BusinessHours,
  NonOperatingDay,
  OperatingDay,
} from "./getCallTimeWindow";

export function getBusinessHours(
  dateTime: DateTime,
  businessHours: BusinessHours
) {
  return businessHours[dateTime.weekday];
}

export function getBusinessHoursAsInterval(
  dateTime: DateTime,
  businessHours: BusinessHours
) {
  const dateBusinessHours = getBusinessHours(dateTime, businessHours);
  // TODO: probably dont throw, return something else if its not operating day, not sure what
  // TODO: could this be on a day that has no business hours?
  if (dateBusinessHours?.start == null || dateBusinessHours?.end == null) {
    throw new Error("Dont call this function if does not have business hours");
  }

  const start = dateTime.set({
    hour: +dateBusinessHours.start?.split(":")[0],
    minute: +dateBusinessHours.start.split(":")[1],
  });
  const end = dateTime.set({
    hour: +dateBusinessHours.end.split(":")[0],
    minute: +dateBusinessHours.end.split(":")[1],
  });
  return Interval.fromDateTimes(start, end);
}

export function getNextBusinessHours(
  dateTime: DateTime,
  businessHours: BusinessHours
) {
  let newEndTime = dateTime;

  let nextBusinessHours: OperatingDay | NonOperatingDay | undefined;
  while (!nextBusinessHours?.start && !nextBusinessHours?.end) {
    newEndTime = newEndTime.plus({ days: 1 }); // friday is 6
    nextBusinessHours = getBusinessHours(newEndTime, businessHours);
  }

  return [newEndTime, nextBusinessHours] as [DateTime, OperatingDay];
}
