import { OpeningTimes, Space } from "./types";
import {
  dateInTimezone,
  next15MinutesInterval,
  formatIsoDate,
} from "./date-utils";
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
  const currentOpeningTimes = space.openingTimes[day];

  return {
    [formatIsoDate(now)]: {
      open: {
        hour,
        minute: next15MinutesInterval(minute),
      },
      close: currentOpeningTimes.close,
    },
  };
};
