import { Client } from "discord.js";
import * as dotenv from "dotenv";
import { EventType } from "../constants/EventType";
import ICommandItem from "../contracts/ICommandItem";
import IEventItem from "../contracts/IEventItem";
import { Command } from "../type/command";

import { Events } from "./events";
import { Util } from "./util";
import CardSetupFunction from "../Functions/CardSetupFunction";
import CardDataSource from "../database/dataSources/cardDataSource";
import CardDropHelper from "../helpers/CardDropHelper";
import IButtonEventItem from "../contracts/IButtonEventItem";
import { ButtonEvent } from "../type/buttonEvent";
import AppDataSource from "../database/dataSources/appDataSource";

export class CoreClient extends Client {
    private static _commandItems: ICommandItem[];
    private static _eventItems: IEventItem[];
    private static _buttonEvents: IButtonEventItem[];

    private _events: Events;
    private _util: Util;
    private _cardSetupFunc: CardSetupFunction;

    public static ClaimId: string;

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
        this._cardSetupFunc = new CardSetupFunction();
    }

    public async start() {
        if (!process.env.BOT_TOKEN) {
            console.error("BOT_TOKEN is not defined in .env");
            return;
        }

        await AppDataSource.initialize()
            .then(() => console.log("App Data Source Initialised"))
            .catch(err => console.error("Error initialising App Data Source", err));

        await CardDataSource.initialize()
            .then(() => console.log("Card Data Source Initialised"))
            .catch(err => console.error("Error initialising Card Data Source", err));

        super.on("interactionCreate", this._events.onInteractionCreate);
        super.on("ready", this._events.onReady);

        await this._cardSetupFunc.Execute();

        await super.login(process.env.BOT_TOKEN);

        this._util.loadEvents(this, CoreClient._eventItems);
        this._util.loadSlashCommands(this);
    }

    public static RegisterCommand(name: string, command: Command, serverId?: string) {
        const item: ICommandItem = {
            Name: name,
            Command: command,
            ServerId: serverId,
        };

        CoreClient._commandItems.push(item);
    }

    public static RegisterEvent(eventType: EventType, func: Function) {
        const item: IEventItem = {
            EventType: eventType,
            ExecutionFunction: func,
        };

        CoreClient._eventItems.push(item);
    }

    public static RegisterButtonEvent(buttonId: string, event: ButtonEvent) {
        const item: IButtonEventItem = {
            ButtonId: buttonId,
            Event: event,
        };

        CoreClient._buttonEvents.push(item);
    }
}
