import {ButtonInteraction} from "discord.js";
import AppLogger from "../../client/appLogger";
import EffectHelper from "../../helpers/EffectHelper";
import EmbedColours from "../../constants/EmbedColours";
import User from "../../database/entities/app/User";
import {EffectDetails} from "../../constants/EffectDetails";

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
        const id = interaction.customId.split(" ")[3];
        const quantity = interaction.customId.split(" ")[4];

        if (!id || !quantity) {
            AppLogger.LogError("Buy Confirm", "Not enough parameters");
            return;
        }
        
        const effectDetail = EffectDetails.get(id);

        if (!effectDetail) {
            AppLogger.LogError("Buy Confirm", "Effect detail not found!");
            return;
        }

        const quantityNumber = Number(quantity);
        
        if (!quantityNumber || quantityNumber < 1) {
            AppLogger.LogError("Buy Confirm", "Invalid number");
            return;
        }

        const totalCost = effectDetail.cost * quantityNumber;

        const user = await User.FetchOneById(User, interaction.user.id);

        if (!user) {
            AppLogger.LogError("Buy Confirm", "Unable to find user");
            return;
        }

        if (user.Currency < totalCost) {
            interaction.reply(`You don't have enough currency to buy this! You have \`${user.Currency} Currency\` and need \`${totalCost} Currency\`!`);
            return;
        }

        user.RemoveCurrency(totalCost);
        await user.Save(User, user);

        await EffectHelper.AddEffectToUserInventory(interaction.user.id, id, quantityNumber);

        const generatedEmbed = await EffectHelper.GenerateEffectBuyEmbed(interaction.user.id, id, quantityNumber, true);

        if (typeof generatedEmbed == "string") {
            await interaction.reply(generatedEmbed);
            return;
        }

        generatedEmbed.embed.setColor(EmbedColours.Success);
        generatedEmbed.embed.setFooter({ text: "Purchased" });

        await interaction.update({
            embeds: [ generatedEmbed.embed ],
            components: [ generatedEmbed.row ],
        });
    }

    private static async Cancel(interaction: ButtonInteraction) {
    }
}
