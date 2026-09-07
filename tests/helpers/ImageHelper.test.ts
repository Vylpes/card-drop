import ImageHelper from "../../src/helpers/ImageHelper";
import AppLogger from "../../src/client/appLogger";
import Inventory from "../../src/database/entities/app/Inventory";
import { createCanvas, loadImage } from "canvas";
import { existsSync } from "fs";
import { Jimp } from "jimp";

jest.mock("../../src/client/appLogger");
jest.mock("../../src/database/entities/app/Inventory");
jest.mock("canvas");
jest.mock("fs");
jest.mock("jimp", () => ({
    Jimp: {
        read: jest.fn(),
        fromBitmap: jest.fn(),
        fromBuffer: jest.fn()
    }
}));

const drawImage = jest.fn();
const toBuffer = jest.fn();

function generateImageData() {
    return {
        greyscale: jest.fn(),
        getBuffer: jest.fn().mockResolvedValue(Buffer.from("image"))
    };
}

describe("GenerateCardImageGrid", () => {
    let imageData: ReturnType<typeof generateImageData>;

    beforeEach(() => {
        jest.resetAllMocks();

        process.env.DATA_DIR = "/data";

        imageData = generateImageData();

        toBuffer.mockReturnValue(Buffer.from("grid"));
        (createCanvas as jest.Mock).mockReturnValue({
            getContext: jest.fn().mockReturnValue({ drawImage }),
            toBuffer
        });
        (existsSync as jest.Mock).mockReturnValue(true);
        (Jimp.read as jest.Mock).mockResolvedValue({ bitmap: "bitmap" });
        (Jimp.fromBitmap as jest.Mock).mockReturnValue(imageData);
        (loadImage as jest.Mock).mockResolvedValue("loaded-image");
    });

    describe("GIVEN every card loads successfully", () => {
        test("EXPECT each card to be drawn onto the canvas", async () => {
            await ImageHelper.GenerateCardImageGrid([
                { id: "1", path: "one.png" },
                { id: "2", path: "two.png" }
            ]);

            expect(drawImage).toHaveBeenCalledTimes(2);
            expect(AppLogger.CatchError).not.toHaveBeenCalled();
        });
    });

    describe("GIVEN loading a card image throws", () => {
        const error = new Error("unreadable image");

        beforeEach(() => {
            (Jimp.read as jest.Mock)
                .mockRejectedValueOnce(error)
                .mockResolvedValue({ bitmap: "bitmap" });
        });

        test("EXPECT the error to be logged rather than swallowed", async () => {
            await ImageHelper.GenerateCardImageGrid([{ id: "1", path: "one.png" }]);

            expect(AppLogger.CatchError).toHaveBeenCalledTimes(1);
            expect(AppLogger.CatchError).toHaveBeenCalledWith("ImageHelper/GenerateCardImageGrid", error);
        });

        test("EXPECT the remaining cards to still be drawn", async () => {
            await ImageHelper.GenerateCardImageGrid([
                { id: "1", path: "one.png" },
                { id: "2", path: "two.png" }
            ]);

            expect(drawImage).toHaveBeenCalledTimes(1);
        });

        test("EXPECT a grid image to still be returned", async () => {
            const result = await ImageHelper.GenerateCardImageGrid([{ id: "1", path: "one.png" }]);

            expect(result).toEqual(Buffer.from("grid"));
        });
    });

    describe("GIVEN the card image cannot be found on disk or over http", () => {
        beforeEach(() => {
            (existsSync as jest.Mock).mockReturnValue(false);
        });

        test("EXPECT the card to be skipped with an error logged", async () => {
            await ImageHelper.GenerateCardImageGrid([{ id: "1", path: "missing.png" }]);

            expect(AppLogger.LogError).toHaveBeenCalledWith("ImageHelper/GenerateCardImageGrid", "Failed to load image from path missing.png");
            expect(drawImage).not.toHaveBeenCalled();
        });
    });

    describe("GIVEN a user id is supplied", () => {
        test("EXPECT unclaimed cards to be greyscaled", async () => {
            (Inventory.FetchOneByCardNumberAndUserId as jest.Mock).mockResolvedValue(null);

            await ImageHelper.GenerateCardImageGrid([{ id: "1", path: "one.png" }], "userId");

            expect(imageData.greyscale).toHaveBeenCalledTimes(1);
        });

        test("EXPECT cards held with a zero quantity to be greyscaled", async () => {
            (Inventory.FetchOneByCardNumberAndUserId as jest.Mock).mockResolvedValue({ Quantity: 0 });

            await ImageHelper.GenerateCardImageGrid([{ id: "1", path: "one.png" }], "userId");

            expect(imageData.greyscale).toHaveBeenCalledTimes(1);
        });

        test("EXPECT claimed cards to keep their colour", async () => {
            (Inventory.FetchOneByCardNumberAndUserId as jest.Mock).mockResolvedValue({ Quantity: 1 });

            await ImageHelper.GenerateCardImageGrid([{ id: "1", path: "one.png" }], "userId");

            expect(imageData.greyscale).not.toHaveBeenCalled();
        });
    });

    describe("GIVEN no user id is supplied", () => {
        test("EXPECT no inventory lookup and no greyscaling", async () => {
            await ImageHelper.GenerateCardImageGrid([{ id: "1", path: "one.png" }]);

            expect(Inventory.FetchOneByCardNumberAndUserId).not.toHaveBeenCalled();
            expect(imageData.greyscale).not.toHaveBeenCalled();
        });
    });
});
