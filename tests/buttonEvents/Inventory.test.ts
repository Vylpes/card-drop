import { ButtonInteraction } from "discord.js";
import InventoryButton from "../../src/buttonEvents/Inventory";
import InventoryHelper from "../../src/helpers/InventoryHelper";
import GenerateButtonInteractionMock from "../__functions__/discord.js/GenerateButtonInteractionMock";
import { ButtonInteraction as ButtonInteractionType } from "../__types__/discord.js";

jest.mock("../../src/client/appLogger");

let interaction: ButtonInteractionType;

beforeEach(() => {
    jest.resetAllMocks();

    interaction = GenerateButtonInteractionMock();

    interaction.guild = {
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
    } as unknown as object;
}
);

describe("execute", () => {
    test("GIVEN interaction has sortBy in customId, EXPECT helper called with parsed sort", async () => {
        interaction.customId = "inventory target-user-id 2 name";

        const parseSortSpy = jest.spyOn(InventoryHelper, "ParseSortBy").mockReturnValue("name");
        const generateSpy = jest.spyOn(InventoryHelper, "GenerateInventoryPage").mockResolvedValue({
            embed: {} as any,
            image: {} as any,
            row1: {} as any,
            row2: {} as any,
        });

        const inventory = new InventoryButton();
        await inventory.execute(interaction as unknown as ButtonInteraction);

        expect(parseSortSpy).toHaveBeenCalledTimes(1);
        expect(parseSortSpy).toHaveBeenCalledWith("name");

        expect(generateSpy).toHaveBeenCalledTimes(1);
        expect(generateSpy).toHaveBeenCalledWith("target-user", "target-user-id", 2, "name");

        expect(interaction.deferUpdate).toHaveBeenCalledTimes(1);
        expect(interaction.editReply).toHaveBeenCalledTimes(1);
    });

    test("GIVEN interaction does not have sortBy in customId, EXPECT helper called with default id sort", async () => {
        interaction.customId = "inventory target-user-id 1";

        const parseSortSpy = jest.spyOn(InventoryHelper, "ParseSortBy").mockReturnValue("id");
        const generateSpy = jest.spyOn(InventoryHelper, "GenerateInventoryPage").mockResolvedValue({
            embed: {} as any,
            image: {} as any,
            row1: {} as any,
            row2: {} as any,
        });

        const inventory = new InventoryButton();
        await inventory.execute(interaction as unknown as ButtonInteraction);

        expect(parseSortSpy).toHaveBeenCalledTimes(1);
        expect(parseSortSpy).toHaveBeenCalledWith(undefined);

        expect(generateSpy).toHaveBeenCalledTimes(1);
        expect(generateSpy).toHaveBeenCalledWith("target-user", "target-user-id", 1, "id");
    });
});
