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
