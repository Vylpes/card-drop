import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, DiscordAPIError, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../type/command";
import CardDropHelper from "../helpers/CardDropHelper";
import { CardRarityToColour, CardRarityToString } from "../constants/CardRarity";
import { readFileSync } from "fs";
import { CoreClient } from "../client/client";
import { v4 } from "uuid";
import Card from "../database/entities/card/Card";
import Inventory from "../database/entities/app/Inventory";

export default class Drop extends Command {
    constructor() {
        super();

        super.CommandBuilder = new SlashCommandBuilder()
            .setName('drop')
            .setDescription('Summon a new card drop');
    }

    public override async execute(interaction: CommandInteraction) {
        let randomCard = await CardDropHelper.GetRandomCard();

        if (process.env.DROP_RARITY && Number(process.env.DROP_RARITY) > 0) {
            randomCard = await CardDropHelper.GetRandomCardByRarity(Number(process.env.DROP_RARITY));
        } else if (process.env.DROP_CARD && process.env.DROP_CARD != '-1') {
            let card = await Card.FetchOneByCardNumber(process.env.DROP_CARD, [ "Series" ]);

            if (!card) {
                await interaction.reply("Card not found");
                return;
            }

            randomCard = card;
        }

        const image = readFileSync(randomCard.Path);

        await interaction.deferReply();

        const attachment = new AttachmentBuilder(image, { name: randomCard.FileName });

        const inventory = await Inventory.FetchOneByCardNumberAndUserId(interaction.user.id, randomCard.CardNumber);
        const quantityClaimed = inventory ? inventory.Quantity : 0;

        let embedDescription = "";
        embedDescription += `Series: ${randomCard.Series.Name}\n`;
        embedDescription += `Claimed: ${quantityClaimed || 0}\n`;

        const embed = new EmbedBuilder()
            .setTitle(randomCard.Name)
            .setDescription(embedDescription)
            .setFooter({ text: CardRarityToString(randomCard.Rarity) })
            .setColor(CardRarityToColour(randomCard.Rarity))
            .setImage(`attachment://${randomCard.FileName}`);

        const row = new ActionRowBuilder<ButtonBuilder>();

        const claimId = v4();

        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`claim ${randomCard.CardNumber} ${claimId} ${interaction.user.id}`)
                .setLabel("Claim")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`reroll`)
                .setLabel("Reroll")
                .setStyle(ButtonStyle.Secondary));

        try {
            await interaction.editReply({
                embeds: [ embed ],
                files: [ attachment ],
                components: [ row ],
            });
        } catch (e) {
            console.error(e);


            if (e instanceof DiscordAPIError) {
                await interaction.editReply(`Unable to send next drop. Please try again, and report this if it keeps happening. Code: ${e.code}`);
            } else {
                await interaction.editReply(`Unable to send next drop. Please try again, and report this if it keeps happening. Code: UNKNOWN`);
            }
        }

        CoreClient.ClaimId = claimId;
    }
}