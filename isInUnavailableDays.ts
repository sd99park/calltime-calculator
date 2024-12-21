import { Interval, DateTime } from "luxon";

const unavailableDays = [
  { startDate: "2021-09-06T00:00:00", endDate: "2021-09-07T00:00:00" }, // Labor Day
  { startDate: "2021-11-25T00:00:00", endDate: "2021-11-26T00:00:00" }, // Thanksgiving
  { startDate: "2021-12-23T00:00:00", endDate: "2021-12-26T00:00:00" }, // Christmas
  { startDate: "2023-05-29T00:00:00", endDate: "2023-05-30T00:00:00" }, // Memorial Day
  { startDate: "2024-04-08T00:00:00", endDate: "2024-04-09T00:00:00" }, // Monday
  { startDate: "2024-05-07T00:00:00", endDate: "2024-05-08T00:00:00" }, // Tuesday
  { startDate: "2024-03-29T00:00:00", endDate: "2024-03-30T00:00:00" }, // Friday
  { startDate: "2024-03-11T00:00:00", endDate: "2024-03-16T00:00:00" }, // Full Week
  { startDate: "2024-03-08T00:00:00", endDate: "2024-03-09T00:00:00" }, // Friday before full week
  { startDate: "2024-12-25T00:00:00", endDate: "2024-12-26T00:00:00" }, // Christmas day
  { startDate: "2024-12-03T12:00:00", endDate: "2024-12-03T13:00:00" }, // Random firm birthday
];

export function isInUnavailableDays(dateTime: DateTime, timeZone: string) {
  const unavailableDaysIntervals = unavailableDays.map((ud) => {
    const start = DateTime.fromISO(ud.startDate, { zone: timeZone });
    const end = DateTime.fromISO(ud.endDate, { zone: timeZone });
    return Interval.fromDateTimes(start, end);
  });
  // TODO: Filter out invalid intervals if any

  return unavailableDaysIntervals.some((ud) => ud.contains(dateTime));
}

export function getUnavailableInterval(dateTime: DateTime, timeZone: string) {
  const unavailableDaysIntervals = unavailableDays.map((ud) => {
    const start = DateTime.fromISO(ud.startDate, { zone: timeZone });
    const end = DateTime.fromISO(ud.endDate, { zone: timeZone });
    return Interval.fromDateTimes(start, end);
  });
  // TODO: Filter out invalid intervals if any

  return unavailableDaysIntervals.find((ud) => ud.contains(dateTime));
}
