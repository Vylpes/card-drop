import { ChatInputCommandInteraction } from "discord.js";
import Give from "../../src/commands/give";
import { CoreClient } from "../../src/client/client";
import Config from "../../src/database/entities/app/Config";
import Inventory from "../../src/database/entities/app/Inventory";
import GetCardsHelper from "../../src/helpers/DropHelpers/GetCardsHelper";
import GenerateCommandInteractionMock from "../__functions__/discord.js/GenerateCommandInteractionMock";
import { ChatInputCommandInteraction as ChatInputCommandInteractionMock } from "../__types__/discord.js";

jest.mock("../../src/database/entities/app/Config");
jest.mock("../../src/database/entities/app/Inventory");
jest.mock("../../src/helpers/DropHelpers/GetCardsHelper");
jest.mock("../../src/client/appLogger");

type GiveCommandInteraction = ChatInputCommandInteractionMock & {
    options: ChatInputCommandInteractionMock["options"] & {
        get: jest.Mock,
    }
};

const adminUserId = "adminUserId";
const targetUserId = "targetUserId";
const targetUsername = "targetUser";
const cardNumber = "card-1";
const card = {
    card: {
        id: cardNumber,
        name: "Test Card",
    },
};

function createInteraction(options?: {
    quantity?: number | null,
    cardnumber?: string,
    userId?: string,
}): GiveCommandInteraction {
    const interaction = GenerateCommandInteractionMock({ subcommand: "card" }) as GiveCommandInteraction;

    interaction.user = { id: adminUserId };
    interaction.options.get = jest.fn((name: string) => {
        switch (name) {
        case "cardnumber":
            return { value: options?.cardnumber ?? cardNumber };
        case "user":
            return {
                user: {
                    id: targetUserId,
                    username: targetUsername,
                },
            };
        case "quantity":
            if (options?.quantity === null || options?.quantity === undefined) {
                return undefined;
            }

            return { value: options.quantity };
        default:
            return undefined;
        }
    });

    if (options?.userId) {
        interaction.user = { id: options.userId };
    }

    return interaction;
}

