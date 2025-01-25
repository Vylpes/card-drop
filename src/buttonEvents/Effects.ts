import { ButtonInteraction } from "discord.js";
import { ButtonEvent } from "../type/buttonEvent";
import List from "./Effects/List";
import Use from "./Effects/Use";
import AppLogger from "../client/appLogger";

export default class Effects extends ButtonEvent {
    public override async execute(interaction: ButtonInteraction) {
        const action = interaction.customId.split(" ")[1];

        switch (action) {
            case "list":
                await List(interaction);
                break;
            case "use":
                await Use.Execute(interaction);
                break;
            default:
                AppLogger.LogError("Buttons/Effects", `Unknown action, ${action}`);
        }
    }
}
