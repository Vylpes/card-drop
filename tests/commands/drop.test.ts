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
import * as uuid from "uuid";

jest.mock("../../src/database/entities/app/Config");
jest.mock("../../src/database/entities/app/User");
jest.mock("../../src/helpers/DropHelpers/GetCardsHelper");
jest.mock("../../src/database/entities/app/Inventory");
jest.mock("../../src/helpers/DropHelpers/DropEmbedHelper");

jest.mock("uuid");

beforeEach(() => {
    (Config.GetValue as jest.Mock).mockResolvedValue("false");
});

describe("execute", () => {
    describe("GIVEN user is in the database", () => {
        let interaction: CommandInteractionMock;
        let user: User;
        const randomCard = {
            card: {
                id: "cardId",
                path: "https://google.com/",
            }
        };

        beforeAll(async () => {
            // Arrange
            CoreClient.AllowDrops = true;

            interaction = GenerateCommandInteractionMock();

            user = {
                Currency: 500,
                RemoveCurrency: jest.fn().mockReturnValue(true),
                Save: jest.fn(),
            } as unknown as User;

            (User.FetchOneById as jest.Mock).mockResolvedValue(user);
            (GetCardsHelper.FetchCard as jest.Mock).mockResolvedValue(randomCard);
            (Inventory.FetchOneByCardNumberAndUserId as jest.Mock).mockResolvedValue({
                Quantity: 1,
            });
            (DropEmbedHelper.GenerateDropEmbed as jest.Mock).mockReturnValue({
                type: "Embed",
            });
            (DropEmbedHelper.GenerateDropButtons as jest.Mock).mockReturnValue({
                type: "Button",
            });

            (uuid.v4 as jest.Mock).mockReturnValue("uuid");

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

        test("EXPECT user to be saved", () => {
            expect(user.Save).toHaveBeenCalledTimes(1);
            expect(user.Save).toHaveBeenCalledWith(User, user);
        });

        test("EXPECT random card to be fetched", () => {
            expect(GetCardsHelper.FetchCard).toHaveBeenCalledTimes(1);
            expect(GetCardsHelper.FetchCard).toHaveBeenCalledWith("userId");
        });

        test("EXPECT interaction to be deferred", () => {
            expect(interaction.deferReply).toHaveBeenCalledTimes(1);
        });

        test("EXPECT Inventory.FetchOneByCardNumberAndUserId to be called", () => {
            expect(Inventory.FetchOneByCardNumberAndUserId).toHaveBeenCalledTimes(1);
            expect(Inventory.FetchOneByCardNumberAndUserId).toHaveBeenCalledWith("userId", "cardId");
        });

        test("EXPECT DropEmbedHelper.GenerateDropEmbed to be called", () => {
            expect(DropEmbedHelper.GenerateDropEmbed).toHaveBeenCalledTimes(1);
            expect(DropEmbedHelper.GenerateDropEmbed).toHaveBeenCalledWith(randomCard, 1, "", undefined, 500);
        });

        test("EXPECT DropEmbedHelper.GenerateDropButtons to be called", () => {
            expect(DropEmbedHelper.GenerateDropButtons).toHaveBeenCalledTimes(1);
            expect(DropEmbedHelper.GenerateDropButtons).toHaveBeenCalledWith(randomCard, "uuid", "userId");
        });

        test("EXPECT interaction to be edited", () => {
            expect(interaction.editReply).toHaveBeenCalledTimes(1);
            expect(interaction.editReply).toHaveBeenCalledWith({
                embeds: [ { type: "Embed" } ],
                files: [],
                components: [ { type: "Button" } ],
            });
        });

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