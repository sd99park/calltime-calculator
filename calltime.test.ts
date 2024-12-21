import { describe, expect, test } from "bun:test";
import { DateTime } from "luxon";
import { getCallTimeWindow } from "./getCallTimeWindow";

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

describe("getCallTimeWindow", () => {
  describe("when the call start time + duration are within the business hours for the current day", () => {
    const callTimeStart = "2024-10-09T10:00:00.000";
    const durationMinutes = 120;
    test("it should return a call time start and end within the current day", () => {
      const callTimeWindow = getCallTimeWindow(
        callTimeStart,
        timeZone_chicago,
        durationMinutes,
        businessHours
      );
      expect(callTimeWindow.start).toBe("2024-10-09T15:00:00.000Z");
      expect(callTimeWindow.end).toBe("2024-10-09T17:00:00.000Z");
    });
  });

  describe("when the call start time + duration is outside business hours for the current day", () => {
    const durationMinutes = 120;
    describe("and the remaining duration is within business hours for the next day", () => {
      test("it should return a call window starting current day and ending the next day", () => {
        const callTimeStart = "2024-10-23T16:00:00.000";
        const callTimeWindow = getCallTimeWindow(
          callTimeStart,
          timeZone_chicago,
          durationMinutes,
          businessHours
        );
        expect(callTimeWindow.start).toBe("2024-10-23T21:00:00.000Z");
        expect(callTimeWindow.end).toBe("2024-10-24T14:30:00.000Z");
      });
    });

    describe("and the reamining duration is not within business hours for the next day", () => {
      test("it should return a call window starting current day and ending the next day with business hours", () => {
        const callTimeStart = "2024-10-25T16:00:00.000";
        const callTimeWindow = getCallTimeWindow(
          callTimeStart,
          timeZone_chicago,
          durationMinutes,
          businessHours
        );
        expect(callTimeWindow.start).toBe("2024-10-25T21:00:00.000Z");
        expect(callTimeWindow.end).toBe("2024-10-28T14:30:00.000Z");
      });
    });
  });

  describe("getCallTimeWindow 4 hours duration tests", () => {
    const testCases = [
      [
        "2021-08-20T20:00:00.000Z",
        "2021-08-20T20:00:00.000Z",
        "2021-08-23T15:30:00.000Z",
        "end of business hours, goes over weekend 1",
      ],
      [
        "2021-08-20T17:15:00.000Z",
        "2021-08-20T17:15:00.000Z",
        "2021-08-23T12:45:00.000Z",
        "end of business hours, goes over weekend 2",
      ],
      [
        "2021-06-28T23:00:00.000Z",
        "2021-06-29T12:30:00.000Z",
        "2021-06-29T16:30:00.000Z",
        "after hours, finds next morning",
      ],
      [
        "2021-06-28T11:30:00.000Z",
        "2021-06-28T12:30:00.000Z",
        "2021-06-28T16:30:00.000Z",
        "before hours, finds that morning",
      ],
      [
        "2021-09-06T13:00:00.000Z",
        "2021-09-07T12:30:00.000Z",
        "2021-09-07T16:30:00.000Z",
        "sunday, finds next morning",
      ],
      [
        "2021-06-28T15:30:00.000Z",
        "2021-06-28T15:30:00.000Z",
        "2021-06-28T19:30:00.000Z",
        "during day, still same day",
      ],
      [
        "2021-06-28T19:30:00.000Z",
        "2021-06-28T19:30:00.000Z",
        "2021-06-29T15:00:00.000Z",
        "end of business hours, finds next morning",
      ],
      [
        "2021-09-05T13:00:00.000Z",
        "2021-09-07T12:30:00.000Z",
        "2021-09-07T16:30:00.000Z",
        "on saturday, finds monday morning",
      ],
      // Monday holiday
      [
        "2024-04-05T20:11:15.000Z",
        "2024-04-05T20:11:15.000Z",
        "2024-04-09T15:41:00.000Z",
        "on Friday EOD, should return Tuesday",
      ],
      [
        "2024-04-05T22:11:15.000Z",
        "2024-04-09T12:30:00.000Z",
        "2024-04-09T16:30:00.000Z",
        "on Friday after hours, should return Tuesday",
      ],
      [
        "2024-04-06T20:11:15.000Z",
        "2024-04-09T12:30:00.000Z",
        "2024-04-09T16:30:00.000Z",
        "on Saturday, should return Tuesday",
      ],
      [
        "2024-04-07T20:11:15.000Z",
        "2024-04-09T12:30:00.000Z",
        "2024-04-09T16:30:00.000Z",
        "on Sunday, should return Tuesday",
      ],
      [
        "2024-04-08T23:11:15.000Z",
        "2024-04-09T12:30:00.000Z",
        "2024-04-09T16:30:00.000Z",
        "on Monday, should return Tuesday",
      ],
      // Tuesday holiday
      [
        "2024-05-06T20:11:15.000Z",
        "2024-05-06T20:11:15.000Z",
        "2024-05-08T15:41:00.000Z",
        "on Monday EOD, should return Wednesday",
      ],
      [
        "2024-05-06T23:11:15.000Z",
        "2024-05-08T12:30:00.000Z",
        "2024-05-08T16:30:00.000Z",
        "on Monday after hours, should return Wednesday",
      ],
      [
        "2024-05-07T22:11:15.000Z",
        "2024-05-08T12:30:00.000Z",
        "2024-05-08T16:30:00.000Z",
        "on Tuesday, should return Wednesday",
      ],
      // Friday holiday
      [
        "2024-03-28T20:11:15.000Z",
        "2024-03-28T20:11:15.000Z",
        "2024-04-01T15:41:00.000Z",
        "on Thursday EOD, should return Monday",
      ],
      [
        "2024-03-28T22:11:15.000Z",
        "2024-04-01T12:30:00.000Z",
        "2024-04-01T16:30:00.000Z",
        "on Thursday after hours, should return Monday",
      ],
      [
        "2024-03-29T22:11:15.000Z",
        "2024-04-01T12:30:00.000Z",
        "2024-04-01T16:30:00.000Z",
        "on Friday, should return Monday",
      ],
      // Full week holiday and prior Friday holiday
      [
        "2024-03-07T20:11:15.000Z",
        "2024-03-07T20:11:15.000Z",
        "2024-03-18T14:41:00.000Z",
        "on prior Thursday EOD, should return next Monday",
      ],
      [
        "2024-03-07T20:11:15.000Z",
        "2024-03-07T20:11:15.000Z",
        "2024-03-18T14:41:00.000Z",
        "on prior Thursday after hours, should return next Monday",
      ],
      [
        "2024-03-08T20:11:15.000Z",
        "2024-03-18T12:30:00.000Z",
        "2024-03-18T16:30:00.000Z",
        "on prior Friday EOD, should return next Monday",
      ],
      [
        "2024-03-08T22:11:15.000Z",
        "2024-03-18T12:30:00.000Z",
        "2024-03-18T16:30:00.000Z",
        "on prior Friday after hours, should return next Monday",
      ],
      [
        "2024-03-09T20:11:15.000Z",
        "2024-03-18T12:30:00.000Z",
        "2024-03-18T16:30:00.000Z",
        "on Saturday, should return next Monday",
      ],
      [
        "2024-03-10T20:11:15.000Z",
        "2024-03-18T12:30:00.000Z",
        "2024-03-18T16:30:00.000Z",
        "on Sunday, should return next Monday",
      ],
      [
        "2024-03-11T20:11:15.000Z",
        "2024-03-18T12:30:00.000Z",
        "2024-03-18T16:30:00.000Z",
        "on Monday, should return next Monday",
      ],
    ];

    testCases.forEach(
      ([
        callTimeStart,
        expectedcallTimeStart,
        expectedcallTimeEnd,
        message,
      ]) => {
        test(message, () => {
          const timeZonedCallTimeStart = DateTime.fromISO(callTimeStart, {
            zone: timeZone_new_york,
          }).toISO({ includeOffset: false });

          if (!timeZonedCallTimeStart) {
            throw new Error("Time cannot be null");
          }

          const callTimeWindow = getCallTimeWindow(
            timeZonedCallTimeStart,
            timeZone_new_york,
            240,
            businessHours
          );

          expect(callTimeWindow.start).toBe(expectedcallTimeStart);
          expect(callTimeWindow.end).toBe(expectedcallTimeEnd);
        });
      }
    );
  });
});
