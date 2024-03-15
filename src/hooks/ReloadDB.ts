import { Request, Response } from "express";
import CardMetadataFunction from "../Functions/CardMetadataFunction";
import AppLogger from "../client/appLogger";

export default async function ReloadDB(req: Request, res: Response) {
    AppLogger.LogInfo("Hooks/ReloadDB", "Reloading Card DB...");

    await CardMetadataFunction.Execute();

    res.sendStatus(200);
}