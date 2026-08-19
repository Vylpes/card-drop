import { ChatInputCommandInteraction } from "discord.js";
import Multidrop from "../../src/commands/multidrop";
import GenerateCommandInteractionMock from "../__functions__/discord.js/GenerateCommandInteractionMock";
import { ChatInputCommandInteraction as ChatInputCommandInteractionMock } from "../__types__/discord.js";
import { CoreClient } from "../../src/client/client";
import Config from "../../src/database/entities/app/Config";
import User from "../../src/database/entities/app/User";
import GetCardsHelper from "../../src/helpers/DropHelpers/GetCardsHelper";
import Inventory from "../../src/database/entities/app/Inventory";
import MultidropEmbedHelper from "../../src/helpers/DropHelpers/MultidropEmbedHelper";
import * as fs from "fs";

jest.mock("../../src/database/entities/app/Config");
jest.mock("../../src/database/entities/app/User");
jest.mock("../../src/helpers/DropHelpers/GetCardsHelper");
jest.mock("../../src/database/entities/app/Inventory");
jest.mock("../../src/helpers/DropHelpers/MultidropEmbedHelper");
jest.mock("../../src/client/appLogger");
jest.mock("fs", () => ({
    ...jest.requireActual("fs"),
    readFileSync: jest.fn().mockReturnValue(Buffer.from("fake-image")),
}));

describe("execute", () => {
    describe("GIVEN randomCard image is hosted locally", () => {
        let interaction: ChatInputCommandInteractionMock;

        beforeAll(async () => {
            jest.resetAllMocks();
            (Config.GetValue as jest.Mock).mockResolvedValue("false");
            CoreClient.AllowDrops = true;
            process.env.DATA_DIR = "/data";

            interaction = GenerateCommandInteractionMock();

            const user = {
                Currency: 500,
                RemoveCurrency: jest.fn(),
                Save: jest.fn(),
            } as unknown as User;

            (User.FetchOneById as jest.Mock).mockResolvedValue(user);
            (MultidropEmbedHelper.GenerateMultidropEmbed as jest.Mock).mockReturnValue({ type: "Embed" });
            (MultidropEmbedHelper.GenerateMultidropButtons as jest.Mock).mockReturnValue({ type: "Button" });
            (Inventory.FetchOneByCardNumberAndUserId as jest.Mock).mockResolvedValue({ Quantity: 1 });
            (GetCardsHelper.GetRandomCard as jest.Mock).mockReturnValue({
                card: { id: "cardId", path: "series/card.png", type: 1 },
                series: { id: 1, name: "Series", cards: [] },
            });

            const multidrop = new Multidrop();
            await multidrop.execute(interaction as unknown as ChatInputCommandInteraction);
        });

        test("EXPECT image to be uploaded directly", () => {
            expect(fs.readFileSync).toHaveBeenCalledTimes(1);
            expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining("card.png"));

            const callArgs = (interaction.editReply as jest.Mock).mock.calls[0][0];
            expect(callArgs.files).toHaveLength(1);
        });
    });

    describe("GIVEN randomCard image is hosted via http", () => {
        let interaction: ChatInputCommandInteractionMock;

        beforeAll(async () => {
            jest.resetAllMocks();
            (Config.GetValue as jest.Mock).mockResolvedValue("false");
            CoreClient.AllowDrops = true;

            interaction = GenerateCommandInteractionMock();

            const user = {
                Currency: 500,
                RemoveCurrency: jest.fn(),
                Save: jest.fn(),
            } as unknown as User;

            (User.FetchOneById as jest.Mock).mockResolvedValue(user);
            (MultidropEmbedHelper.GenerateMultidropEmbed as jest.Mock).mockReturnValue({ type: "Embed" });
            (MultidropEmbedHelper.GenerateMultidropButtons as jest.Mock).mockReturnValue({ type: "Button" });
            (Inventory.FetchOneByCardNumberAndUserId as jest.Mock).mockResolvedValue({ Quantity: 1 });
            (GetCardsHelper.GetRandomCard as jest.Mock).mockReturnValue({
                card: { id: "cardId", path: "http://example.com/card.png", type: 1 },
                series: { id: 1, name: "Series", cards: [] },
            });

            const multidrop = new Multidrop();
            await multidrop.execute(interaction as unknown as ChatInputCommandInteraction);
        });

        test("EXPECT image link to be directly added to embed", () => {
            expect(fs.readFileSync).not.toHaveBeenCalled();

            const callArgs = (interaction.editReply as jest.Mock).mock.calls[0][0];
            expect(callArgs.files).toHaveLength(0);
        });
    });

    describe("GIVEN randomCard image is hosted via https", () => {
        let interaction: ChatInputCommandInteractionMock;

        beforeAll(async () => {
            jest.resetAllMocks();
            (Config.GetValue as jest.Mock).mockResolvedValue("false");
            CoreClient.AllowDrops = true;

            interaction = GenerateCommandInteractionMock();

            const user = {
                Currency: 500,
                RemoveCurrency: jest.fn(),
                Save: jest.fn(),
            } as unknown as User;

            (User.FetchOneById as jest.Mock).mockResolvedValue(user);
            (MultidropEmbedHelper.GenerateMultidropEmbed as jest.Mock).mockReturnValue({ type: "Embed" });
            (MultidropEmbedHelper.GenerateMultidropButtons as jest.Mock).mockReturnValue({ type: "Button" });
            (Inventory.FetchOneByCardNumberAndUserId as jest.Mock).mockResolvedValue({ Quantity: 1 });
            (GetCardsHelper.GetRandomCard as jest.Mock).mockReturnValue({
                card: { id: "cardId", path: "https://example.com/card.png", type: 1 },
                series: { id: 1, name: "Series", cards: [] },
            });

            const multidrop = new Multidrop();
            await multidrop.execute(interaction as unknown as ChatInputCommandInteraction);
        });

        test("EXPECT image link to be directly added to embed", () => {
            expect(fs.readFileSync).not.toHaveBeenCalled();

            const callArgs = (interaction.editReply as jest.Mock).mock.calls[0][0];
            expect(callArgs.files).toHaveLength(0);
        });
    });
});
