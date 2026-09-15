import { ButtonInteraction } from "discord.js";
import MultidropButtonEvent from "../../src/buttonEvents/Multidrop";
import Inventory from "../../src/database/entities/app/Inventory";
import Multidrop from "../../src/database/entities/app/Multidrop";
import User from "../../src/database/entities/app/User";
import GetCardsHelper from "../../src/helpers/DropHelpers/GetCardsHelper";
import MultidropEmbedHelper from "../../src/helpers/DropHelpers/MultidropEmbedHelper";
import GenerateButtonInteractionMock from "../__functions__/discord.js/GenerateButtonInteractionMock";

jest.mock("../../src/client/appLogger");
jest.mock("../../src/database/entities/app/Inventory");
jest.mock("../../src/database/entities/app/Multidrop");
jest.mock("../../src/database/entities/app/User");
jest.mock("../../src/helpers/DropHelpers/GetCardsHelper");
jest.mock("../../src/helpers/DropHelpers/MultidropEmbedHelper");

describe("execute", () => {
    test("GIVEN the final card is kept EXPECT a completed summary and multidrop removal", async () => {
        const interaction = GenerateButtonInteractionMock();
        interaction.customId = "multidrop keep card-11 0 multidrop-id";

        const multidrop = {
            Id: "multidrop-id",
            UserId: "userId",
            CardsKept: [ "card-1" ],
            CardsSacrificed: [ "card-2" ],
            Keep: jest.fn(),
            Save: jest.fn(),
        } as unknown as Multidrop;
        multidrop.Keep = jest.fn(() => multidrop.CardsKept.push("card-11"));

        const user = {
            Currency: 250,
        } as User;
        const inventory = {
            AddQuantity: jest.fn(),
            Save: jest.fn(),
        } as unknown as Inventory;
        const summaryEmbed = { type: "summary" };

        (Multidrop.FetchOneById as jest.Mock).mockResolvedValue(multidrop);
        (GetCardsHelper.GetCardByCardNumber as jest.Mock).mockReturnValue({
            card: { id: "card-11" },
        });
        (User.FetchOneById as jest.Mock).mockResolvedValue(user);
        (Inventory.FetchOneByCardNumberAndUserId as jest.Mock).mockResolvedValue(inventory);
        (MultidropEmbedHelper.GenerateSummaryEmbed as jest.Mock).mockReturnValue(summaryEmbed);

        await new MultidropButtonEvent().execute(interaction as unknown as ButtonInteraction);

        expect(MultidropEmbedHelper.GenerateSummaryEmbed).toHaveBeenCalledWith(
            [ "card-1", "card-11" ],
            [ "card-2" ],
            250);
        expect(interaction.update).toHaveBeenCalledWith({
            embeds: [ summaryEmbed ],
            attachments: [],
            components: [],
        });
        expect(Multidrop.Remove).toHaveBeenCalledWith(Multidrop, multidrop);
    });

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
                series: { id: 1, name: "Series", cards: [] }
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
                series: { id: 1, name: "Series", cards: [] }
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
                series: { id: 1, name: "Series", cards: [] }
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
