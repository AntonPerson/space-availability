/*******************
 * Date utilities
 *******************
 * OPTIONS for libraries considered for timezone calculations:
 *   - moment.js -> 290 kB, feels too heavy for this limited usage
 *   - Luxon -> 70 KB, an improved moment.js
 *   - date-fns -> 90 KB + 9 kB timezone plugin, but feels very nice and functional
 *   - js-joda -> 43 kB + extension that bundles historical timezone data
 *   - Spacetime -> 40 kB, types and docs lack quality
 *   - DayJS -> only 6 KB, already including a modular timezone plugin
 *
 * DECISION: DayJS wins because of its small footprint and simplicity,
 *     while also providing great types and docs:
 *     https://day.js.org/docs/en/timezone/timezone
 *
 * LIMITATION: DayJS depends on the Intl API,
 *     which is not supported yet f.e. in Node 12 (would need a polyfill)
 */
import * as dayjs from "dayjs";
import * as dayjs_plugin_utc from "dayjs/plugin/utc";
import * as dayjs_plugin_timezone from "dayjs/plugin/timezone";

dayjs.extend(dayjs_plugin_utc);
dayjs.extend(dayjs_plugin_timezone);

/**
 * Rounds a given minute to the next increment of 15 minutes
 * @param actualMinute the minute to be rounded, f.e. 22
 * @returns next 15 minutes increment:
 *    [0, 46..60] => 0,
 *    [1..15] => 15,
 *    [16..30] => 30,
 *    [31..45] => 45
 */
export const next15MinutesInterval = (actualMinute: number) =>
  (Math.ceil(actualMinute / 15) * 15) % 60;

/**
 * Transform a date into a different timezone
 * @param date any date, like `new Date()`
 * @param timezone the timezone as IANA timezone string, f.e. "America/New_York"
 *
 * @returns day - day of the week, from 1 as Monday to 7 as Sunday
 * @returns hour - the hour, 0-23
 * @returns minute - the minute, 0-59
 */
export const dateInTimezone = (date: Date, timezone: string) => {
  const dayjsDate = dayjs(date).tz(timezone, false);

  return {
    day: dayjsDate.day() || 7,
    hour: dayjsDate.hour(),
    minute: dayjsDate.minute(),
  };
};

/**
 * Format a date as ISO string
 * @param date any date
 * @returns formatted string, f.e. "2020-09-07"
 */
export const formatIsoDate = (date: Date) =>
  date.toISOString().substring(0, 10);
