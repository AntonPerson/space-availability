import * as expect from "expect";
import {
  dateInTimezone,
  next15MinutesInterval,
  formatIsoDate,
} from "./date-utils";

describe("src/date-utils", () => {
  describe("dateInTimezone(date, timezone)", () => {
    it("transforms a date into a given timezone -> { day, hour, minute }", () => {
      const result = dateInTimezone(
        new Date(Date.UTC(2020, 8, 7, 15, 22)),
        "America/New_York"
      );
      expect(result).toStrictEqual({
        day: 1,
        hour: 11,
        minute: 22,
      });
    });

    it("uses 7 as day for Sunday", () => {
      const result = dateInTimezone(
        new Date(Date.UTC(2020, 8, 6, 15, 22)),
        "America/New_York"
      );
      expect(result.day).toStrictEqual(7);
    });

    it("uses next day if timezone shifts time after midnight", () => {
      const result = dateInTimezone(
        new Date(Date.UTC(2020, 8, 6, 22, 22)), // -> London: Sunday evening
        "Asia/Tokyo"
      );
      expect(result.day).toStrictEqual(1); // -> Tokyo: Monday morning
    });

    it("uses last day if timezone shifts time before midnight", () => {
      const result = dateInTimezone(
        new Date(Date.UTC(2020, 8, 7, 4, 22)), // -> London: Monday morning
        "America/Los_Angeles"
      );
      expect(result.day).toStrictEqual(7); // -> Los Angeles: Sunday evening
    });
  });

  describe("next15MinutesInterval(minute)", () => {
    it("rounds 22 to 30", () => {
      expect(next15MinutesInterval(22)).toStrictEqual(30);
    });
    it("rounds 59 to 0", () => {
      expect(next15MinutesInterval(59)).toStrictEqual(0);
    });
    it("rounds 70 to 15", () => {
      expect(next15MinutesInterval(70)).toStrictEqual(15);
    });
  });

  describe("formatIsoDate(date)", () => {
    it('formats a date as an ISO string, like "2020-09-07"', () => {
      const isoDate = formatIsoDate(new Date(Date.UTC(2020, 8, 7)));
      expect(isoDate).toStrictEqual("2020-09-07");
    });
  });
});
