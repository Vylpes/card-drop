import { readFileSync } from "fs";
import path from "path";
import Config from "../database/entities/app/Config";
import { glob } from "glob";
import { SeriesMetadata } from "../contracts/SeriesMetadata";
import { CoreClient } from "../client/client";

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
        if (!overrideSafeMode && await Config.GetValue("safemode") == "true") return {
            IsSuccess: false,
            ErrorMessage: "Safe mode is on and not overridden",
        };

        const cardResult = await this.FindMetadataJSONs();

        if (cardResult.IsSuccess) {
            CoreClient.Cards = cardResult.Result!;
            console.log(`Loaded ${CoreClient.Cards.flatMap(x => x.cards).length} cards to database`);

            return {
                IsSuccess: true,
            };
        }

        await Config.SetValue("safemode", "true");

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
                console.log(`Reading file ${jsonPath}`);
                const jsonFile = readFileSync(jsonPath);
                const parsedJson: SeriesMetadata[] = JSON.parse(jsonFile.toString());

                res.push(...parsedJson);
            } catch (e) {
                console.error(e);

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