describe("Give card", () => {
    const originalBotAdmins = process.env.BOT_ADMINS;

    beforeEach(() => {
        jest.resetAllMocks();

        process.env.BOT_ADMINS = adminUserId;
        CoreClient.AllowDrops = true;
        (Config.GetValue as jest.Mock).mockResolvedValue("false");
        (GetCardsHelper.GetCardByCardNumber as jest.Mock).mockReturnValue(card);
        (Inventory as unknown as jest.Mock).mockImplementation((userId: string, cardId: string, quantity: number) => ({
            UserId: userId,
            CardNumber: cardId,
            Quantity: quantity,
            Save: jest.fn(),
            AddQuantity: jest.fn(),
        }));
    });

    afterAll(() => {
        process.env.BOT_ADMINS = originalBotAdmins;
    });

    test("GIVEN quantity is omitted, EXPECT one copy granted and reply includes amount and total", async () => {
        const inventory = {
            Quantity: 2,
            AddQuantity: jest.fn(function (this: { Quantity: number }, amount: number) {
                this.Quantity += amount;
            }),
            Save: jest.fn(),
        };
        (Inventory.FetchOneByCardNumberAndUserId as jest.Mock).mockResolvedValue(inventory);

        const interaction = createInteraction();
        await new Give().execute(interaction as unknown as ChatInputCommandInteraction);

        expect(inventory.AddQuantity).toHaveBeenCalledWith(1);
        expect(inventory.Save).toHaveBeenCalledWith(Inventory, inventory);
        expect(interaction.reply).toHaveBeenCalledWith(
            `Card ${card.card.name} x1 given to ${targetUsername}, they now have 3`);
    });

    test("GIVEN quantity is omitted and user has no inventory, EXPECT new inventory created with quantity 1", async () => {
        (Inventory.FetchOneByCardNumberAndUserId as jest.Mock).mockResolvedValue(null);

        const interaction = createInteraction();
        await new Give().execute(interaction as unknown as ChatInputCommandInteraction);

        expect(Inventory).toHaveBeenCalledWith(targetUserId, cardNumber, 1);
        expect(interaction.reply).toHaveBeenCalledWith(
            `Card ${card.card.name} x1 given to ${targetUsername}, they now have 1`);
    });

    test("GIVEN explicit quantity, EXPECT that many copies granted and reply includes amount and total", async () => {
        const inventory = {
            Quantity: 4,
            AddQuantity: jest.fn(function (this: { Quantity: number }, amount: number) {
                this.Quantity += amount;
            }),
            Save: jest.fn(),
        };
        (Inventory.FetchOneByCardNumberAndUserId as jest.Mock).mockResolvedValue(inventory);

        const interaction = createInteraction({ quantity: 5 });
        await new Give().execute(interaction as unknown as ChatInputCommandInteraction);

        expect(inventory.AddQuantity).toHaveBeenCalledWith(5);
        expect(inventory.Save).toHaveBeenCalledWith(Inventory, inventory);
        expect(interaction.reply).toHaveBeenCalledWith(
            `Card ${card.card.name} x5 given to ${targetUsername}, they now have 9`);
    });

    test("GIVEN explicit quantity and user has no inventory, EXPECT new inventory created with that quantity", async () => {
        (Inventory.FetchOneByCardNumberAndUserId as jest.Mock).mockResolvedValue(null);

        const interaction = createInteraction({ quantity: 5 });
        await new Give().execute(interaction as unknown as ChatInputCommandInteraction);

        expect(Inventory).toHaveBeenCalledWith(targetUserId, cardNumber, 5);
        expect(interaction.reply).toHaveBeenCalledWith(
            `Card ${card.card.name} x5 given to ${targetUsername}, they now have 5`);
    });

    test("GIVEN quantity is less than 1, EXPECT rejection and no inventory changes", async () => {
        const interaction = createInteraction({ quantity: 0 });
        await new Give().execute(interaction as unknown as ChatInputCommandInteraction);

        expect(interaction.reply).toHaveBeenCalledWith("Quantity must be at least 1.");
        expect(Inventory.FetchOneByCardNumberAndUserId).not.toHaveBeenCalled();
        expect(GetCardsHelper.GetCardByCardNumber).not.toHaveBeenCalled();
    });

    test("GIVEN quantity is negative, EXPECT rejection and no inventory changes", async () => {
        const interaction = createInteraction({ quantity: -3 });
        await new Give().execute(interaction as unknown as ChatInputCommandInteraction);

        expect(interaction.reply).toHaveBeenCalledWith("Quantity must be at least 1.");
        expect(Inventory.FetchOneByCardNumberAndUserId).not.toHaveBeenCalled();
    });

    test("GIVEN user is not whitelisted, EXPECT error and no inventory changes", async () => {
        const interaction = createInteraction({ userId: "notAdmin" });
        await new Give().execute(interaction as unknown as ChatInputCommandInteraction);

        expect(interaction.reply).toHaveBeenCalledWith("Only whitelisted users can use this command.");
        expect(Inventory.FetchOneByCardNumberAndUserId).not.toHaveBeenCalled();
    });

    test("GIVEN drops are blocked, EXPECT error and no inventory changes", async () => {
        CoreClient.AllowDrops = false;

        const interaction = createInteraction({ quantity: 5 });
        await new Give().execute(interaction as unknown as ChatInputCommandInteraction);

        expect(interaction.reply).toHaveBeenCalledWith("Bot is currently syncing, please wait until its done.");
        expect(Inventory.FetchOneByCardNumberAndUserId).not.toHaveBeenCalled();
    });

    test("GIVEN safe mode is enabled, EXPECT error and no inventory changes", async () => {
        (Config.GetValue as jest.Mock).mockResolvedValue("true");

        const interaction = createInteraction({ quantity: 5 });
        await new Give().execute(interaction as unknown as ChatInputCommandInteraction);

        expect(interaction.reply).toHaveBeenCalledWith("Safe Mode has been activated, please resync to continue.");
        expect(Inventory.FetchOneByCardNumberAndUserId).not.toHaveBeenCalled();
    });

    test("GIVEN card number is invalid, EXPECT error and no inventory changes", async () => {
        (GetCardsHelper.GetCardByCardNumber as jest.Mock).mockReturnValue(null);

        const interaction = createInteraction({ quantity: 5 });
        await new Give().execute(interaction as unknown as ChatInputCommandInteraction);

        expect(interaction.reply).toHaveBeenCalledWith("Unable to fetch card, please try again.");
        expect(Inventory).not.toHaveBeenCalled();
    });
});
