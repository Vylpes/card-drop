import {createCanvas, loadImage} from "canvas";
import path from "path";
import AppLogger from "../client/appLogger";
import {existsSync} from "fs";

export default class ImageHelper {
    public static async GenerateCardImageGrid(paths: string[]): Promise<Buffer> {
        const gridWidth = 3;
        const gridHeight = Math.ceil(paths.length / gridWidth);

        const imageWidth = 526;
        const imageHeight = 712;

        const canvasWidth = imageWidth * gridWidth;
        const canvasHeight = imageHeight * gridHeight;

        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext("2d");

        for (let i = 0; i < paths.length; i++) {
            const filePath = path.join(process.env.DATA_DIR!, "cards", paths[i]);

            const exists = existsSync(filePath);

            if (!exists) {
                AppLogger.LogError("ImageHelper/GenerateCardImageGrid", `Failed to load image from path ${paths[i]}`);
                continue;
            }

            const image = await loadImage(filePath);

            const x = i % gridWidth;
            const y = Math.floor(i / gridWidth);

            const imageX = imageWidth * x;
            const imageY = imageHeight * y;

            ctx.drawImage(image, imageX, imageY);
        }

        return canvas.toBuffer();
    }
}
