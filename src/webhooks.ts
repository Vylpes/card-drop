import bodyParser from "body-parser";
import express, { Application } from "express";
import ReloadDB from "./hooks/ReloadDB";
import AppLogger from "./client/appLogger";

export default class Webhooks {
    private app: Application;

    private port = process.env.EXPRESS_PORT!;

    public start() {
        this.setupApp();
        this.setupRoutes();
        this.setupListen();
    }

    private setupApp() {
        this.app = express();
        this.app.use(bodyParser.json());
    }

    private setupRoutes() {
        this.app.post("/api/reload-db", ReloadDB);
    }

    private setupListen() {
        this.app.listen(this.port, () => {
            AppLogger.LogInfo("Webhooks", `API listening on port ${this.port}`);
        });
    }
}