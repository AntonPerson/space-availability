import { Time } from "./types";

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
