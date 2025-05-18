import EffectHelper from "../../src/helpers/EffectHelper";
import UserEffect from "../../src/database/entities/app/UserEffect";

jest.mock("../../src/database/entities/app/UserEffect");

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
    test.todo("GIVEN Effect Details are not found, EXPECT error");

    test.todo("GIVEN user is not in database, EXPECT blank user created");

    test.todo("GIVEN user does not have enough currency, EXPECT error");

    test.todo("GIVEN user does have enough currency, EXPECT embed returned");

    test.todo("GIVEN disabled boolean is true, EXPECT buttons to be disabled");
});