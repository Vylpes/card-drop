import { readFileSync } from "fs";
import path from "path";
import Config from "../database/entities/app/Config";
import { glob } from "glob";
import { SeriesMetadata } from "../contracts/SeriesMetadata";
import { CoreClient } from "../client/client";
import AppLogger from "../client/appLogger";
import {CardRarity} from "../constants/CardRarity";

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

            const allCards = CoreClient.Cards.flatMap(x => x.cards);

            const totalCards = allCards.length;
            const bronzeCards = allCards.filter(x => x.type == CardRarity.Bronze)
                .length;
            const silverCards = allCards.filter(x => x.type == CardRarity.Silver)
                .length;
            const goldCards = allCards.filter(x => x.type == CardRarity.Gold)
                .length;
            const mangaCards = allCards.filter(x => x.type == CardRarity.Manga)
                .length;
            const legendaryCards = allCards.filter(x => x.type == CardRarity.Legendary)
                .length;

            AppLogger.LogInfo("Functions/CardMetadataFunction", `Loaded ${totalCards} cards to database (${bronzeCards} bronze, ${silverCards} silver, ${goldCards} gold, ${mangaCards} manga, ${legendaryCards} legendary)`);

            const duplicateCards = CoreClient.Cards.flatMap(x => x.cards)
                .filter((card, index, self) => self.findIndex(c => c.id === card.id) !== index);

            if (duplicateCards.length > 0) {
                AppLogger.LogWarn("Functions/CardMetadataFunction", `Duplicate card ids found: ${duplicateCards.flatMap(x => x.id).join(", ")}`);
            }

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