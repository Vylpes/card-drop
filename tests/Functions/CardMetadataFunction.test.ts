import CardMetadataFunction, {CardMetadataResult} from "../../src/Functions/CardMetadataFunction";
import AppLogger from "../../src/client/appLogger";
import Config from "../../src/database/entities/app/Config";
import { glob } from "glob";
import { readFileSync } from "fs";
import {SeriesMetadata} from "../../src/contracts/SeriesMetadata";
import GenerateSeriesMetadata from "../__functions__/card-drop/GenerateSeriesMetadata";

jest.mock("glob", () => ({ glob: jest.fn() }));
jest.mock("fs", () => ({ ...jest.requireActual('fs'), readFileSync: jest.fn() }));

const mockedGlob = glob as unknown as jest.Mock;
const mockedReadFileSync = readFileSync as unknown as jest.Mock;

let LogWarnSpy: jest.SpyInstance;
let LogErrorSpy: jest.SpyInstance;

const pathA = "/data/seriesA/a.json";
const pathB = "/data/seriesB/b.json";

let seriesA: SeriesMetadata[];
let seriesB: SeriesMetadata[];

beforeEach(() => {
    jest.resetAllMocks();

    process.env.DATA_DIR = "/data";

    jest.spyOn(AppLogger, "LogInfo").mockImplementation(() => {});
    LogWarnSpy = jest.spyOn(AppLogger, "LogWarn").mockImplementation(() => {});
    LogErrorSpy = jest.spyOn(AppLogger, "LogError").mockImplementation(() => {});
    jest.spyOn(AppLogger, "LogVerbose").mockImplementation(() => {});

    Config.GetValue = jest.fn(async (): Promise<string | undefined> => {
        return "";
    });
    Config.SetValue = jest.fn();

    mockedGlob.mockResolvedValue([ pathA, pathB ]);

    mockedReadFileSync.mockImplementation((p: string) => {
        if (p == pathA) return JSON.stringify(seriesA);
        if (p == pathB) return JSON.stringify(seriesB);
        return "[]";
    });

    seriesA = GenerateSeriesMetadata(1, "Series A");
    seriesB = GenerateSeriesMetadata(2, "Series B");
});

describe("FindMetadataResult", () => {
    describe("GIVEN parsedJson has no series", () => {
        let res: CardMetadataResult;

        beforeEach(async () => {
            seriesA = [];

            res = await CardMetadataFunction.Execute();
        });

        test("EXPECT result to be successful", () => {
            expect(res).toBeDefined();
            expect(res.IsSuccess).toBe(true);
            expect(res.ErrorMessage).toBeUndefined();
        });

        test("EXPECT warning to be logged", () => {
            expect(LogWarnSpy).toHaveBeenCalledTimes(1);
            expect(LogWarnSpy).toHaveBeenCalledWith("Functions/CardMetadataFunction", "No series found in file: /data/seriesA/a.json");
        });
    });

    describe("GIVEN parsedJson[0] doesn't have a cards object", () => {
        let res: CardMetadataResult;

        beforeEach(async () => {
            seriesA = GenerateSeriesMetadata(1, "Series A", 1, 0);

            res = await CardMetadataFunction.Execute();
        });

        test("EXPECT failure returned", () => {
            expect(res).toBeDefined();
            expect(res.IsSuccess).toBe(false);
            expect(res.ErrorMessage).toBe("/data/seriesA/a.json: No cards found in series");
        });

        test("EXPECT error to be logged", () => {
            expect(LogErrorSpy).toHaveBeenCalledTimes(2);
            expect(LogErrorSpy).toHaveBeenCalledWith("Functions/CardMetadataFunction", "No cards found in series: /data/seriesA/a.json");
        });
    });

    describe("GIVEN parsedJson[1] doesn't have a cards object", () => {
        let res: CardMetadataResult;

        beforeEach(async () => {
            seriesA = GenerateSeriesMetadata(1, "Series A", 2, [1, 0]);

            res = await CardMetadataFunction.Execute();
        });

        test("EXPECT failure returned", () => {
            expect(res).toBeDefined();
            expect(res.IsSuccess).toBe(false);
            expect(res.ErrorMessage).toBe("/data/seriesA/a.json: No cards found in series");
        });

        test("EXPECT error to be logged", () => {
            expect(LogErrorSpy).toHaveBeenCalledTimes(2);
            expect(LogErrorSpy).toHaveBeenCalledWith("Functions/CardMetadataFunction", "No cards found in series: /data/seriesA/a.json");
        });
    });
});