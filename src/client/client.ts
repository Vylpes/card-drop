import { Client } from "discord.js";
import * as dotenv from "dotenv";
import { EventType } from "../constants/EventType";
import ICommandItem from "../contracts/ICommandItem";
import IEventItem from "../contracts/IEventItem";
import { Command } from "../type/command";

import { Events } from "./events";
import { Util } from "./util";
import IButtonEventItem from "../contracts/IButtonEventItem";
import { ButtonEvent } from "../type/buttonEvent";
import AppDataSource from "../database/dataSources/appDataSource";
import { Environment } from "../constants/Environment";
import Webhooks from "../webhooks";
import CardMetadataFunction from "../Functions/CardMetadataFunction";
import SeriesMetadata from "../contracts/SeriesMetadata";

export class CoreClient extends Client {
    private static _commandItems: ICommandItem[];
    private static _eventItems: IEventItem[];
    private static _buttonEvents: IButtonEventItem[];

    private _events: Events;
    private _util: Util;
    private _webhooks: Webhooks;

    public static ClaimId: string;
    public static Environment: Environment;
    public static AllowDrops: boolean;
    public static Cards: SeriesMetadata[];

    public static get commandItems(): ICommandItem[] {
        return this._commandItems;
    }

    public static get eventItems(): IEventItem[] {
        return this._eventItems;
    }

    public static get buttonEvents(): IButtonEventItem[] {
        return this._buttonEvents;
    }

    constructor(intents: number[]) {
        super({ intents: intents });
        dotenv.config();

        CoreClient._commandItems = [];
        CoreClient._eventItems = [];
        CoreClient._buttonEvents = [];

        this._events = new Events();
        this._util = new Util();
        this._webhooks = new Webhooks();

        CoreClient.Environment = Number(process.env.BOT_ENV);
        console.log(`Bot Environment: ${CoreClient.Environment}`);

        CoreClient.AllowDrops = true;
    }

    public async start() {
        if (!process.env.BOT_TOKEN) {
            console.error("BOT_TOKEN is not defined in .env");
            return;
        }

        await AppDataSource.initialize()
            .then(() => console.log("App Data Source Initialised"))
            .catch(err => console.error("Error initialising App Data Source", err));

        super.on("interactionCreate", this._events.onInteractionCreate);
        super.on("ready", this._events.onReady);

        await CardMetadataFunction.Execute(true);

        this._util.loadEvents(this, CoreClient._eventItems);
        this._util.loadSlashCommands(this);

        this._webhooks.start();

        console.log(`Registered Commands: ${CoreClient._commandItems.flatMap(x => x.Name).join(", ")}`);
        console.log(`Registered Events: ${CoreClient._eventItems.flatMap(x => x.EventType).join(", ")}`);
        console.log(`Registered Buttons: ${CoreClient._buttonEvents.flatMap(x => x.ButtonId).join(", ")}`);

        await super.login(process.env.BOT_TOKEN);
    }

    public static RegisterCommand(name: string, command: Command, environment: Environment = Environment.All, serverId?: string) {
        const item: ICommandItem = {
            Name: name,
            Environment: environment,
            Command: command,
            ServerId: serverId,
        };

        if (environment &= CoreClient.Environment) {
            CoreClient._commandItems.push(item);
        }
    }

    public static RegisterEvent(eventType: EventType, func: Function, environment: Environment = Environment.All) {
        const item: IEventItem = {
            EventType: eventType,
            ExecutionFunction: func,
            Environment: environment,
        };

        if (environment &= CoreClient.Environment) {
            CoreClient._eventItems.push(item);
        }
    }

    public static RegisterButtonEvent(buttonId: string, event: ButtonEvent, environment: Environment = Environment.All) {
        const item: IButtonEventItem = {
            ButtonId: buttonId,
            Event: event,
            Environment: environment,
        };

        if (environment &= CoreClient.Environment) {
            CoreClient._buttonEvents.push(item);
        }
    }
}
