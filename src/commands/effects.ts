import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../type/command";
import { EffectChoices } from "../constants/EffectDetails";
import AppLogger from "../client/appLogger";
import List from "./effects/List";
import Use from "./effects/Use";
import Buy from "./effects/Buy";

export default class Effects extends Command {
    constructor() {
        super();

        this.CommandBuilder = new SlashCommandBuilder()
            .setName("effects")
            .setDescription("Effects")
            .addSubcommand(x => x
                .setName("list")
                .setDescription("List all effects I have")
                .addNumberOption(x => x
                    .setName("page")
                    .setDescription("The page number")
                    .setMinValue(1)))
            .addSubcommand(x => x
                .setName("use")
                .setDescription("Use an effect in your inventory")
                .addStringOption(y => y
                    .setName("id")
                    .setDescription("The effect id to use")
                    .setRequired(true)
                    .setChoices(EffectChoices)))
            .addSubcommand(x => x
                .setName("buy")
                .setDescription("Buy more effects")
                .addStringOption(y => y
                    .setName("id")
                    .setDescription("The effect id to buy")
                    .setRequired(true)
                    .setChoices(EffectChoices))
                .addNumberOption(y => y
                    .setName("quantity")
                    .setDescription("The amount to buy")
                    .setMinValue(1)));
    }

    public override async execute(interaction: CommandInteraction) {
        if (!interaction.isChatInputCommand()) return;

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "list":
                await List(interaction);
                break;
            case "use":
                await Use(interaction);
                break;
            case "buy":
                await Buy(interaction);
                break;
            default:
                AppLogger.LogError("Commands/Effects", `Invalid subcommand: ${subcommand}`);
        }
    }
}
