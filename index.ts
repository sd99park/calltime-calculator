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

const timeZonedCallTimeStart = DateTime.fromISO("2024-03-08T20:11:15.000Z", {
  zone: "America/New_York",
})
  .toJSDate()
  .toISOString();
console.log("Time: ", timeZonedCallTimeStart);
console.log(
  getCallTimeWindow(
    timeZonedCallTimeStart ?? "",
    "America/New_York",
    240,
    businessHours
  )
);

// console.log(nextOpenHour(DateTime.fromISO("2024-12-24T18:00:00.000"), businessHours, "America/Chicago"));

/*
  Method A:
  1. Is the call window engulfed by the current days business hours? Yes, return start + duration
  
  Add 30 minutes and check the following:
    is the interval in a unvailable day?
    is the interval engulfed by business hours?

  Method B:
  1. We know duration 30m - 4hours
    while duration > 0:
      add 30m to start time - this checks if adding outside of business hours or on unavailable days
      remove 30m from duration

  4:15PM with 2h duration
    1st iteration:
      updateStartTime() returns 4:45PM
      duration is now 1.5h
    
    2nd iteration:
      updateStartTime() returns 8:45AM
      duration is now 1h

    3rd iteration:
      updateStartTime() returns 09:15AM
      duration is now 30m

    4th iteration:
      updateStartTime() returns 09:45AM
      duration is now 0m

    updateStartTime(currentEndTime: ISOString) {
      add 30m to currentEndTime
      if within business hours {
        return currentEndTime
      }



      if not within business hours {
        set currentEndTime start business hours of next day with business hours
        
        
      }



      if currentEndTime is outside of business hours
        move to next day and set time to 00:00 and check if in business hours
    }
*/
