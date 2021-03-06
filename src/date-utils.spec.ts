import * as expect from "expect";
import { dateInTimezone, dayAndTimeInTimezone } from "./date-utils";

describe("src/date-utils", () => {
  describe("dateInTimezone(date, timezone)", () => {
    it("transforms a date into a given timezone -> ISO date", () => {
      const result = dateInTimezone(
        new Date(Date.UTC(2020, 8, 7, 1, 22)),
        "America/New_York"
      );
      expect(result).toStrictEqual("2020-09-06");
    });
  });

  describe("dayAndTimeInTimezone(date, timezone)", () => {
    it("transforms a date into a given timezone -> { day, time: { hour, minute } }", () => {
      const result = dayAndTimeInTimezone(
        new Date(Date.UTC(2020, 8, 7, 15, 22)),
        "America/New_York"
      );
      expect(result).toStrictEqual({
        day: 1, // => Monday
        time: {
          hour: 11,
          minute: 22,
        },
      });
    });

    it("uses 0 as day for Sunday", () => {
      const result = dayAndTimeInTimezone(
        new Date(Date.UTC(2020, 8, 6, 15, 22)),
        "America/New_York"
      );
      expect(result.day).toStrictEqual(0);
    });

    it("uses next day if timezone shifts time after midnight", () => {
      const result = dayAndTimeInTimezone(
        new Date(Date.UTC(2020, 8, 6, 22, 22)), // -> London: Sunday evening
        "Asia/Tokyo"
      );
      expect(result.day).toStrictEqual(1); // -> Tokyo: Monday morning
    });

    it("uses last day if timezone shifts time before midnight", () => {
      const result = dayAndTimeInTimezone(
        new Date(Date.UTC(2020, 8, 7, 4, 22)), // -> London: Monday morning
        "America/Los_Angeles"
      );
      expect(result.day).toStrictEqual(0); // -> Los Angeles: Sunday evening
    });
  });
});
