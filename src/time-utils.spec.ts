import * as expect from "expect";
import { compareTimes, next15MinutesInterval } from "./time-utils";

describe("src/time-utils", () => {
  describe("compareTimes(timeA, timeB)", () => {
    it("retuns 0 for two equal times", () => {
      const time = { hour: 8, minute: 30 };
      expect(compareTimes(time, time)).toStrictEqual(0);
    });

    it("retuns -diff when timeA < timeB", () => {
      const timeA = { hour: 8, minute: 30 };
      const timeB = { hour: 9, minute: 30 };
      expect(compareTimes(timeA, timeB)).toStrictEqual(-60);
    });

    it("retuns +diff when timeA > timeB", () => {
      const timeA = { hour: 8, minute: 30 };
      const timeB = { hour: 8, minute: 0 };
      expect(compareTimes(timeA, timeB)).toStrictEqual(30);
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
});
