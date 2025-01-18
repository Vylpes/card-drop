import { ButtonInteraction, TextChannel } from "discord.js";
import Claim from "../../src/buttonEvents/Claim";
import { ButtonInteraction as ButtonInteractionType } from "../__types__/discord.js";
import User from "../../src/database/entities/app/User";

jest.mock("../../src/client/appLogger");

let interaction: ButtonInteractionType;

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(1000 * 60 * 30);

    interaction = {
        guild: {},
        guildId: "guildId",
        channel: {
            isSendable: jest.fn().mockReturnValue(true),
            send: jest.fn(),
        },
        deferUpdate: jest.fn(),
        editReply: jest.fn(),
        message: {
            createdAt: new Date(1000 * 60 * 27),
        },
        user: {
            id: "userId",
        },
        customId: "claim cardNumber claimId droppedBy userId",
    };
});

afterAll(() => {
    jest.useRealTimers();
});

test("GIVEN interaction.guild is null, EXPECT nothing to happen", async () => {
    // Arrange
    interaction.guild = null;

    // Act
    const claim = new Claim();
    await claim.execute(interaction as unknown as ButtonInteraction);

    // Assert
    expect(interaction.deferUpdate).not.toHaveBeenCalled();
    expect(interaction.editReply).not.toHaveBeenCalled();
    expect((interaction.channel as TextChannel).send).not.toHaveBeenCalled();
});

test("GIVEN interaction.guildId is null, EXPECT nothing to happen", async () => {
    // Arrange
    interaction.guildId = null;

    // Act
    const claim = new Claim();
    await claim.execute(interaction as unknown as ButtonInteraction);

    // Assert
    expect(interaction.deferUpdate).not.toHaveBeenCalled();
    expect(interaction.editReply).not.toHaveBeenCalled();
    expect((interaction.channel as TextChannel).send).not.toHaveBeenCalled();
});

test("GIVEN interaction.channel is null, EXPECT nothing to happen", async () => {
    // Arrange
    interaction.channel = null;

    // Act
    const claim = new Claim();
    await claim.execute(interaction as unknown as ButtonInteraction);

    // Assert
    expect(interaction.deferUpdate).not.toHaveBeenCalled();
    expect(interaction.editReply).not.toHaveBeenCalled();
});

test("GIVEN channel is not sendable, EXPECT nothing to happen", async () => {
    // Arrange
    interaction.channel!.isSendable = jest.fn().mockReturnValue(false);

    // Act
    const claim = new Claim();
    await claim.execute(interaction as unknown as ButtonInteraction);

    // Assert
    expect(interaction.deferUpdate).not.toHaveBeenCalled();
    expect(interaction.editReply).not.toHaveBeenCalled();
    expect((interaction.channel as TextChannel).send).not.toHaveBeenCalled();
});

test("GIVEN interaction.message was created more than 5 minutes ago, EXPECT error", async () => {
    // Arrange
    interaction.message!.createdAt = new Date(0);

    // Act
    const claim = new Claim();
    await claim.execute(interaction as unknown as ButtonInteraction);

    // Assert
    expect(interaction.channel!.send).toHaveBeenCalledTimes(1);
    expect(interaction.channel!.send).toHaveBeenCalledWith("[object Object], Cards can only be claimed within 5 minutes of it being dropped!");

    expect(interaction.editReply).not.toHaveBeenCalled();
});

test("GIVEN user.RemoveCurrency fails, EXPECT error", async () => {
    // Arrange
    User.FetchOneById = jest.fn().mockResolvedValue({
        RemoveCurrency: jest.fn().mockReturnValue(false),
        Currency: 5,
    });

    // Act
    const claim = new Claim();
    await claim.execute(interaction as unknown as ButtonInteraction);

    // Assert
    expect(interaction.channel!.send).toHaveBeenCalledTimes(1);
    expect(interaction.channel!.send).toHaveBeenCalledWith("[object Object], Not enough currency! You need 10 currency, you have 5!");

    expect(interaction.editReply).not.toHaveBeenCalled();
});

test.todo("GIVEN the card has already been claimed, EXPECT error");

test.todo("GIVEN the current drop is the latest AND the current user is NOT the one who dropped it, EXPECT error");

test.todo("GIVEN the user already has the card in their inventory, EXPECT the entity quantity to be +1");

test.todo("GIVEN user does NOT have the card in their inventory, EXPECT a new entity to be created");

test.todo("GIVEN card can not be found in the bot, EXPECT error logged");

test.todo("EXPECT message to be edited");