import {ButtonInteraction} from "discord.js";
import Buy from "../../../src/buttonEvents/Effects/Buy";
import GenerateButtonInteractionMock from "../../__functions__/discord.js/GenerateButtonInteractionMock";
import { ButtonInteraction as ButtonInteractionType } from "../../__types__/discord.js";
import AppLogger from "../../../src/client/appLogger";
import EffectHelper from "../../../src/helpers/EffectHelper";
import EmbedColours from "../../../src/constants/EmbedColours";
import User from "../../../src/database/entities/app/User";

jest.mock("../../../src/client/appLogger");
jest.mock("../../../src/helpers/EffectHelper");
jest.mock("../../../src/database/entities/app/User");

let interaction: ButtonInteractionType;

beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(Buy as any, "Confirm")
        .mockRestore();
    jest.spyOn(Buy as any, "Cancel")
        .mockRestore();

    interaction = GenerateButtonInteractionMock();
    interaction.customId = "effects buy";

});

describe("Execute", () => {
    test("GIVEN subaction is confirm, EXPECT confirm function executed", async () => {
        // Arrange
        interaction.customId += " confirm";

        const confirmSpy = jest.spyOn(Buy as any, "Confirm")
            .mockImplementation();

        // Act
        await Buy.Execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(confirmSpy).toHaveBeenCalledTimes(1);
        expect(confirmSpy).toHaveBeenCalledWith(interaction);

        expect(AppLogger.LogError).not.toHaveBeenCalled();
    });

    test("GIVEN subaction is cancel, EXPECT cancel function executed", async () => {
        // Arrange
        interaction.customId += " cancel";

        const cancelSpy = jest.spyOn(Buy as any, "Cancel")
            .mockImplementation();

        // Act
        await Buy.Execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(cancelSpy).toHaveBeenCalledTimes(1)
        expect(cancelSpy).toHaveBeenCalledWith(interaction);

        expect(AppLogger.LogError).not.toHaveBeenCalled();
    });

    test("GIVEN subaction is invalid, EXPECT error logged", async () => {
        // Arrange
        interaction.customId += " invalid";

        const confirmSpy = jest.spyOn(Buy as any, "Confirm")
            .mockImplementation();
        const cancelSpy = jest.spyOn(Buy as any, "Cancel")
            .mockImplementation();

        // Act
        await Buy.Execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(AppLogger.LogError).toHaveBeenCalledTimes(1);
        expect(AppLogger.LogError).toHaveBeenCalledWith("Buy", "Unknown subaction, effects invalid");

        expect(confirmSpy).not.toHaveBeenCalled();
        expect(cancelSpy).not.toHaveBeenCalled();
    });
});

