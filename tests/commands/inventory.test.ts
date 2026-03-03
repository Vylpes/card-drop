import { ChatInputCommandInteraction } from "discord.js";
import InventoryCommand from "../../src/commands/inventory";
import InventoryHelper from "../../src/helpers/InventoryHelper";

jest.mock("../../src/client/appLogger");

beforeEach(() => {
    jest.resetAllMocks();
});

test("EXPECT CommandBuilder to be defined", () => {
    const command = new InventoryCommand();

    expect(command.CommandBuilder).toMatchSnapshot();
});

describe("execute", () => {
    test("GIVEN sortby is provided, EXPECT helper called with selected sort", async () => {
        const generateSpy = jest.spyOn(InventoryHelper, "GenerateInventoryPage").mockResolvedValue({
            embed: {} as any,
            image: {} as any,
            row1: {} as any,
            row2: {} as any,
        });
        const parseSpy = jest.spyOn(InventoryHelper, "ParseSortBy").mockReturnValue("name");

        const interaction = {
            options: {
                get: jest.fn((key: string) => {
                    switch (key) {
                    case "page":
                        return { value: 2 };
                    case "sortby":
                        return { value: "name" };
                    case "user":
                        return { user: { id: "target-user-id", username: "target-user" } };
                    default:
                        return undefined;
                    }
                }),
            },
            user: {
                id: "interaction-user-id",
                username: "interaction-user",
            },
            deferReply: jest.fn(),
            followUp: jest.fn(),
        };

        const command = new InventoryCommand();
        await command.execute(interaction as unknown as ChatInputCommandInteraction);

        expect(parseSpy).toHaveBeenCalledTimes(1);
        expect(parseSpy).toHaveBeenCalledWith("name");

        expect(generateSpy).toHaveBeenCalledTimes(1);
        expect(generateSpy).toHaveBeenCalledWith("target-user", "target-user-id", 1, "name");
    });

    test("GIVEN sortby is omitted, EXPECT helper called with default id sort", async () => {
        const generateSpy = jest.spyOn(InventoryHelper, "GenerateInventoryPage").mockResolvedValue({
            embed: {} as any,
            image: {} as any,
            row1: {} as any,
            row2: {} as any,
        });
        const parseSpy = jest.spyOn(InventoryHelper, "ParseSortBy").mockReturnValue("id");

        const interaction = {
            options: {
                get: jest.fn((key: string) => {
                    switch (key) {
                    case "page":
                        return undefined;
                    case "sortby":
                        return undefined;
                    case "user":
                        return undefined;
                    default:
                        return undefined;
                    }
                }),
            },
            user: {
                id: "interaction-user-id",
                username: "interaction-user",
            },
            deferReply: jest.fn(),
            followUp: jest.fn(),
        };

        const command = new InventoryCommand();
        await command.execute(interaction as unknown as ChatInputCommandInteraction);

        expect(parseSpy).toHaveBeenCalledTimes(1);
        expect(parseSpy).toHaveBeenCalledWith(undefined);

        expect(generateSpy).toHaveBeenCalledTimes(1);
        expect(generateSpy).toHaveBeenCalledWith("interaction-user", "interaction-user-id", 0, "id");
    });
});
