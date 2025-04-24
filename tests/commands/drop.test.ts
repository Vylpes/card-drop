import { CommandInteraction } from "discord.js";
import Drop from "../../src/commands/drop";
import GenerateCommandInteractionMock from "../__functions__/discord.js/GenerateCommandInteractionMock";
import { CommandInteraction as CommandInteractionMock } from "../__types__/discord.js";
import { CoreClient } from "../../src/client/client";
import Config from "../../src/database/entities/app/Config";
import User from "../../src/database/entities/app/User";
import GetCardsHelper from "../../src/helpers/DropHelpers/GetCardsHelper";
import Inventory from "../../src/database/entities/app/Inventory";
import DropEmbedHelper from "../../src/helpers/DropHelpers/DropEmbedHelper";
import CardConstants from "../../src/constants/CardConstants";

jest.mock("../../src/database/entities/app/Config");
jest.mock("../../src/database/entities/app/User");
jest.mock("../../src/helpers/DropHelpers/GetCardsHelper");
jest.mock("../../src/database/entities/app/Inventory");
jest.mock("../../src/helpers/DropHelpers/DropEmbedHelper");

beforeEach(() => {
    (Config.GetValue as jest.Mock).mockResolvedValue("false");
});

describe("execute", () => {
    describe("GIVEN user is in the database", () => {
        let interaction: CommandInteractionMock;
        let user: User;

        beforeAll(async () => {
            // Arrange
            CoreClient.AllowDrops = true;

            interaction = GenerateCommandInteractionMock();

            user = {
                RemoveCurrency: jest.fn().mockReturnValue(true),
                Save: jest.fn(),
            } as unknown as User;

            (User.FetchOneById as jest.Mock).mockResolvedValue(user);
            (GetCardsHelper.FetchCard as jest.Mock).mockResolvedValue({
                card: {
                    path: "https://google.com/",
                }
            });
            (Inventory.FetchOneByCardNumberAndUserId as jest.Mock).mockResolvedValue({
                Quantity: 1,
            });
            (DropEmbedHelper.GenerateDropEmbed as jest.Mock).mockResolvedValue({
                type: "Embed",
            });
            (DropEmbedHelper.GenerateDropButtons as jest.Mock).mockResolvedValue({
                type: "Button",
            });
            
            // Act
            const drop = new Drop();
            await drop.execute(interaction as unknown as CommandInteraction);
        });

        test("EXPECT user to be fetched", () => {
            expect(User.FetchOneById).toHaveBeenCalledTimes(1);
            expect(User.FetchOneById).toHaveBeenCalledWith(User, "userId");
        });

        test("EXPECT user.RemoveCurrency to be called", () => {
            expect(user.RemoveCurrency).toHaveBeenCalledTimes(1);
            expect(user.RemoveCurrency).toHaveBeenCalledWith(CardConstants.ClaimCost);
        });

        test.todo("EXPECT user to be saved");

        test.todo("EXPECT random card to be fetched");

        test.todo("EXPECT interaction to be deferred");

        test.todo("EXPECT Inventory.FetchOneByCardNumberAndUserId to be called");

        test.todo("EXPECT DropEmbedHelper.GenerateDropEmbed to be called");

        test.todo("EXPECT DropEmbedHelper.GenerateDropButtons to be called");

        test.todo("EXPECT interaction to be edited");

        describe("AND randomCard path is not a url", () => {
            test.todo("EXPECT image read from file system");

            test.todo("EXPECT files on the embed to contain the image as an attachment");
        });
    });

    describe("GIVEN user is not in the database", () => {
        test.todo("EXPECT new user to be created");
    });

    describe("GIVEN user.RemoveCurrency fails", () => {
        test.todo("EXPECT error replied");
    });
    
    describe("GIVEN randomCard returns null", () => {
        test.todo("EXPECT error logged");

        test.todo("EXPECT error replied");
    });

    describe("GIVEN the code throws an error", () => {
        test.todo("EXPECT error logged");

        test.todo("EXPECT interaction edited with error");
    });
});