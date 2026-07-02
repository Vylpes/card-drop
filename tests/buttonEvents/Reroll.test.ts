import { ButtonInteraction } from "discord.js";
import Reroll from "../../src/buttonEvents/Reroll";
import GenerateButtonInteractionMock from "../__functions__/discord.js/GenerateButtonInteractionMock";
import { ButtonInteraction as ButtonInteractionType } from "../__types__/discord.js";
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
jest.mock("../../src/client/appLogger");
jest.mock("uuid");

const randomCard = {
    card: {
        id: "cardId",
        path: "https://example.com/card.png",
        type: 1,
    },
    series: { id: 1, name: "Series", cards: [] },
};

describe("GIVEN valid conditions", () => {
    let interaction: ButtonInteractionType;
    let user: User;

    beforeAll(async () => {
        jest.resetAllMocks();
        (Config.GetValue as jest.Mock).mockResolvedValue("false");
        CoreClient.AllowDrops = true;

        interaction = GenerateButtonInteractionMock();
        interaction.customId = "reroll cardId false";

        user = {
            Currency: 500,
            RemoveCurrency: jest.fn().mockReturnValue(true),
            Save: jest.fn(),
        } as unknown as User;

        (User.FetchOneById as jest.Mock).mockResolvedValue(user);
        (GetCardsHelper.FetchCard as jest.Mock).mockResolvedValue(randomCard);
        (Inventory.FetchOneByCardNumberAndUserId as jest.Mock).mockResolvedValue({ Quantity: 1 });
        (DropEmbedHelper.GenerateDropEmbed as jest.Mock).mockReturnValue({ type: "Embed" });
        (DropEmbedHelper.GenerateDropButtons as jest.Mock).mockReturnValue({ type: "Button" });
        (uuid.v4 as jest.Mock).mockReturnValue("uuid");

        const reroll = new Reroll();
        await reroll.execute(interaction as unknown as ButtonInteraction);
    });

    test("EXPECT user.RemoveCurrency to be called", () => {
        expect(user.RemoveCurrency).toHaveBeenCalledTimes(1);
        expect(user.RemoveCurrency).toHaveBeenCalledWith(CardConstants.ClaimCost);
    });

    test("GIVEN user is saved", () => {
        expect(user.Save).toHaveBeenCalledTimes(1);
        expect(user.Save).toHaveBeenCalledWith(User, user);
    });
});

test("GIVEN user.RemoveCurrency fails, EXPECT error replied", async () => {
    jest.resetAllMocks();
    (Config.GetValue as jest.Mock).mockResolvedValue("false");
    CoreClient.AllowDrops = true;

    const interaction = GenerateButtonInteractionMock();
    interaction.customId = "reroll cardId false";

    const user = {
        Currency: 0,
        RemoveCurrency: jest.fn().mockReturnValue(false),
        Save: jest.fn(),
    } as unknown as User;

    (User.FetchOneById as jest.Mock).mockResolvedValue(user);

    const reroll = new Reroll();
    await reroll.execute(interaction as unknown as ButtonInteraction);

    expect(interaction.reply).toHaveBeenCalledTimes(1);
    expect(interaction.reply).toHaveBeenCalledWith(
        `Not enough currency! You need ${CardConstants.ClaimCost} currency, you have 0!`
    );
});