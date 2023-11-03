import { Request, Response } from "express";
import CardSetupFunction from "../Functions/CardSetupFunction";

export default async function ReloadDB(req: Request, res: Response) {
    console.log('Reloading Card DB...');

    await CardSetupFunction.Execute();

    res.sendStatus(200);
}