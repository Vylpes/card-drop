import { readFileSync } from "fs";
import path from "path";
import Config from "../database/entities/app/Config";
import { glob } from "glob";
import SeriesMetadata from "../contracts/SeriesMetadata";
import { CoreClient } from "../client/client";

export default class CardMetadataFunction {
    public static async Execute(overrideSafeMode: boolean = false): Promise<boolean> {
        if (!overrideSafeMode && await Config.GetValue('safemode') == "true") return false;

        try {
            CoreClient.Cards = await this.FindMetadataJSONs();

            console.log(`Loaded ${CoreClient.Cards.flatMap(x => x.cards).length} cards to database`);
        } catch (e) {
            console.error(e);

            await Config.SetValue('safemode', 'true');
            return false;
        }

        return true;
    }

    private static async FindMetadataJSONs(): Promise<SeriesMetadata[]> {
        const res: SeriesMetadata[] = [];

        const seriesJSONs = await glob(path.join(process.cwd(), 'cards', '/**/*.json'));

        for (let jsonPath of seriesJSONs) {
            console.log(`Reading file ${jsonPath}`);
            const jsonFile = readFileSync(jsonPath);
            const parsedJson: SeriesMetadata[] = JSON.parse(jsonFile.toString());

            res.push(...parsedJson);
        }

        return res;
    }
}