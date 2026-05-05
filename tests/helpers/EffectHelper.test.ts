import EffectHelper from "../../src/helpers/EffectHelper";
import UserEffect from "../../src/database/entities/app/UserEffect";
import User from "../../src/database/entities/app/User";
import AppLogger from "../../src/client/appLogger";
import CardConstants from "../../src/constants/CardConstants";
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder } from "discord.js";

jest.mock("../../src/database/entities/app/UserEffect");
jest.mock("../../src/database/entities/app/User");
jest.mock("../../src/client/appLogger");

describe("GenerateEffectListEmbed", () => {
    test("GIVEN user has an effect, EXPECT detailed embed to be returned", async () => {
        // Arrange
        (UserEffect.FetchAllByUserIdPaginated as jest.Mock).mockResolvedValue([
            [
                {
                    Name: "unclaimed",
                    Unused: 1,
                }
            ],
            1,
        ]);

        // Act
        const result = await EffectHelper.GenerateEffectListEmbed("userId", 1);

        // Assert
        expect(result).toMatchSnapshot();
    });

    test("GIVEN user has more than 1 page of effects, EXPECT pagination enabled", async () => {
        const effects: {
            Name: string,
            Unused: number,
        }[] = [];

        for (let i = 0; i < 15; i++) {
            effects.push({
                Name: "unclaimed",
                Unused: 1,
            });
        }

        // Arrange
        (UserEffect.FetchAllByUserIdPaginated as jest.Mock).mockResolvedValue([
            effects,
            15,
        ]);

        // Act
        const result = await EffectHelper.GenerateEffectListEmbed("userId", 1);

        // Assert
        expect(result).toMatchSnapshot();
    });

    test("GIVEN user is on a page other than 1, EXPECT pagination enabled", async () => {
        const effects: {
            Name: string,
            Unused: number,
        }[] = [];

        for (let i = 0; i < 15; i++) {
            effects.push({
                Name: "unclaimed",
                Unused: 1,
            });
        }

        // Arrange
        (UserEffect.FetchAllByUserIdPaginated as jest.Mock).mockResolvedValue([
            effects,
            15,
        ]);

        // Act
        const result = await EffectHelper.GenerateEffectListEmbed("userId", 2);

        // Assert
        expect(result).toMatchSnapshot();
    });

    test("GIVEN user does NOT have an effect, EXPECT empty embed to be returned", async () => {
        // Arrange
        (UserEffect.FetchAllByUserIdPaginated as jest.Mock).mockResolvedValue([
            [],
            0,
        ]);

        // Act
        const result = await EffectHelper.GenerateEffectListEmbed("userId", 1);

        // Assert
        expect(result).toMatchSnapshot();
    });

    test("GIVEN there is an active effect, EXPECT field added", async () => {
        // Arrange
        (UserEffect.FetchAllByUserIdPaginated as jest.Mock).mockResolvedValue([
            [
                {
                    Name: "unclaimed",
                    Unused: 1,
                }
            ],
            1,
        ]);

        (UserEffect.FetchActiveEffectByUserId as jest.Mock).mockResolvedValue({
            Name: "unclaimed",
            WhenExpires: new Date(1738174052),
        });

        // Act
        const result = await EffectHelper.GenerateEffectListEmbed("userId", 1);

        // Assert
        expect(result).toMatchSnapshot();
    });
});

describe("GenerateEffectBuyEmbed", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("GIVEN Effect Details are not found, EXPECT error", async () => {
        // Act
        const result = await EffectHelper.GenerateEffectBuyEmbed("userId", "invalid-effect", 1, false);

        // Assert
        expect(result).toBe("Effect detail not found!");
    });

    test("GIVEN user is not in database, EXPECT blank user created", async () => {
        // Arrange
        const newUser = {
            Currency: CardConstants.StartingCurrency,
            Save: jest.fn(),
        };

        (User.FetchOneById as jest.Mock).mockResolvedValue(null);
        (User as unknown as jest.Mock).mockImplementation(() => newUser);

        // Act
        await EffectHelper.GenerateEffectBuyEmbed("userId", "unclaimed", 1, false);

        // Assert
        expect(User).toHaveBeenCalledTimes(1);
        expect(User).toHaveBeenCalledWith("userId", CardConstants.StartingCurrency);
        expect(newUser.Save).toHaveBeenCalledTimes(1);
        expect(AppLogger.LogInfo).toHaveBeenCalledTimes(1);
    });

    test("GIVEN user does not have enough currency, EXPECT error", async () => {
        // Arrange
        (User.FetchOneById as jest.Mock).mockResolvedValue({
            Currency: 0,
        });

        // Act
        const result = await EffectHelper.GenerateEffectBuyEmbed("userId", "unclaimed", 1, false);

        // Assert
        expect(typeof result).toBe("string");
        expect(result).toContain("don't have enough currency");
    });

    test("GIVEN user does have enough currency, EXPECT embed returned", async () => {
        // Arrange
        (User.FetchOneById as jest.Mock).mockResolvedValue({
            Currency: 1000,
        });

        // Act
        const result = await EffectHelper.GenerateEffectBuyEmbed("userId", "unclaimed", 1, false);

        // Assert
        expect(typeof result).toBe("object");
        expect(result).toHaveProperty("embed");
        expect(result).toHaveProperty("row");
        expect((result as { embed: EmbedBuilder, row: ActionRowBuilder<ButtonBuilder> }).embed).toBeInstanceOf(EmbedBuilder);
        expect((result as { embed: EmbedBuilder, row: ActionRowBuilder<ButtonBuilder> }).row).toBeInstanceOf(ActionRowBuilder);
    });

    test("GIVEN disabled boolean is true, EXPECT buttons to be disabled", async () => {
        // Arrange
        (User.FetchOneById as jest.Mock).mockResolvedValue({
            Currency: 0,
        });

        // Act
        const result = await EffectHelper.GenerateEffectBuyEmbed("userId", "unclaimed", 1, true);

        // Assert
        expect(typeof result).toBe("object");
        const { row } = result as { embed: EmbedBuilder, row: ActionRowBuilder<ButtonBuilder> };
        expect(row).toBeInstanceOf(ActionRowBuilder);
        row.components.forEach(button => {
            expect((button as ButtonBuilder).data.disabled).toBe(true);
        });
    });
});