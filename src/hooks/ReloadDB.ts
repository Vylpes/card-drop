import { Request, Response } from "express";
import CardMetadataFunction from "../Functions/CardMetadataFunction";

export default async function ReloadDB(req: Request, res: Response) {
    console.log('Reloading Card DB...');

    await CardMetadataFunction.Execute();

    res.sendStatus(200);
}