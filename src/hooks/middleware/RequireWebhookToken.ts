import { NextFunction, Request, Response } from "express";
import { timingSafeEqual } from "crypto";
import AppLogger from "../../client/appLogger";

const HeaderName = "x-webhook-token";

function matches(supplied: string, expected: string): boolean {
    const suppliedBuffer = Buffer.from(supplied);
    const expectedBuffer = Buffer.from(expected);

    // timingSafeEqual throws on a length mismatch, which would leak the token length.
    if (suppliedBuffer.length !== expectedBuffer.length) return false;

    return timingSafeEqual(suppliedBuffer, expectedBuffer);
}

export default function RequireWebhookToken(req: Request, res: Response, next: NextFunction) {
    const expected = process.env.WEBHOOK_TOKEN;

    if (!expected) {
        AppLogger.LogError("Hooks/RequireWebhookToken", "WEBHOOK_TOKEN is not configured, refusing the request");

        res.sendStatus(503);
        return;
    }

    const supplied = req.header(HeaderName);

    if (!supplied || !matches(supplied, expected)) {
        AppLogger.LogWarn("Hooks/RequireWebhookToken", `Rejected an unauthorised request to ${req.path}`);

        res.sendStatus(401);
        return;
    }

    next();
}