describe("Confirm", () => {
    let user: User;

    beforeEach(() => {
        interaction.customId += " confirm";

        user = {
            Currency: 1000,
            Save: jest.fn(),
            RemoveCurrency: jest.fn(),
        } as unknown as User;

        (User.FetchOneById as jest.Mock).mockResolvedValue(user);
    });

    test("EXPECT success embed generated", async () => {
        // Assert
        interaction.customId += " unclaimed 1";

        const embed = {
            id: "embed",
            setColor: jest.fn(),
            setFooter: jest.fn(),
        };
        const row = {
            id: "row",
        };
        
        (EffectHelper.GenerateEffectBuyEmbed as jest.Mock).mockResolvedValue({
            embed,
            row,
        });

        // Act
        await Buy.Execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(interaction.update).toHaveBeenCalledTimes(1);
        expect(interaction.update).toHaveBeenCalledWith({
            embeds: [ embed ],
            components: [ row ],
        });

        expect(EffectHelper.GenerateEffectBuyEmbed).toHaveBeenCalledTimes(1);
        expect(EffectHelper.GenerateEffectBuyEmbed).toHaveBeenCalledWith("userId", "unclaimed", 1, true);

        expect(embed.setColor).toHaveBeenCalledTimes(1);
        expect(embed.setColor).toHaveBeenCalledWith(EmbedColours.Success);

        expect(embed.setFooter).toHaveBeenCalledTimes(1);
        expect(embed.setFooter).toHaveBeenCalledWith({ text: "Purchased" });

        expect(interaction.reply).not.toHaveBeenCalled();
        expect(AppLogger.LogError).not.toHaveBeenCalled();

        expect(User.FetchOneById).toHaveBeenCalledTimes(1);
        expect(User.FetchOneById).toHaveBeenCalledWith(User, "userId");

        expect(user.RemoveCurrency).toHaveBeenCalledTimes(1);
        expect(user.RemoveCurrency).toHaveBeenCalledWith(100);

        expect(user.Save).toHaveBeenCalledTimes(1);
        expect(user.Save).toHaveBeenCalledWith(User, user);

        expect(EffectHelper.AddEffectToUserInventory).toHaveBeenCalledTimes(1);
        expect(EffectHelper.AddEffectToUserInventory).toHaveBeenCalledWith("userId", "unclaimed", 1);
    });

    test("GIVEN id is not supplied, EXPECT error", async () => {
        // Assert
        const embed = {
            id: "embed",
            setColor: jest.fn(),
            setFooter: jest.fn(),
        };
        const row = {
            id: "row",
        };
        
        (EffectHelper.GenerateEffectBuyEmbed as jest.Mock).mockResolvedValue({
            embed,
            row,
        });

        // Act
        await Buy.Execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(AppLogger.LogError).toHaveBeenCalledTimes(1);
        expect(AppLogger.LogError).toHaveBeenCalledWith("Buy Confirm", "Not enough parameters");

        expect(EffectHelper.GenerateEffectBuyEmbed).not.toHaveBeenCalled();
        expect(interaction.reply).not.toHaveBeenCalled();
        expect(interaction.update).not.toHaveBeenCalled();
    });

    test("GIVEN quantity is not supplied, EXPECT error", async () => {
        // Assert
        interaction.customId += " unclaimed";

        const embed = {
            id: "embed",
            setColor: jest.fn(),
            setFooter: jest.fn(),
        };
        const row = {
            id: "row",
        };
        
        (EffectHelper.GenerateEffectBuyEmbed as jest.Mock).mockResolvedValue({
            embed,
            row,
        });

        // Act
        await Buy.Execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(AppLogger.LogError).toHaveBeenCalledTimes(1);
        expect(AppLogger.LogError).toHaveBeenCalledWith("Buy Confirm", "Not enough parameters");

        expect(EffectHelper.GenerateEffectBuyEmbed).not.toHaveBeenCalled();
        expect(interaction.reply).not.toHaveBeenCalled();
        expect(interaction.update).not.toHaveBeenCalled();
    });

    test("GIVEN quantity is not a number, EXPECT error", async () => {
        // Assert
        interaction.customId += " unclaimed invalid";

        const embed = {
            id: "embed",
            setColor: jest.fn(),
            setFooter: jest.fn(),
        };
        const row = {
            id: "row",
        };
        
        (EffectHelper.GenerateEffectBuyEmbed as jest.Mock).mockResolvedValue({
            embed,
            row,
        });

        // Act
        await Buy.Execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(AppLogger.LogError).toHaveBeenCalledTimes(1);
        expect(AppLogger.LogError).toHaveBeenCalledWith("Buy Confirm", "Invalid number");

        expect(EffectHelper.GenerateEffectBuyEmbed).not.toHaveBeenCalled();
        expect(interaction.reply).not.toHaveBeenCalled();
        expect(interaction.update).not.toHaveBeenCalled();
    });

    test("GIVEN quantity is 0, EXPECT error", async () => {
        // Assert
        interaction.customId += " unclaimed 0";

        const embed = {
            id: "embed",
            setColor: jest.fn(),
            setFooter: jest.fn(),
        };
        const row = {
            id: "row",
        };
        
        (EffectHelper.GenerateEffectBuyEmbed as jest.Mock).mockResolvedValue({
            embed,
            row,
        });

        // Act
        await Buy.Execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(AppLogger.LogError).toHaveBeenCalledTimes(1);
        expect(AppLogger.LogError).toHaveBeenCalledWith("Buy Confirm", "Invalid number");

        expect(EffectHelper.GenerateEffectBuyEmbed).not.toHaveBeenCalled();
        expect(interaction.reply).not.toHaveBeenCalled();
        expect(interaction.update).not.toHaveBeenCalled();
    });

    test("GIVEN user is not found, EXPECT error", async () => {
        // Assert
        interaction.customId += " unclaimed 1";

        (User.FetchOneById as jest.Mock).mockResolvedValue(undefined);

        // Act
        await Buy.Execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(AppLogger.LogError).toHaveBeenCalledTimes(1);
        expect(AppLogger.LogError).toHaveBeenCalledWith("Buy Confirm", "Unable to find user");

        expect(EffectHelper.AddEffectToUserInventory).not.toHaveBeenCalled();

        expect(interaction.update).not.toHaveBeenCalled();
        expect(interaction.reply).not.toHaveBeenCalled();
    });

    test("GIVEN user does not have enough currency, EXPECT error", async () => {
        // Assert
        interaction.customId += " unclaimed 1";

        user.Currency = 0;

        // Act
        await Buy.Execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(interaction.reply).toHaveBeenCalledTimes(1);
        expect(interaction.reply).toHaveBeenCalledWith("You don't have enough currency to buy this! You have `0 Currency` and need `100 Currency`!");
        
        expect(EffectHelper.AddEffectToUserInventory).not.toHaveBeenCalled();

        expect(interaction.update).not.toHaveBeenCalled();

        expect(AppLogger.LogError).not.toHaveBeenCalled();
    });

    test("GIVEN GenerateEffectBuyEmbed returns with a string, EXPECT error replied", async () => {
        // Assert
        interaction.customId += " unclaimed 1";
        
        (EffectHelper.GenerateEffectBuyEmbed as jest.Mock).mockResolvedValue("Test error");

        // Act
        await Buy.Execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(interaction.reply).toHaveBeenCalledTimes(1);
        expect(interaction.reply).toHaveBeenCalledWith("Test error");

        expect(EffectHelper.GenerateEffectBuyEmbed).toHaveBeenCalledTimes(1);

        expect(interaction.update).not.toHaveBeenCalled();
        expect(AppLogger.LogError).not.toHaveBeenCalled();
    });
});
