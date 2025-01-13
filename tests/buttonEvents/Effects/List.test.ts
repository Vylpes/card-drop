import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, EmbedBuilder } from "discord.js";
import List from "../../../src/buttonEvents/Effects/List";
import EffectHelper from "../../../src/helpers/EffectHelper";
import { mock } from "jest-mock-extended";

jest.mock("../../../src/helpers/EffectHelper");

let interaction: ReturnType<typeof mock<ButtonInteraction>>;

beforeEach(() => {
    jest.resetAllMocks();

    (EffectHelper.GenerateEffectEmbed as jest.Mock).mockResolvedValue({
        embed: mock<EmbedBuilder>(),
        row: mock<ActionRowBuilder<ButtonBuilder>>(),
    });

    interaction = mock<ButtonInteraction>();
    interaction.user.id = "userId";
    interaction.customId = "effects list 1";
});

test("GIVEN pageOption is NOT a number, EXPECT error", async () => {
    // Arrange
    interaction.customId = "effects list invalid";

    // Act
    await List(interaction);

    // Assert
    expect(interaction.reply).toHaveBeenCalledTimes(1);
    expect(interaction.reply).toHaveBeenCalledWith("Page option is not a valid number")

    expect(EffectHelper.GenerateEffectEmbed).not.toHaveBeenCalled();
    expect(interaction.update).not.toHaveBeenCalled();
});

test("GIVEN pageOption is a number, EXPECT interaction updated", async () => {
    // Arrange
    interaction.customId = "effects list 1";

    // Act
    await List(interaction);

    // Assert
    expect(EffectHelper.GenerateEffectEmbed).toHaveBeenCalledTimes(1);
    expect(EffectHelper.GenerateEffectEmbed).toHaveBeenCalledWith("userId", 1);

    expect(interaction.update).toHaveBeenCalledTimes(1);
});