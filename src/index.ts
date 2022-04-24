import { OpeningTimes, Space } from "./types";
import { dateInTimezone, formatIsoDate } from "./date-utils";
import { compareTimes, next15MinutesInterval } from "./time-utils";

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

  const currentDate = formatIsoDate(now);

  const wasOpened = compareTimes({ hour, minute }, open) >= 0;
  if (!wasOpened) {
    return {
      [currentDate]: { open, close },
    };
  }

  const nextMinute = next15MinutesInterval(minute);
  // If we shift into next hour, we need to increase the hour as well
  const nextHour = nextMinute === 0 ? hour + 1 : hour;

  const isClosed =
    compareTimes(
      {
        hour: nextHour,
        minute: nextMinute,
      },
      close
    ) >= 0;
  if (isClosed) {
    return {
      [currentDate]: {},
    };
  }

  return {
    [currentDate]: {
      open: {
        hour: nextHour,
        minute: nextMinute,
      },
      close,
    },
  };
};
