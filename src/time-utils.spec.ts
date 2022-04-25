import * as expect from "expect";
import { compareTimes, next15MinutesInterval, nextSlot } from "./time-utils";

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
    it("rounds 0 to 15", () => {
      expect(next15MinutesInterval(0)).toStrictEqual(15);
    });
    it("rounds 14 to 15", () => {
      expect(next15MinutesInterval(14)).toStrictEqual(15);
    });
    it("rounds 15 to 30", () => {
      expect(next15MinutesInterval(14)).toStrictEqual(15);
    });
    it("rounds 29 to 30", () => {
      expect(next15MinutesInterval(29)).toStrictEqual(30);
    });
    it("rounds 30 to 45", () => {
      expect(next15MinutesInterval(30)).toStrictEqual(45);
    });
    it("rounds 44 to 45", () => {
      expect(next15MinutesInterval(44)).toStrictEqual(45);
    });
    it("rounds 45 to 0", () => {
      expect(next15MinutesInterval(45)).toStrictEqual(0);
    });
    it("rounds 59 to 0", () => {
      expect(next15MinutesInterval(59)).toStrictEqual(0);
    });
    it("rounds 70 to 15", () => {
      expect(next15MinutesInterval(70)).toStrictEqual(15);
    });
  });

  describe("nextPossibleOpenTime", () => {
    it("can shift time to next hour", () => {
      expect(
        nextSlot({
          hour: 1,
          minute: 50,
        })
      ).toStrictEqual({
        hour: 2,
        minute: 0,
      });
    });
  });
});
