import { OpeningTimes, Space } from "./types";
import {
  dateInTimezone,
  next15MinutesInterval,
  formatIsoDate,
} from "./date-utils";
import { compareTimes } from "./time-utils";

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
  const { open, close } = space.openingTimes[day] || {};

  if (!open || !close) {
    return {};
  }

  const wasOpened = compareTimes({ hour, minute }, open) >= 0;
  if (!wasOpened) {
    return {
      [formatIsoDate(now)]: { open, close },
    };
  }

  return {
    [formatIsoDate(now)]: {
      open: {
        hour,
        minute: next15MinutesInterval(minute),
      },
      close,
    },
  };
};
