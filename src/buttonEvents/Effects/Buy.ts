import {ButtonInteraction} from "discord.js";
import AppLogger from "../../client/appLogger";

export default class Buy {
    public static async Execute(interaction: ButtonInteraction) {
        const subaction = interaction.customId.split(" ")[2];

        switch (subaction) {
            case "confirm":
                await this.Confirm(interaction);
                break;
            case "cancel":
                await this.Cancel(interaction);
                break;
            default:
                AppLogger.LogError("Buy", `Unknown subaction, effects ${subaction}`);
        }
    }

    private static async Confirm(interaction: ButtonInteraction) {
    }

    private static async Cancel(interaction: ButtonInteraction) {
    }
}
