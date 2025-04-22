import {createCanvas, loadImage} from "canvas";
import path from "path";
import AppLogger from "../client/appLogger";
import {existsSync} from "fs";
import Inventory from "../database/entities/app/Inventory";
import { Bitmap, Jimp } from "jimp";
import axios from "axios";

interface CardInput {
    id: string;
    path: string;
}

export default class ImageHelper {
    public static async GenerateCardImageGrid(cards: CardInput[], userId?: string): Promise<Buffer> {
        const gridWidth = 3;
        const gridHeight = Math.ceil(cards.length / gridWidth);

        const imageWidth = 526;
        const imageHeight = 712;

        const canvasWidth = imageWidth * gridWidth;
        const canvasHeight = imageHeight * gridHeight;

        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext("2d");

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];

            const filePath = path.join(process.env.DATA_DIR!, "cards", card.path);

            let bitmap: Bitmap;

            if (existsSync(filePath)) {
                const data = await Jimp.read(filePath);

                bitmap = data.bitmap;
            } else if (card.path.startsWith("http://") || card.path.startsWith("https://")) {
                const response = await axios.get(card.path, { responseType: "arraybuffer" });
                const buffer = Buffer.from(response.data);
                const data = await Jimp.fromBuffer(buffer);

                bitmap = data.bitmap;
            } else {
                AppLogger.LogError("ImageHelper/GenerateCardImageGrid", `Failed to load image from path ${card.path}`);
                continue;
            }

            const imageData = Jimp.fromBitmap(bitmap);

            if (userId != null) {
                const claimed = await Inventory.FetchOneByCardNumberAndUserId(userId, card.id);

                if (!claimed || claimed.Quantity == 0) {
                    imageData.greyscale();
                }
            }

            const image = await loadImage(await imageData.getBuffer("image/png"));

            const x = i % gridWidth;
            const y = Math.floor(i / gridWidth);

            const imageX = imageWidth * x;
            const imageY = imageHeight * y;

            ctx.drawImage(image, imageX, imageY);
        }

        return canvas.toBuffer();
    }
}
