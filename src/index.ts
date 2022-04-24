import { OpeningTimes, Space } from "./types";
import { dateInTimezone, formatIsoDate } from "./date-utils";
import {
  compareTimes,
  next15MinutesInterval,
  DAY_IN_MSEC,
  MINUTE_IN_MSEC,
} from "./time-utils";

/**
 * Fetches upcoming availability for a space
 * @param space The space to fetch the availability for
 * @param numberOfDays The number of days from `now` to fetch availability for
 * @param now The time now
 */
export const fetchAvailability = (
  space: Space,
  numberOfDays: number,
  now: Date
): Record<string, OpeningTimes> => {
  if (!numberOfDays || numberOfDays < 1) {
    return {};
  }
  const afterNotice = new Date(
    now.valueOf() + space.minimumNotice * MINUTE_IN_MSEC
  );

  return {
    ...fetchAvailabilityForToday(space, afterNotice),
    ...fetchAvailabilityForFutureDays(space, afterNotice, numberOfDays - 1),
  };
};

/**
 * Calculate availability just for today
 * @param space The space to fetch the availability for
 * @param afterNotice The current date after the notice period
 * @returns availability for today, f.e.:
 *   {
 *     "2020-09-07": {
 *       open: {
 *         hour: 11,
 *         minute: 30,
 *       },
 *       close: {
 *         hour: 17,
 *         minute: 0,
 *       },
 *     },
 *   }
 */
export const fetchAvailabilityForToday = (
  space: Space,
  afterNotice: Date
): Record<string, OpeningTimes> => {
  const { day, hour, minute } = dateInTimezone(afterNotice, space.timeZone);
  const currentDate = formatIsoDate(afterNotice);

  const { open, close } = space.openingTimes[day || 7] || {};
  if (!open || !close) {
    return { [currentDate]: {} };
  }

  // CASE 1: Space is not opened yet for today => full opening time
  const wasOpened = compareTimes({ hour, minute }, open) >= 0;
  if (!wasOpened) {
    return { [currentDate]: { open, close } };
  }

  const nextMinute = next15MinutesInterval(minute);
  // If we shift into next hour, we need to increase the hour as well
  const nextHour = nextMinute === 0 ? hour + 1 : hour;
  const nextPossibleOpenTime = { hour: nextHour, minute: nextMinute };

  // CASE 2: Space is already closed for today => empty opening time
  const isClosed = compareTimes(nextPossibleOpenTime, close) >= 0;
  if (isClosed) {
    return { [currentDate]: {} };
  }

  // CASE 3: Space is already open for today => partial opening time
  return {
    [currentDate]: {
      open: nextPossibleOpenTime,
      close,
    },
  };
};

/**
 * Calculate availability for tomorrow and all future days
 * @param space The space to fetch the availability for
 * @param afterNotice The current date after the notice period
 * @param numberOfDays The number of days starting from tomorrow to fetch availability for
 *                     (f.e. just tomorrow => numberOfDays = 1)
 * @returns availability for future days, f.e.:
 *   {
 *     "2020-09-08": {
 *       open: {
 *         hour: 9,
 *         minute: 0,
 *       },
 *       close: {
 *         hour: 17,
 *         minute: 0,
 *       },
 *     },
 *   }
 */
export const fetchAvailabilityForFutureDays = (
  space: Space,
  afterNotice: Date,
  numberOfDays: number
): Record<string, OpeningTimes> => {
  if (numberOfDays < 1) {
    return {};
  }

  const { day } = dateInTimezone(afterNotice, space.timeZone);
  // Start tomorrow, as today will already be handled in fetchAvailabilityForToday
  const startDay = (day + 1) % 7;
  const startDateMs = afterNotice.valueOf() + DAY_IN_MSEC;

  const availability: Record<string, OpeningTimes> = {};
  for (let i = 0; i < numberOfDays; i++) {
    const currentDay = (startDay + i) % 7;
    const currentDate = formatIsoDate(new Date(startDateMs + i * DAY_IN_MSEC));
    availability[currentDate] = space.openingTimes[currentDay || 7] || {};
  }
  return availability;
};
