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
  return {
    ...fetchAvailabilityForToday(space, numberOfDays, now),
    ...fetchAvailabilityForFutureDays(space, numberOfDays, now),
  };
};

/**
 * Calculate availability just for today
 * @param space The space to fetch the availability for
 * @param numberOfDays The number of days from `now` to fetch availability for
 * @param now The time now
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
  numberOfDays: number,
  now: Date
): Record<string, OpeningTimes> => {
  if (!numberOfDays || numberOfDays < 1) {
    return {};
  }
  const nowWithNotice = new Date(
    now.valueOf() + space.minimumNotice * MINUTE_IN_MSEC
  );
  const { day, hour, minute } = dateInTimezone(nowWithNotice, space.timeZone);
  const currentDate = formatIsoDate(nowWithNotice);

  const { open, close } = space.openingTimes[day || 7] || {};
  if (!open || !close) {
    return { [currentDate]: {} };
  }

  const wasOpened = compareTimes({ hour, minute }, open) >= 0;
  if (!wasOpened) {
    return { [currentDate]: { open, close } };
  }

  const nextMinute = next15MinutesInterval(minute);
  // If we shift into next hour, we need to increase the hour as well
  const nextHour = nextMinute === 0 ? hour + 1 : hour;
  const nextPossibleOpenTime = { hour: nextHour, minute: nextMinute };

  const isClosed = compareTimes(nextPossibleOpenTime, close) >= 0;
  if (isClosed) {
    return { [currentDate]: {} };
  }

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
 * @param numberOfDays The number of days from `now` to fetch availability for
 * @param now The time now
 * @returns availabilities for future days, f.e.:
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
  numberOfDays: number,
  now: Date
): Record<string, OpeningTimes> => {
  if (numberOfDays < 2) {
    return {};
  }
  const { day } = dateInTimezone(now, space.timeZone);
  const startDay = (day + 1) % 7;

  const availabilities: Record<string, OpeningTimes> = {};
  for (let i = 0; i < numberOfDays - 1; i++) {
    const currentDay = (startDay + i) % 7;
    const currentDate = formatIsoDate(
      new Date(now.valueOf() + (i + 1) * DAY_IN_MSEC)
    );
    availabilities[currentDate] = space.openingTimes[currentDay || 7] || {};
  }
  return availabilities;
};
