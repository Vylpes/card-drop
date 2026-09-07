import { NextFunction, Request, Response } from "express";
import RequireWebhookToken from "../../../src/hooks/middleware/RequireWebhookToken";
import AppLogger from "../../../src/client/appLogger";

jest.mock("../../../src/client/appLogger");

function generateRequest(token?: string) {
    return {
        path: "/api/reload-db",
        header: jest.fn().mockReturnValue(token),
    } as unknown as Request;
}

function generateResponse() {
    return {
        sendStatus: jest.fn(),
    } as unknown as Response;
}

describe("RequireWebhookToken", () => {
    let res: Response;
    let next: NextFunction;

    beforeEach(() => {
        jest.resetAllMocks();

        res = generateResponse();
        next = jest.fn();
    });

    afterEach(() => {
        delete process.env.WEBHOOK_TOKEN;
    });

    describe("GIVEN WEBHOOK_TOKEN is not configured", () => {
        beforeEach(() => {
            RequireWebhookToken(generateRequest("anything"), res, next);
        });

        test("EXPECT the request to be refused with a 503", () => {
            expect(res.sendStatus).toHaveBeenCalledWith(503);
            expect(next).not.toHaveBeenCalled();
        });

        test("EXPECT the misconfiguration to be logged", () => {
            expect(AppLogger.LogError).toHaveBeenCalledTimes(1);
        });
    });

    describe("GIVEN the token header is missing", () => {
        beforeEach(() => {
            process.env.WEBHOOK_TOKEN = "expected-token";

            RequireWebhookToken(generateRequest(undefined), res, next);
        });

        test("EXPECT the request to be rejected with a 401", () => {
            expect(res.sendStatus).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("GIVEN the token is incorrect", () => {
        beforeEach(() => {
            process.env.WEBHOOK_TOKEN = "expected-token";

            RequireWebhookToken(generateRequest("wrong-token!"), res, next);
        });

        test("EXPECT the request to be rejected with a 401", () => {
            expect(res.sendStatus).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });

        test("EXPECT the rejection to be logged", () => {
            expect(AppLogger.LogWarn).toHaveBeenCalledTimes(1);
        });
    });

    describe("GIVEN the token is a prefix of the expected token", () => {
        beforeEach(() => {
            process.env.WEBHOOK_TOKEN = "expected-token";

            RequireWebhookToken(generateRequest("expected"), res, next);
        });

        test("EXPECT the request to be rejected with a 401", () => {
            expect(res.sendStatus).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("GIVEN the token is correct", () => {
        let req: Request;

        beforeEach(() => {
            process.env.WEBHOOK_TOKEN = "expected-token";

            req = generateRequest("expected-token");

            RequireWebhookToken(req, res, next);
        });

        test("EXPECT the request to be passed on to the handler", () => {
            expect(next).toHaveBeenCalledTimes(1);
            expect(res.sendStatus).not.toHaveBeenCalled();
        });

        test("EXPECT the token to be read from the x-webhook-token header", () => {
            expect(req.header).toHaveBeenCalledWith("x-webhook-token");
        });
    });
});
