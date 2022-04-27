import { OpeningTimes, Space } from "./types";
import { dateInTimezone } from "./date-utils";
import {
  compareTimes,
  nextSlot,
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

  // Calculate the moment when the advance notice period is over
  const noticeDays = Math.floor(
    (space.minimumNotice * MINUTE_IN_MSEC) / DAY_IN_MSEC
  );
  const { day: startDay } = dateInTimezone(now, space.timeZone);

  const availability: Record<string, OpeningTimes> = {};
  // CASE 1: We are still fully inside the notice period => empty availability
  for (let i = 0; i < noticeDays; i++) {
    const { date } = dateInTimezone(
      new Date(now.valueOf() + i * DAY_IN_MSEC),
      space.timeZone
    );
    availability[date] = {};
  }

  // CASE 2: We are at the day where notice period ends => partial availability
  const afterNotice = new Date(
    now.valueOf() + space.minimumNotice * MINUTE_IN_MSEC
  );
  const { date } = dateInTimezone(afterNotice, space.timeZone);
  availability[date] = fetchPartialAvailability(space, afterNotice);

  // CASE 3: We are completely out of the notice period => full availability
  for (let i = noticeDays + 1; i < numberOfDays; i++) {
    const currentDay = (startDay + i) % 7;
    const currentDate = new Date(now.valueOf() + i * DAY_IN_MSEC);
    const { date } = dateInTimezone(currentDate, space.timeZone);
    availability[date] = space.openingTimes[currentDay || 7] || {};
  }
  return availability;
};

/**
 * Calculate availability for just one day
 * @param space The space to fetch the availability for
 * @param now The time now
 * @returns opening times for the day, f.e.:
 * ```
 *   {
 *     open: { hour: 11, minute: 30 },
 *     close: { hour: 17, minute: 0 },
 *   }
 * ```
 */
export const fetchPartialAvailability = (
  space: Space,
  now: Date
): OpeningTimes => {
  const { day: today } = dateInTimezone(now, space.timeZone);
  const { day, time: currentTime } = dateInTimezone(now, space.timeZone);
  // Advance notice period is too long for today => empty opening time
  if (day != today) {
    return {};
  }

  const { open, close } = space.openingTimes[day || 7] || {};
  if (!open || !close) {
    return {};
  }

  // CASE 1: Space is not opened yet for today => full opening time
  if (compareTimes(currentTime, open) < 0) {
    return { open, close };
  }

  const nextTime = nextSlot(currentTime);

  // CASE 2: Space is already closed for today => empty opening time
  if (compareTimes(nextTime, close) >= 0) {
    return {};
  }

  // CASE 3: Space is already open for today => partial opening time
  return {
    open: nextTime,
    close,
  };
};
