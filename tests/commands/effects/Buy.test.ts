import { ChatInputCommandInteraction } from "discord.js";
import Buy from "../../../src/commands/effects/Buy";
import EffectHelper from "../../../src/helpers/EffectHelper";

jest.mock("../../../src/helpers/EffectHelper");

describe("Buy", () => {
    let interaction: {
        options: { get: jest.Mock },
        user: { id: string },
        reply: jest.Mock,
    };

    beforeEach(() => {
        jest.resetAllMocks();

        interaction = {
            options: {
                get: jest.fn().mockImplementation((name: string) => {
                    if (name === "id") return { value: "unclaimed" };
                    if (name === "quantity") return { value: 1 };
                    return null;
                }),
            },
            user: { id: "userId" },
            reply: jest.fn(),
        };
    });

    test("GIVEN result returns a string, EXPECT interaction replied with string", async () => {
        // Arrange
        (EffectHelper.GenerateEffectBuyEmbed as jest.Mock).mockResolvedValue("Error message");

        // Act
        await Buy(interaction as unknown as ChatInputCommandInteraction);

        // Assert
        expect(interaction.reply).toHaveBeenCalledTimes(1);
        expect(interaction.reply).toHaveBeenCalledWith("Error message");
    });

    test("GIVEN result returns an embed, EXPECT interaction replied with embed and row", async () => {
        // Arrange
        const embed = { id: "embed" };
        const row = { id: "row" };
        (EffectHelper.GenerateEffectBuyEmbed as jest.Mock).mockResolvedValue({ embed, row });

        // Act
        await Buy(interaction as unknown as ChatInputCommandInteraction);

        // Assert
        expect(interaction.reply).toHaveBeenCalledTimes(1);
        expect(interaction.reply).toHaveBeenCalledWith({
            embeds: [embed],
            components: [row],
        });
    });

    test("GIVEN quantity option is not supplied, EXPECT quantity to default to 1", async () => {
        // Arrange
        interaction.options.get.mockImplementation((name: string) => {
            if (name === "id") return { value: "unclaimed" };
            return null;
        });
        (EffectHelper.GenerateEffectBuyEmbed as jest.Mock).mockResolvedValue("ok");

        // Act
        await Buy(interaction as unknown as ChatInputCommandInteraction);

        // Assert
        expect(EffectHelper.GenerateEffectBuyEmbed).toHaveBeenCalledTimes(1);
        expect(EffectHelper.GenerateEffectBuyEmbed).toHaveBeenCalledWith("userId", "unclaimed", 1, false);
    });
});
