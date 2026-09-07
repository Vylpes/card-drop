import { Request, Response } from "express";
import ReloadDB from "../../src/hooks/ReloadDB";
import CardMetadataFunction from "../../src/Functions/CardMetadataFunction";
import AppLogger from "../../src/client/appLogger";

jest.mock("../../src/Functions/CardMetadataFunction");
jest.mock("../../src/client/appLogger");

describe("ReloadDB", () => {
    let res: Response;

    beforeAll(async () => {
        jest.resetAllMocks();

        res = { sendStatus: jest.fn() } as unknown as Response;

        await ReloadDB({} as Request, res);
    });

    test("EXPECT the card metadata to be reloaded", () => {
        expect(CardMetadataFunction.Execute).toHaveBeenCalledTimes(1);
    });

    test("EXPECT a 200 to be returned", () => {
        expect(res.sendStatus).toHaveBeenCalledWith(200);
    });

    test("EXPECT the reload to be logged", () => {
        expect(AppLogger.LogInfo).toHaveBeenCalledWith("Hooks/ReloadDB", "Reloading Card DB...");
    });
});
