import type { DateTime } from "luxon";
import { getBusinessHours, getBusinessHoursAsInterval } from "./businessHours";
import type { BusinessHours } from "./getCallTimeWindow";
import { getUnavailableInterval } from "./isInUnavailableDays";

/**
 * @param dateTime
 * @param businessHours
 * @param timeZone
 * @returns a DateTime set to the next operating hour
 */
export function nextOpenHour(
  dateTime: DateTime,
  businessHours: BusinessHours,
  timeZone: string
): DateTime {
  let nextAvailableTime = dateTime.toISOTime();
  let nextAvailableDate = dateTime;
  if (beforeBusinessHours(nextAvailableDate, businessHours)) {
    nextAvailableTime = getBusinessHours(
      nextAvailableDate,
      businessHours
    )?.start;
  } else if (afterBusinessHours(nextAvailableDate, businessHours)) {
    nextAvailableDate = nextAvailableDate.plus({ days: 1 });
    nextAvailableTime = getBusinessHours(
      nextAvailableDate,
      businessHours
    )?.start;
  }

  while (!isOperatingDay(nextAvailableDate, businessHours)) {
    nextAvailableDate = nextAvailableDate.plus({ days: 1 });

    if (isOperatingDay(nextAvailableDate, businessHours)) {
      nextAvailableTime = getBusinessHours(
        nextAvailableDate,
        businessHours
      ).start;
    }
  }

  const [hour, minute, second] = splitBusinessHour(nextAvailableTime ?? "");

  const newDateTime = nextAvailableDate.set({ hour, minute, second });
  const unavailableInterval = getUnavailableInterval(newDateTime, timeZone);
  if (!!unavailableInterval?.end) {
    return nextOpenHour(unavailableInterval.end, businessHours, timeZone);
  }

  return newDateTime;
}

function beforeBusinessHours(dateTime: DateTime, businessHours: BusinessHours) {
  if (!isOperatingDay(dateTime, businessHours)) {
    return true;
  }

  const businessHoursInterval = getBusinessHoursAsInterval(
    dateTime,
    businessHours
  );

  // isAfter returns if interval.start is after dateTime
  return businessHoursInterval.isAfter(dateTime);
}

function afterBusinessHours(dateTime: DateTime, businessHours: BusinessHours) {
  const businessHoursInterval = getBusinessHoursAsInterval(
    dateTime,
    businessHours
  );

  // isBefore returns if interval.end is before dateTime
  return businessHoursInterval.isBefore(dateTime);
}

function isOperatingDay(dateTime: DateTime, businessHours: BusinessHours) {
  const dateBusinessHours = getBusinessHours(dateTime, businessHours);
  return dateBusinessHours?.start != null && dateBusinessHours?.end != null;
}

function splitBusinessHour(time: string) {
  const splitAvailableTime = time?.split(":") ?? [];
  const hour = splitAvailableTime[0] ? +splitAvailableTime[0] : 0;
  const minute = splitAvailableTime[1] ? +splitAvailableTime[1] : 0;
  const second = splitAvailableTime[2].split(".")[0]
    ? +splitAvailableTime[2].split(".")[0]
    : 0;
  return [hour, minute, second];
}
