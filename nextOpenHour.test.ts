import { describe, expect, test } from "bun:test";
import { DateTime } from "luxon";
import { nextOpenHour } from "./nextOpenHour";

const businessHours = {
  0: { start: null, end: null },
  1: { start: "08:30:000", end: "17:00:000" },
  2: { start: "08:30:000", end: "17:00:000" },
  3: { start: "08:30:000", end: "17:00:000" },
  4: { start: "08:30:000", end: "17:00:000" },
  5: { start: "08:30:000", end: "17:00:000" },
  6: { start: null, end: null },
};

const timeZone_chicago = "America/Chicago";
const timeZone_new_york = "America/New_York";

describe("nextOpenHour", () => {
  const testCases = [
    [
      "2024-10-08T12:00:00.000",
      "2024-10-08T12:00:00.000",
      "during the day in business hours",
    ],
    [
      "2024-10-08T07:00:00.000",
      "2024-10-08T08:30:00.000",
      "before business hours on business day",
    ],
    [
      "2024-10-07T18:00:00.000",
      "2024-10-08T08:30:00.000",
      "after business hours on business day",
    ],
    [
      "2024-10-06T18:00:00.000",
      "2024-10-07T08:30:00.000",
      "sunday night, should be monday morning",
    ],
    [
      "2024-10-05T18:00:00.000",
      "2024-10-07T08:30:00.000",
      "saturday night, should be monday morning",
    ],
    [
      "2024-10-04T18:00:00.000",
      "2024-10-07T08:30:00.000",
      "friday night, should be monday morning",
    ],
    [
      "2024-12-24T18:00:00.000",
      "2024-12-26T08:30:00.000",
      "xmas eve after hours, should be morning day after xmas",
    ],
    [
      "2024-03-08T18:00:00.000",
      "2024-03-18T08:30:00.000",
      "friday night, before a week off, should be monday morning week later",
    ],
    [
      "2024-12-03T12:00:00.000",
      "2024-12-03T13:00:00.000",
      "start of birthday party, should be after party",
    ],
    [
      "2024-12-03T12:20:00.000",
      "2024-12-03T13:00:00.000",
      "middle of birthday party, should be after party",
    ],
    [
      "2024-12-03T13:00:00.000",
      "2024-12-03T13:00:00.000",
      "end of birthday party, should be same time",
    ],
    [
      "2024-03-08T12:00:00.000",
      "2024-03-18T08:30:00.000",
      "during unavailable date, before weekend, before holiday, before weekend, should be next monday",
    ],
    // Monday holiday
    [
      "2024-04-08T16:11:15.000",
      "2024-04-09T08:30:00.000",
      "On Monday, should return Tuesday",
    ],
    [
      "2024-04-07T16:11:15.000",
      "2024-04-09T08:30:00.000",
      "On Sunday, should return Tuesday",
    ],
    [
      "2024-04-06T16:11:15.000",
      "2024-04-09T08:30:00.000",
      "On Saturday, should return Tuesday",
    ],
    [
      "2024-04-05T18:11:15.000",
      "2024-04-09T08:30:00.000",
      "On Friday after hours, should return Tuesday",
    ],
    // Tuesday holiday
    [
      "2024-05-07T16:11:15.000",
      "2024-05-08T08:30:00.000",
      "On Tuesday holiday, should return Wednesday",
    ],
    [
      "2024-05-06T18:11:15.000",
      "2024-05-08T08:30:00.000",
      "On Monday after hours, should return Wednesday",
    ],
    // Friday holiday
    [
      "2024-03-29T16:11:15.000",
      "2024-04-01T08:30:00.000",
      "On Friday holiday, should return Monday",
    ],
    [
      "2024-03-28T18:11:15.000",
      "2024-04-01T08:30:00.000",
      "On Thursday after hours, should return Monday",
    ],
    // Full week holiday
    [
      "2024-03-08T18:11:15.000",
      "2024-03-18T08:30:00.000",
      "On prior Friday after hours, should return next Monday",
    ],
    [
      "2024-03-09T16:11:15.000",
      "2024-03-18T08:30:00.000",
      "On prior Saturday, should return next Monday",
    ],
    [
      "2024-03-10T16:11:15.000",
      "2024-03-18T08:30:00.000",
      "On prior Sunday, should return next Monday",
    ],
    [
      "2024-03-11T16:11:15.000",
      "2024-03-18T08:30:00.000",
      "On Monday, should return next Monday",
    ],
    [
      "2024-03-12T16:11:15.000",
      "2024-03-18T08:30:00.000",
      "On Tuesday, should return Monday",
    ],
    [
      "2024-03-13T16:11:15.000",
      "2024-03-18T08:30:00.000",
      "On Wednesday, should return Monday",
    ],
    [
      "2024-03-14T16:11:15.000",
      "2024-03-18T08:30:00.000",
      "On Thursday, should return Monday",
    ],
    [
      "2024-03-15T16:11:15.000",
      "2024-03-18T08:30:00.000",
      "On Friday, should return Monday",
    ],
    [
      "2024-03-16T16:11:15.000",
      "2024-03-18T08:30:00.000",
      "On Saturday, should return Monday",
    ],
    // After business hours, no holiday
    [
      "2024-06-07T18:11:15.000",
      "2024-06-10T08:30:00.000",
      "On Friday after hours, should return Monday",
    ],
  ];

  testCases.forEach(([initialTime, expectedNextOpenHour, message]) => {
    test(message, () => {
      const initialDateTime = DateTime.fromISO(initialTime, {
        zone: timeZone_chicago,
      });

      const openHour = nextOpenHour(
        initialDateTime,
        businessHours,
        timeZone_chicago
      );
      expect(openHour.toISO({ includeOffset: false })).toBe(
        expectedNextOpenHour
      );
    });
  });
});
