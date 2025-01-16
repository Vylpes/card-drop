import { ButtonInteraction, EmbedBuilder, InteractionResponse } from "discord.js";
import Use from "../../../src/buttonEvents/Effects/Use";
import { mock } from "jest-mock-extended";
import AppLogger from "../../../src/client/appLogger";
import EffectHelper from "../../../src/helpers/EffectHelper";

jest.mock("../../../src/client/appLogger");
jest.mock("../../../src/helpers/EffectHelper");

beforeEach(() => {
    jest.resetAllMocks();

    jest.useFakeTimers();
    jest.setSystemTime(0);
});

afterAll(() => {
    jest.useRealTimers();
});

describe("Execute", () => {
    test("GIVEN subaction is unknown, EXPECT nothing to be called", async () => {
        // Arrange
        const interaction = mock<ButtonInteraction>();
        interaction.customId = "effects use invalud";

        // Act
        await Use.Execute(interaction);

        // Assert
        expect(interaction.reply).not.toHaveBeenCalled();
        expect(interaction.update).not.toHaveBeenCalled();
    });
});

describe("UseConfirm", () => {
    let interaction = mock<ButtonInteraction>();

    beforeEach(() => {
        interaction = mock<ButtonInteraction>();
        interaction.customId = "effects use confirm";
    });

    test("GIVEN effectDetail is not found, EXPECT error", async () => {
        // Arrange
        interaction.customId += " invalid";

        // Act
        await Use.Execute(interaction);

        // Assert
        expect(AppLogger.LogError).toHaveBeenCalledTimes(1);
        expect(AppLogger.LogError).toHaveBeenCalledWith("Button/Effects/Use", "Effect not found, invalid");

        expect(interaction.reply).toHaveBeenCalledTimes(1);
        expect(interaction.reply).toHaveBeenCalledWith("Effect not found in system!");
    });

    test("GIVEN EffectHelper.UseEffect failed, EXPECT error", async () => {
        // Arrange
        interaction.customId += " unclaimed";
        interaction.user.id = "userId";

        (EffectHelper.UseEffect as jest.Mock).mockResolvedValue(false);

        const whenExpires = new Date(Date.now() + 10 * 60 * 1000);

        // Act
        await Use.Execute(interaction);

        // Assert
        expect(EffectHelper.UseEffect).toHaveBeenCalledTimes(1);
        expect(EffectHelper.UseEffect).toHaveBeenCalledWith("userId", "unclaimed", whenExpires);

        expect(interaction.reply).toHaveBeenCalledTimes(1);
        expect(interaction.reply).toHaveBeenCalledWith("Unable to use effect! Please make sure you have it in your inventory and is not on cooldown");
    });

    test("GIVEN EffectHelper.UseEffect succeeded, EXPECT interaction updated", async () => {
        let updatedWith;

        // Arrange
        interaction.customId += " unclaimed";
        interaction.user.id = "userId";
        interaction.update.mockImplementation(async (opts: any) => {
            updatedWith = opts;

            return mock<InteractionResponse<boolean>>();
        });

        (EffectHelper.UseEffect as jest.Mock).mockResolvedValue(true);

        const whenExpires = new Date(Date.now() + 10 * 60 * 1000);

        // Act
        await Use.Execute(interaction);

        // Assert
        expect(EffectHelper.UseEffect).toHaveBeenCalledTimes(1);
        expect(EffectHelper.UseEffect).toHaveBeenCalledWith("userId", "unclaimed", whenExpires);

        expect(interaction.update).toHaveBeenCalledTimes(1);
        expect(updatedWith).toMatchSnapshot();
    });
});

describe("UseCancel", () => {
    let interaction = mock<ButtonInteraction>();

    beforeEach(() => {
        interaction = mock<ButtonInteraction>();
        interaction.customId = "effects use cancel";
    });

    test("GIVEN effectDetail is not found, EXPECT error", async () => {
        // Arrange
        interaction.customId += " invalid";

        // Act
        await Use.Execute(interaction);

        // Assert
        expect(AppLogger.LogError).toHaveBeenCalledTimes(1);
        expect(AppLogger.LogError).toHaveBeenCalledWith("Button/Effects/Cancel", "Effect not found, invalid");

        expect(interaction.reply).toHaveBeenCalledTimes(1);
        expect(interaction.reply).toHaveBeenCalledWith("Effect not found in system!");
    });

    test("GIVEN effectDetail is found, EXPECT interaction updated", async () => {
        let updatedWith;

        // Arrange
        interaction.customId += " unclaimed";
        interaction.user.id = "userId";
        interaction.update.mockImplementation(async (opts: any) => {
            updatedWith = opts;

            return mock<InteractionResponse<boolean>>();
        });
        // Act
        await Use.Execute(interaction);

        // Assert
        expect(interaction.update).toHaveBeenCalledTimes(1);
        expect(updatedWith).toMatchSnapshot();
    });
});