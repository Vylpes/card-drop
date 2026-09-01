import TimerHelper from "../../src/helpers/TimerHelper";
import AppLogger from "../../src/client/appLogger";
import { CronJob } from "cron";

jest.mock("../../src/client/appLogger");
jest.mock("cron");

const start = jest.fn();
const stop = jest.fn();

function cronTick() {
    const onTick = (CronJob as unknown as jest.Mock).mock.calls[0][1];

    onTick();
}

describe("TimerHelper", () => {
    beforeEach(() => {
        jest.resetAllMocks();

        (CronJob as unknown as jest.Mock).mockImplementation(() => ({ start, stop }));
    });

    describe("GIVEN a timer is added with runOnStart", () => {
        test("EXPECT the tick to be run once the timer is started", () => {
            const onTick = jest.fn();
            const helper = new TimerHelper();

            helper.AddTimer("* * * * *", "Europe/London", onTick, true);

            expect(onTick).not.toHaveBeenCalled();

            helper.StartAllTimers();

            expect(start).toHaveBeenCalledTimes(1);
            expect(onTick).toHaveBeenCalledTimes(1);
        });
    });

    describe("GIVEN a timer is added without runOnStart", () => {
        test("EXPECT the tick not to be run when the timer is started", () => {
            const onTick = jest.fn();
            const helper = new TimerHelper();

            helper.AddTimer("* * * * *", "Europe/London", onTick, false);
            helper.StartAllTimers();

            expect(start).toHaveBeenCalledTimes(1);
            expect(onTick).not.toHaveBeenCalled();
        });
    });

    describe("GIVEN a synchronous tick throws", () => {
        const error = new Error("tick failed");

        beforeEach(() => {
            const helper = new TimerHelper();

            helper.AddTimer("* * * * *", "Europe/London", () => {
                throw error;
            }, false);

            cronTick();
        });

        test("EXPECT the failure to be logged rather than thrown", () => {
            expect(AppLogger.CatchError).toHaveBeenCalledTimes(1);
            expect(AppLogger.CatchError).toHaveBeenCalledWith("Helpers/TimerHelper", error);
        });
    });

    describe("GIVEN an asynchronous tick rejects", () => {
        const error = new Error("async tick failed");

        beforeEach(async () => {
            const helper = new TimerHelper();

            helper.AddTimer("* * * * *", "Europe/London", () => Promise.reject(error), false);

            cronTick();

            await Promise.resolve();
        });

        test("EXPECT the rejection to be logged rather than left unhandled", () => {
            expect(AppLogger.CatchError).toHaveBeenCalledTimes(1);
            expect(AppLogger.CatchError).toHaveBeenCalledWith("Helpers/TimerHelper", error);
        });
    });

    describe("GIVEN an asynchronous tick resolves", () => {
        beforeEach(async () => {
            const helper = new TimerHelper();

            helper.AddTimer("* * * * *", "Europe/London", () => Promise.resolve(), false);

            cronTick();

            await Promise.resolve();
        });

        test("EXPECT nothing to be logged", () => {
            expect(AppLogger.CatchError).not.toHaveBeenCalled();
        });
    });

    describe("StartTimer and StopTimer", () => {
        test("EXPECT the timer matching the id to be started", () => {
            const helper = new TimerHelper();
            const id = helper.AddTimer("* * * * *", "Europe/London", jest.fn(), false);

            helper.StartTimer(id);

            expect(start).toHaveBeenCalledTimes(1);
        });

        test("EXPECT the timer matching the id to be stopped", () => {
            const helper = new TimerHelper();
            const id = helper.AddTimer("* * * * *", "Europe/London", jest.fn(), false);

            helper.StopTimer(id);

            expect(stop).toHaveBeenCalledTimes(1);
        });

        test("EXPECT an unknown id to be ignored", () => {
            const helper = new TimerHelper();
            helper.AddTimer("* * * * *", "Europe/London", jest.fn(), false);

            helper.StartTimer("not-a-timer");
            helper.StopTimer("not-a-timer");

            expect(start).not.toHaveBeenCalled();
            expect(stop).not.toHaveBeenCalled();
        });
    });

    describe("StopAllTimers", () => {
        test("EXPECT every timer to be stopped", () => {
            const helper = new TimerHelper();

            helper.AddTimer("* * * * *", "Europe/London", jest.fn(), false);
            helper.AddTimer("* * * * *", "Europe/London", jest.fn(), false);

            helper.StopAllTimers();

            expect(stop).toHaveBeenCalledTimes(2);
        });
    });
});
