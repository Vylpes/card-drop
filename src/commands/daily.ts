import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../type/command";
import User from "../database/entities/app/User";
import CardConstants from "../constants/CardConstants";
import TimeLengthInput from "../helpers/TimeLengthInput";

export default class Daily extends Command {
    constructor() {
        super();

        this.CommandBuilder = new SlashCommandBuilder()
            .setName("daily")
            .setDescription("Gain bonus currency, once a day");
    }

    public override async execute(interaction: CommandInteraction) {
        const user = await User.FetchOneById(User, interaction.user.id) ?? new User(interaction.user.id, CardConstants.StartingCurrency);

        const dayAgo = new Date(Date.now() - (1000 * 60 * 60 * 24));

        if (user.LastUsedDaily && user.LastUsedDaily > dayAgo) {
            const timeNow = Date.now();
            const timeLength = 24 * 60 * 60 * 1000; // 1 day

            const timeLeft = Math.ceil(((timeLength - (timeNow - user.LastUsedDaily.getTime()))) / 1000 / 60);

            const timeLeftHours = Math.floor(timeLeft / 60);
            const timeLeftMinutes = timeLeft % 60;

            const timeLeftString = new TimeLengthInput(`${timeLeftHours}h ${timeLeftMinutes}m`);

            await interaction.reply(`You have already used the daily command! You can use it again in **${timeLeftString.GetLength()}**.`);
            return;
        }

        user.AddCurrency(CardConstants.DailyCurrency);
        user.UpdateLastUsedDaily(new Date());

        await user.Save(User, user);

        await interaction.reply(`Congratulations, you have claimed your daily ${CardConstants.DailyCurrency} currency! You now have ${user.Currency} currency and can claim again in 24 hours!`);
    }
}