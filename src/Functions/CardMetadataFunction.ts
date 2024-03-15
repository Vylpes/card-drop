import { readFileSync } from "fs";
import path from "path";
import Config from "../database/entities/app/Config";
import { glob } from "glob";
import { SeriesMetadata } from "../contracts/SeriesMetadata";
import { CoreClient } from "../client/client";
import AppLogger from "../client/appLogger";

export interface CardMetadataResult {
    IsSuccess: boolean;
    ErrorMessage?: string;
}

export interface FindMetadataResult {
    IsSuccess: boolean;
    Result?: SeriesMetadata[];
    Error?: {
        File: string;
        Message: string;
    };
}

export default class CardMetadataFunction {
    public static async Execute(overrideSafeMode: boolean = false): Promise<CardMetadataResult> {
        AppLogger.LogInfo("Functions/CardMetadataFunction", "Executing");

        if (!overrideSafeMode && await Config.GetValue("safemode") == "true") {
            AppLogger.LogWarn("Functions/CardMetadataFunction", "Safe Mode is active, refusing to resync");

            return {
                IsSuccess: false,
                ErrorMessage: "Safe mode is on and not overridden",
            };
        }

        const cardResult = await this.FindMetadataJSONs();

        if (cardResult.IsSuccess) {
            CoreClient.Cards = cardResult.Result!;
            AppLogger.LogInfo("Functions/CardMetadataFunction", `Loaded ${CoreClient.Cards.flatMap(x => x.cards).length} cards to database`);

            return {
                IsSuccess: true,
            };
        }

        await Config.SetValue("safemode", "true");
        AppLogger.LogError("Functions/CardMetadataFunction", `Safe Mode activated due to error: ${cardResult.Error!.Message}`);

        return {
            IsSuccess: false,
            ErrorMessage: `${cardResult.Error!.File}: ${cardResult.Error!.Message}`,
        };
    }

    private static async FindMetadataJSONs(): Promise<FindMetadataResult> {
        const res: SeriesMetadata[] = [];

        const seriesJSONs = await glob(path.join(process.env.DATA_DIR!, "cards", "/**/*.json"));

        for (const jsonPath of seriesJSONs) {
            try {
                AppLogger.LogVerbose("Functions/CardMetadataFunction", `Reading file ${jsonPath}`);
                const jsonFile = readFileSync(jsonPath);
                const parsedJson: SeriesMetadata[] = JSON.parse(jsonFile.toString());

                res.push(...parsedJson);
            } catch (e) {
                AppLogger.LogError("Functions/CardMetadataFunction", `Error reading file ${jsonPath}: ${e}`);

                return {
                    IsSuccess: false,
                    Error: {
                        File: jsonPath,
                        Message: `${e}`,
                    }
                };
            }
        }

        return {
            IsSuccess: true,
            Result: res,
        };
    }
}