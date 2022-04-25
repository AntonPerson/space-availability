import { Time } from "./types";

// A day in miliseconds
export const DAY_IN_MSEC = 86400000; // 24 * 60 * 60 * 1000;
export const MINUTE_IN_MSEC = 60000; // 60 * 1000

/**
 * Compare different times
 * @param timeA - first time to compare
 * @param timeB - second time to compare
 * @returns difference of both times in minutes
 *     - negative, if first time is smaller
 *     + positive, if second time is smaller
 */
export const compareTimes = (timeA: Time, timeB: Time) => {
  const valueA = timeA.hour * 60 + timeA.minute;
  const valueB = timeB.hour * 60 + timeB.minute;
  return valueA - valueB;
};

/**
 * Rounds a given minute to the next increment of 15 minutes
 * @param actualMinute the minute to be rounded, f.e. 22
 * @returns next 15 minutes increment:
 *    [45..59] => 0,
 *    [00..14] => 15,
 *    [15..29] => 30,
 *    [30..44] => 45
 */
export const next15MinutesInterval = (actualMinute: number) =>
  (Math.ceil((actualMinute + 1) / 15) * 15) % 60;

/**
 * Shift time to the next possible 15 minutes increment
 * @param time the time to shift
 * @returns shifted time
 */
export const nextSlot = ({ hour, minute }: Time): Time => {
  const nextMinute = next15MinutesInterval(minute);
  // If we shift into next hour, we need to increase the hour as well
  const nextHour = nextMinute === 0 ? hour + 1 : hour;
  return { hour: nextHour, minute: nextMinute };
};
