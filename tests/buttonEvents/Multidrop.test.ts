import { ButtonInteraction } from "discord.js";
import Multidrop from "../../src/buttonEvents/Multidrop";
import GenerateButtonInteractionMock from "../__functions__/discord.js/GenerateButtonInteractionMock";
import { ButtonInteraction as ButtonInteractionType } from "../__types__/discord.js";
import User from "../../src/database/entities/app/User";
import Inventory from "../../src/database/entities/app/Inventory";
import GetCardsHelper from "../../src/helpers/DropHelpers/GetCardsHelper";
import MultidropEmbedHelper from "../../src/helpers/DropHelpers/MultidropEmbedHelper";
import * as fs from "fs";

jest.mock("../../src/database/entities/app/User");
jest.mock("../../src/database/entities/app/Inventory");
jest.mock("../../src/helpers/DropHelpers/GetCardsHelper");
jest.mock("../../src/helpers/DropHelpers/MultidropEmbedHelper");
jest.mock("../../src/client/appLogger");
jest.mock("fs", () => ({
    ...jest.requireActual("fs"),
    readFileSync: jest.fn().mockReturnValue(Buffer.from("fake-image")),
}));

/**
 * Sets up common mocks shared across all Multidrop button event test scenarios.
 * Configures User, Inventory, embed helpers, and card lookup mocks needed for
 * the Keep action to proceed past the initial guard checks.
 */
function setupCommonMocks() {
    const user = {
        Currency: 500,
        AddCurrency: jest.fn(),
        Save: jest.fn(),
    } as unknown as User;

    (User.FetchOneById as jest.Mock).mockResolvedValue(user);
    (Inventory.FetchOneByCardNumberAndUserId as jest.Mock).mockResolvedValue({
        Quantity: 1,
        AddQuantity: jest.fn(),
        Save: jest.fn(),
    });
    (MultidropEmbedHelper.GenerateMultidropEmbed as jest.Mock).mockReturnValue({ type: "Embed" });
    (MultidropEmbedHelper.GenerateMultidropButtons as jest.Mock).mockReturnValue({ type: "Button" });

    // Setup GetCardsHelper.GetCardByCardNumber for the Keep action (cardNumber = "cardId")
    (GetCardsHelper.GetCardByCardNumber as jest.Mock).mockReturnValue({
        card: { id: "cardId", name: "Card", type: 1, path: "series/card.png" },
        series: { id: 1, name: "Series", cards: [] },
    });
}

describe("execute", () => {
    describe("GIVEN randomCard image is hosted locally", () => {
        let interaction: ButtonInteractionType;

        beforeAll(async () => {
            jest.resetAllMocks();
            process.env.DATA_DIR = "/data";

            interaction = GenerateButtonInteractionMock();
            // customId: "multidrop keep cardNumber cardsRemaining userId"
            interaction.customId = "multidrop keep cardId 1 userId";

            setupCommonMocks();

            (GetCardsHelper.GetRandomCard as jest.Mock).mockReturnValue({
                card: { id: "nextCardId", path: "series/next.png", type: 1 },
                series: { id: 1, name: "Series", cards: [] },
            });

            const multidrop = new Multidrop();
            await multidrop.execute(interaction as unknown as ButtonInteraction);
        });

        test("EXPECT image to be uploaded directly", () => {
            expect(fs.readFileSync).toHaveBeenCalledTimes(1);
            expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining("next.png"));

            const callArgs = (interaction.editReply as jest.Mock).mock.calls[0][0];
            expect(callArgs.files).toHaveLength(1);
        });
    });

    describe("GIVEN randomCard image is hosted via http", () => {
        let interaction: ButtonInteractionType;

        beforeAll(async () => {
            jest.resetAllMocks();

            interaction = GenerateButtonInteractionMock();
            interaction.customId = "multidrop keep cardId 1 userId";

            setupCommonMocks();

            (GetCardsHelper.GetRandomCard as jest.Mock).mockReturnValue({
                card: { id: "nextCardId", path: "http://example.com/card.png", type: 1 },
                series: { id: 1, name: "Series", cards: [] },
            });

            const multidrop = new Multidrop();
            await multidrop.execute(interaction as unknown as ButtonInteraction);
        });

        test("EXPECT image link to be directly added to embed", () => {
            expect(fs.readFileSync).not.toHaveBeenCalled();

            const callArgs = (interaction.editReply as jest.Mock).mock.calls[0][0];
            expect(callArgs.files).toHaveLength(0);
        });
    });

    describe("GIVEN randomCard image is hosted via https", () => {
        let interaction: ButtonInteractionType;

        beforeAll(async () => {
            jest.resetAllMocks();

            interaction = GenerateButtonInteractionMock();
            interaction.customId = "multidrop keep cardId 1 userId";

            setupCommonMocks();

            (GetCardsHelper.GetRandomCard as jest.Mock).mockReturnValue({
                card: { id: "nextCardId", path: "https://example.com/card.png", type: 1 },
                series: { id: 1, name: "Series", cards: [] },
            });

            const multidrop = new Multidrop();
            await multidrop.execute(interaction as unknown as ButtonInteraction);
        });

        test("EXPECT image link to be directly added to embed", () => {
            expect(fs.readFileSync).not.toHaveBeenCalled();

            const callArgs = (interaction.editReply as jest.Mock).mock.calls[0][0];
            expect(callArgs.files).toHaveLength(0);
        });
    });
});
