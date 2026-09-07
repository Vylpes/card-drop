import { StringSelectMenuInteraction } from "discord.js";
import StringDropdown from "../../../src/client/interactionCreate/StringDropdown";
import { CoreClient } from "../../../src/client/client";
import AppLogger from "../../../src/client/appLogger";
import StringDropdownEventItem from "../../../src/contracts/StringDropdownEventItem";

jest.mock("../../../src/client/appLogger");

type InteractionMock = {
    customId: string,
    replied: boolean,
    deferred: boolean,
    reply: jest.Mock,
    followUp: jest.Mock,
};

function generateInteraction(customId: string): InteractionMock {
    return {
        customId,
        replied: false,
        deferred: false,
        reply: jest.fn(),
        followUp: jest.fn()
    };
}

function registerDropdown(dropdownId: string, execute: jest.Mock) {
    jest.spyOn(CoreClient, "stringDropdowns", "get").mockReturnValue([
        {
            DropdownId: dropdownId,
            Event: { execute },
            Environment: 0
        } as unknown as StringDropdownEventItem
    ]);
}

describe("GIVEN the dropdown event exists", () => {
    let interaction: InteractionMock;
    let execute: jest.Mock;

    beforeAll(async () => {
        jest.resetAllMocks();

        execute = jest.fn().mockResolvedValue(undefined);
        registerDropdown("inventory", execute);

        interaction = generateInteraction("inventory 1234");

        await StringDropdown.onStringDropdownSelected(interaction as unknown as StringSelectMenuInteraction);
    });

    test("EXPECT the event to be executed with the interaction", () => {
        expect(execute).toHaveBeenCalledTimes(1);
        expect(execute).toHaveBeenCalledWith(interaction);
    });

    test("EXPECT no error reply", () => {
        expect(interaction.reply).not.toHaveBeenCalled();
        expect(interaction.followUp).not.toHaveBeenCalled();
    });
});

describe("GIVEN the dropdown event does not exist", () => {
    let interaction: InteractionMock;

    beforeAll(async () => {
        jest.resetAllMocks();

        registerDropdown("inventory", jest.fn());

        interaction = generateInteraction("unknown 1234");

        await StringDropdown.onStringDropdownSelected(interaction as unknown as StringSelectMenuInteraction);
    });

    test("EXPECT the user to be told the event was not found", () => {
        expect(interaction.reply).toHaveBeenCalledTimes(1);
        expect(interaction.reply).toHaveBeenCalledWith("Event not found");
    });
});

describe("GIVEN the dropdown event rejects AND the interaction has not been replied to", () => {
    let interaction: InteractionMock;
    const error = new Error("qa-dispatch");

    beforeAll(async () => {
        jest.resetAllMocks();

        registerDropdown("inventory", jest.fn().mockRejectedValue(error));

        interaction = generateInteraction("inventory 1234");

        await StringDropdown.onStringDropdownSelected(interaction as unknown as StringSelectMenuInteraction);
    });

    test("EXPECT the rejection to be caught and logged as an error object", () => {
        expect(AppLogger.CatchError).toHaveBeenCalledTimes(1);
        expect(AppLogger.CatchError).toHaveBeenCalledWith("StringDropdown", error);
    });

    test("EXPECT the user to receive the error reply", () => {
        expect(interaction.reply).toHaveBeenCalledTimes(1);
        expect(interaction.reply).toHaveBeenCalledWith("An error occurred while executing the event");
    });
});

describe("GIVEN the dropdown event rejects AND the interaction has already been deferred", () => {
    let interaction: InteractionMock;

    beforeAll(async () => {
        jest.resetAllMocks();

        registerDropdown("inventory", jest.fn().mockRejectedValue(new Error("qa-dispatch")));

        interaction = generateInteraction("inventory 1234");
        interaction.deferred = true;

        await StringDropdown.onStringDropdownSelected(interaction as unknown as StringSelectMenuInteraction);
    });

    test("EXPECT the error to be sent as a follow up instead of a reply", () => {
        expect(interaction.followUp).toHaveBeenCalledTimes(1);
        expect(interaction.followUp).toHaveBeenCalledWith("An error occurred while executing the event");
        expect(interaction.reply).not.toHaveBeenCalled();
    });
});
