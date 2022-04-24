import { OpeningTimes, Space, Time } from "./types";
import { dateInTimezone, formatIsoDate } from "./date-utils";
import { compareTimes, next15MinutesInterval, DAY_IN_MSEC } from "./time-utils";

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
  const { day, hour, minute } = dateInTimezone(now, space.timeZone);
  const today = fetchAvailabilityForToday(space.openingTimes[day || 7] || {}, {
    hour,
    minute,
  });
  const currentDate = formatIsoDate(now);
  const future = fetchAvailabilityForFutureDays(space, numberOfDays, now);
  return {
    [currentDate]: today,
    ...future,
  };
};

// TODO: should have better signature
/**
 * Calculate availability just for today
 * @param todaysOpeningTimes - the opening times for today
 * @param currentTime - the current time
 * @returns availability for today
 */
export const fetchAvailabilityForToday = (
  { open, close }: OpeningTimes,
  { hour, minute }: Time
): OpeningTimes => {
  if (!open || !close) {
    return {};
  }

  const wasOpened = compareTimes({ hour, minute }, open) >= 0;
  if (!wasOpened) {
    return { open, close };
  }

  const nextMinute = next15MinutesInterval(minute);
  // If we shift into next hour, we need to increase the hour as well
  const nextHour = nextMinute === 0 ? hour + 1 : hour;
  const nextPossibleOpenTime = { hour: nextHour, minute: nextMinute };

  const isClosed = compareTimes(nextPossibleOpenTime, close) >= 0;
  if (isClosed) {
    return {};
  }

  return {
    open: nextPossibleOpenTime,
    close,
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
    availabilities[currentDate] = space.openingTimes[currentDay || 7];
  }
  return availabilities;
};
