import { StringSelectMenuInteraction } from "discord.js";
import InventoryDropdown from "../../src/stringDropdowns/Inventory";
import InventoryHelper from "../../src/helpers/InventoryHelper";
import { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } from "discord.js";

jest.mock("../../src/client/appLogger");

function GenerateStringDropdownInteractionMock(value: string) {
    return {
        guild: {
            members: {
                cache: {
                    find: jest.fn().mockReturnValue({
                        user: {
                            id: "target-user-id",
                            username: "target-user",
                        },
                    }),
                },
                fetch: jest.fn(),
            },
        } as unknown,
        values: [ value ],
        deferUpdate: jest.fn(),
        editReply: jest.fn(),
        followUp: jest.fn(),
        reply: jest.fn(),
    };
}

beforeEach(() => {
    jest.resetAllMocks();
});

describe("execute", () => {
    test("GIVEN selected value has sortBy, EXPECT helper called with parsed sort", async () => {
        const interaction = GenerateStringDropdownInteractionMock("target-user-id 3 type");

        const parseSortSpy = jest.spyOn(InventoryHelper, "ParseSortBy").mockReturnValue("type");
        const generateSpy = jest.spyOn(InventoryHelper, "GenerateInventoryPage").mockResolvedValue({
            embed: {} as unknown as EmbedBuilder,
            image: {} as unknown as AttachmentBuilder,
            row1: {} as unknown as ActionRowBuilder<ButtonBuilder>,
            row2: {} as unknown as ActionRowBuilder<StringSelectMenuBuilder>,
        });

        const inventory = new InventoryDropdown();
        await inventory.execute(interaction as unknown as StringSelectMenuInteraction);

        expect(parseSortSpy).toHaveBeenCalledTimes(1);
        expect(parseSortSpy).toHaveBeenCalledWith("type");

        expect(generateSpy).toHaveBeenCalledTimes(1);
        expect(generateSpy).toHaveBeenCalledWith("target-user", "target-user-id", 3, "type");

        expect(interaction.deferUpdate).toHaveBeenCalledTimes(1);
        expect(interaction.editReply).toHaveBeenCalledTimes(1);
    });

    test("GIVEN selected value has no sortBy, EXPECT helper called with default id sort", async () => {
        const interaction = GenerateStringDropdownInteractionMock("target-user-id 4");

        const parseSortSpy = jest.spyOn(InventoryHelper, "ParseSortBy").mockReturnValue("id");
        const generateSpy = jest.spyOn(InventoryHelper, "GenerateInventoryPage").mockResolvedValue({
            embed: {} as unknown as EmbedBuilder,
            image: {} as unknown as AttachmentBuilder,
            row1: {} as unknown as ActionRowBuilder<ButtonBuilder>,
            row2: {} as unknown as ActionRowBuilder<StringSelectMenuBuilder>,
        });

        const inventory = new InventoryDropdown();
        await inventory.execute(interaction as unknown as StringSelectMenuInteraction);

        expect(parseSortSpy).toHaveBeenCalledTimes(1);
        expect(parseSortSpy).toHaveBeenCalledWith(undefined);

        expect(generateSpy).toHaveBeenCalledTimes(1);
        expect(generateSpy).toHaveBeenCalledWith("target-user", "target-user-id", 4, "id");
    });
});
