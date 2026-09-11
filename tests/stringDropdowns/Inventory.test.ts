import { StringSelectMenuInteraction } from "discord.js";
import Inventory from "../../src/stringDropdowns/Inventory";
import InventoryHelper from "../../src/helpers/InventoryHelper";
import AppLogger from "../../src/client/appLogger";

jest.mock("../../src/helpers/InventoryHelper");
jest.mock("../../src/client/appLogger");

type InteractionMock = {
    guild: {
        members: {
            cache: {
                find: jest.Mock,
            },
            fetch: jest.Mock,
        },
    } | null,
    values: string[],
    deferUpdate: jest.Mock,
    editReply: jest.Mock,
    followUp: jest.Mock,
    reply: jest.Mock,
};

const member = {
    user: {
        id: "userId",
        username: "username"
    }
};

const page = {
    image: "image",
    embed: { type: "Embed" },
    row1: { type: "Row1" },
    row2: { type: "Row2" }
};

function generateInteraction(cachedMember: unknown, fetchedMember: unknown): InteractionMock {
    return {
        guild: {
            members: {
                cache: {
                    find: jest.fn().mockReturnValue(cachedMember)
                },
                fetch: jest.fn().mockResolvedValue(fetchedMember)
            }
        },
        values: [ "userId 2" ],
        deferUpdate: jest.fn(),
        editReply: jest.fn(),
        followUp: jest.fn(),
        reply: jest.fn()
    };
}

async function execute(interaction: InteractionMock) {
    const dropdown = new Inventory();
    await dropdown.execute(interaction as unknown as StringSelectMenuInteraction);
}

describe("GIVEN the member is in the guild cache", () => {
    let interaction: InteractionMock;

    beforeAll(async () => {
        jest.resetAllMocks();

        (InventoryHelper.GenerateInventoryPage as jest.Mock).mockResolvedValue(page);

        interaction = generateInteraction(member, undefined);

        await execute(interaction);
    });

    test("EXPECT the interaction to be deferred", () => {
        expect(interaction.deferUpdate).toHaveBeenCalledTimes(1);
    });

    test("EXPECT the guild members to not be fetched", () => {
        expect(interaction.guild!.members.fetch).not.toHaveBeenCalled();
    });

    test("EXPECT the page to be generated for the selected user and page", () => {
        expect(InventoryHelper.GenerateInventoryPage).toHaveBeenCalledTimes(1);
        expect(InventoryHelper.GenerateInventoryPage).toHaveBeenCalledWith("username", "userId", 2);
    });

    test("EXPECT the page to be sent", () => {
        expect(interaction.editReply).toHaveBeenCalledTimes(1);
        expect(interaction.editReply).toHaveBeenCalledWith({
            files: [ page.image ],
            embeds: [ page.embed ],
            components: [ page.row1, page.row2 ]
        });
    });
});

test("GIVEN the member is not in the guild cache, EXPECT the member to be fetched", async () => {
    jest.resetAllMocks();

    (InventoryHelper.GenerateInventoryPage as jest.Mock).mockResolvedValue(page);

    const interaction = generateInteraction(undefined, member);

    await execute(interaction);

    expect(interaction.guild!.members.fetch).toHaveBeenCalledTimes(1);
    expect(interaction.guild!.members.fetch).toHaveBeenCalledWith("userId");
    expect(interaction.editReply).toHaveBeenCalledTimes(1);
});

test("GIVEN the interaction is not in a guild, EXPECT nothing to happen", async () => {
    jest.resetAllMocks();

    const interaction = generateInteraction(member, undefined);
    interaction.guild = null;

    await execute(interaction);

    expect(interaction.deferUpdate).not.toHaveBeenCalled();
    expect(InventoryHelper.GenerateInventoryPage).not.toHaveBeenCalled();
});

test("GIVEN the member can not be found, EXPECT error replied", async () => {
    jest.resetAllMocks();

    const interaction = generateInteraction(undefined, undefined);

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledTimes(1);
    expect(interaction.reply).toHaveBeenCalledWith("Unable to find user.");
    expect(InventoryHelper.GenerateInventoryPage).not.toHaveBeenCalled();
});

test("GIVEN no page exists for the user, EXPECT error followed up", async () => {
    jest.resetAllMocks();

    (InventoryHelper.GenerateInventoryPage as jest.Mock).mockResolvedValue(undefined);

    const interaction = generateInteraction(member, undefined);

    await execute(interaction);

    expect(interaction.followUp).toHaveBeenCalledTimes(1);
    expect(interaction.followUp).toHaveBeenCalledWith("No page for user found.");
    expect(interaction.editReply).not.toHaveBeenCalled();
});

test("GIVEN the page fails to generate, EXPECT the error logged and followed up", async () => {
    jest.resetAllMocks();

    (InventoryHelper.GenerateInventoryPage as jest.Mock).mockRejectedValue(new Error("error"));

    const interaction = generateInteraction(member, undefined);

    await execute(interaction);

    expect(AppLogger.LogError).toHaveBeenCalledTimes(1);
    expect(interaction.followUp).toHaveBeenCalledTimes(1);
    expect(interaction.followUp).toHaveBeenCalledWith("An error has occurred running this command.");
    expect(interaction.editReply).not.toHaveBeenCalled();
});
