import {ButtonInteraction} from "discord.js";
import {ButtonEvent} from "../type/buttonEvent.js";
import CardSearchHelper from "../helpers/CardSearchHelper.js";

export default class View extends ButtonEvent {
    public override async execute(interaction: ButtonInteraction) {
        const page = interaction.customId.split(" ")[1];
        const results = interaction.customId.split(" ").splice(2);

        await interaction.deferUpdate();

        const searchResult = await CardSearchHelper.GenerateSearchPageFromQuery(results, interaction.user.id, Number(page));

        if (!searchResult) {
            await interaction.followUp("No results found");
            return;
        }

        await interaction.editReply({
            embeds: [ searchResult.embed ],
            components: [ searchResult.row ],
            files: [ searchResult.attachment ],
        });
    }
}
