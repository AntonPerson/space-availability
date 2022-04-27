import * as expect from "expect";
import { fetchAvailability } from "./index";
import { DAY_IN_MSEC, MINUTE_IN_MSEC } from "./time-utils";
import { Space } from "./types";

describe("src/index", () => {
  describe("a space with no advance notice", () => {
    let space: Space;
    before(async () => {
      space = await import("../fixtures/space-with-no-advance-notice.json");
    });

    describe("fetches availability for a space today", () => {
      it("after the space has already opened", () => {
        const availability = fetchAvailability(
          space,
          1,
          new Date(Date.UTC(2020, 8, 7, 15, 22))
        );

        expect(availability).toStrictEqual({
          "2020-09-07": {
            open: {
              hour: 11,
              minute: 30,
            },
            close: {
              hour: 17,
              minute: 0,
            },
          },
        });
      });

      it("before the space was opened", () => {
        const availability = fetchAvailability(
          space,
          1,
          new Date(Date.UTC(2020, 8, 7, 11, 22))
        );

        expect(availability).toStrictEqual({
          "2020-09-07": {
            open: {
              hour: 9,
              minute: 0,
            },
            close: {
              hour: 17,
              minute: 0,
            },
          },
        });
      });

      it("when the space is about to close", () => {
        const availability = fetchAvailability(
          space,
          1,
          new Date(Date.UTC(2020, 8, 7, 20, 44))
        );

        expect(availability).toStrictEqual({
          "2020-09-07": {
            open: {
              hour: 16,
              minute: 45,
            },
            close: {
              hour: 17,
              minute: 0,
            },
          },
        });
      });

      it("when the space is closing", () => {
        const availability = fetchAvailability(
          space,
          1,
          new Date(Date.UTC(2020, 8, 7, 20, 45))
        );

        expect(availability).toStrictEqual({
          "2020-09-07": {},
        });
      });

      it("after the space was closed already", () => {
        const availability = fetchAvailability(
          space,
          1,
          new Date(Date.UTC(2020, 8, 7, 21, 0))
        );

        expect(availability).toStrictEqual({
          "2020-09-07": {},
        });
      });
    });

    describe("fetches availability for multiple days", () => {
      it("after the space has already opened today + the times for tomorrow", () => {
        const availability = fetchAvailability(
          space,
          2,
          new Date(Date.UTC(2020, 8, 7, 15, 22))
        );

        expect(availability).toStrictEqual({
          "2020-09-07": {
            open: {
              hour: 11,
              minute: 30,
            },
            close: {
              hour: 17,
              minute: 0,
            },
          },
          "2020-09-08": {
            open: {
              hour: 9,
              minute: 0,
            },
            close: {
              hour: 17,
              minute: 0,
            },
          },
        });
      });
    });
  });

  describe("a space with advance notice", () => {
    let space: Space;
    before(async () => {
      space = await import(
        "../fixtures/space-with-30-minutes-advance-notice.json"
      );
    });

    it("fetches availability for a space today with 30 minutes notice", () => {
      const availability = fetchAvailability(
        space,
        1,
        new Date(Date.UTC(2020, 8, 7, 15, 22))
      );

      expect(availability).toStrictEqual({
        "2020-09-07": {
          open: {
            hour: 12,
            minute: 0,
          },
          close: {
            hour: 17,
            minute: 0,
          },
        },
      });
    });

    it("fetches availability for multiple days with a day notice", () => {
      const availability = fetchAvailability(
        { ...space, minimumNotice: DAY_IN_MSEC / MINUTE_IN_MSEC },
        3,
        new Date(Date.UTC(2020, 8, 7, 15, 22))
      );

      expect(availability).toStrictEqual({
        "2020-09-07": {},
        "2020-09-08": {
          open: {
            hour: 11,
            minute: 30,
          },
          close: {
            hour: 17,
            minute: 0,
          },
        },
        "2020-09-09": {
          open: {
            hour: 9,
            minute: 0,
          },
          close: {
            hour: 17,
            minute: 0,
          },
        },
      });
    });
  });
});
