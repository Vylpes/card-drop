import { ButtonInteraction } from "discord.js";
import Button from "../../../src/client/interactionCreate/Button";
import { CoreClient } from "../../../src/client/client";
import AppLogger from "../../../src/client/appLogger";
import IButtonEventItem from "../../../src/contracts/ButtonEventItem";

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

function registerEvent(buttonId: string, execute: jest.Mock) {
    jest.spyOn(CoreClient, "buttonEvents", "get").mockReturnValue([
        {
            ButtonId: buttonId,
            Event: { execute },
            Environment: 0
        } as unknown as IButtonEventItem
    ]);
}

describe("GIVEN the button event exists", () => {
    let interaction: InteractionMock;
    let execute: jest.Mock;

    beforeAll(async () => {
        jest.resetAllMocks();

        execute = jest.fn().mockResolvedValue(undefined);
        registerEvent("test", execute);

        interaction = generateInteraction("test 1234");

        await Button.onButtonClicked(interaction as unknown as ButtonInteraction);
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

describe("GIVEN the button event does not exist", () => {
    let interaction: InteractionMock;

    beforeAll(async () => {
        jest.resetAllMocks();

        registerEvent("test", jest.fn());

        interaction = generateInteraction("unknown 1234");

        await Button.onButtonClicked(interaction as unknown as ButtonInteraction);
    });

    test("EXPECT the user to be told the event was not found", () => {
        expect(interaction.reply).toHaveBeenCalledTimes(1);
        expect(interaction.reply).toHaveBeenCalledWith("Event not found");
    });
});

describe("GIVEN the button event rejects AND the interaction has not been replied to", () => {
    let interaction: InteractionMock;
    const error = new Error("qa-dispatch");

    beforeAll(async () => {
        jest.resetAllMocks();

        registerEvent("test", jest.fn().mockRejectedValue(error));

        interaction = generateInteraction("test 1234");

        await Button.onButtonClicked(interaction as unknown as ButtonInteraction);
    });

    test("EXPECT the rejection to be caught and logged as an error object", () => {
        expect(AppLogger.CatchError).toHaveBeenCalledTimes(1);
        expect(AppLogger.CatchError).toHaveBeenCalledWith("Button", error);
    });

    test("EXPECT the user to receive the error reply", () => {
        expect(interaction.reply).toHaveBeenCalledTimes(1);
        expect(interaction.reply).toHaveBeenCalledWith("An error occurred while executing the event");
    });
});

describe("GIVEN the button event rejects AND the interaction has already been deferred", () => {
    let interaction: InteractionMock;

    beforeAll(async () => {
        jest.resetAllMocks();

        registerEvent("test", jest.fn().mockRejectedValue(new Error("qa-dispatch")));

        interaction = generateInteraction("test 1234");
        interaction.deferred = true;

        await Button.onButtonClicked(interaction as unknown as ButtonInteraction);
    });

    test("EXPECT the error to be sent as a follow up instead of a reply", () => {
        expect(interaction.followUp).toHaveBeenCalledTimes(1);
        expect(interaction.followUp).toHaveBeenCalledWith("An error occurred while executing the event");
        expect(interaction.reply).not.toHaveBeenCalled();
    });
});
