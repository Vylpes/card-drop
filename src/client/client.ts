import { Client, DMChannel, Guild, GuildBan, GuildMember, Message, NonThreadGuildBasedChannel, PartialGuildMember, PartialMessage } from "discord.js";
import * as dotenv from "dotenv";
import ICommandItem from "../contracts/ICommandItem";
import EventExecutors from "../contracts/EventExecutors";
import { Command } from "../type/command";

import { Events } from "./events";
import { Util } from "./util";
import IButtonEventItem from "../contracts/ButtonEventItem";
import { ButtonEvent } from "../type/buttonEvent";
import AppDataSource from "../database/dataSources/appDataSource";
import { Environment } from "../constants/Environment";
import Webhooks from "../webhooks";
import CardMetadataFunction from "../Functions/CardMetadataFunction";
import { SeriesMetadata } from "../contracts/SeriesMetadata";
import AppLogger from "./appLogger";
import TimerHelper from "../helpers/TimerHelper";
import GiveCurrency from "../timers/GiveCurrency";
import PurgeClaims from "../timers/PurgeClaims";
import StringDropdownEventItem from "../contracts/StringDropdownEventItem";
import {StringDropdownEvent} from "../type/stringDropdownEvent";

export class CoreClient extends Client {
    private static _commandItems: ICommandItem[];
    private static _eventExecutors: EventExecutors;
    private static _buttonEvents: IButtonEventItem[];
    private static _stringDropdowns: StringDropdownEventItem[];

    private _events: Events;
    private _util: Util;
    private _webhooks: Webhooks;
    private _timerHelper: TimerHelper;

    public static ClaimId: string;
    public static Environment: Environment;
    public static AllowDrops: boolean;
    public static Cards: SeriesMetadata[];

    public static get commandItems(): ICommandItem[] {
        return this._commandItems;
    }

    public static get eventExecutors(): EventExecutors {
        return this._eventExecutors;
    }

    public static get buttonEvents(): IButtonEventItem[] {
        return this._buttonEvents;
    }

    public static get stringDropdowns(): StringDropdownEventItem[] {
        return this._stringDropdowns;
    }

    constructor(intents: number[]) {
        super({ intents: intents });
        dotenv.config();

        CoreClient.Environment = Number(process.env.BOT_ENV);

        const loglevel = process.env.BOT_LOGLEVEL ?? "info";

        AppLogger.InitialiseLogger(loglevel, CoreClient.Environment == Environment.Local);

        AppLogger.LogInfo("Client", "Initialising Client");

        CoreClient._commandItems = [];
        CoreClient._buttonEvents = [];
        CoreClient._stringDropdowns = [];

        this._events = new Events();
        this._util = new Util();
        this._webhooks = new Webhooks();
        this._timerHelper = new TimerHelper();

        AppLogger.LogInfo("Client", `Environment: ${CoreClient.Environment}`);

        CoreClient.AllowDrops = true;
    }

    public async start() {
        if (!process.env.BOT_TOKEN) {
            AppLogger.LogError("Client", "BOT_TOKEN is not defined in .env");
            return;
        }

        await AppDataSource.initialize()
            .then(() => {
                AppLogger.LogInfo("Client", "App Data Source Initialised");

                this._timerHelper.AddTimer("*/20 * * * *", "Europe/London", GiveCurrency, false);
                this._timerHelper.AddTimer("0 0 * * *", "Europe/London", PurgeClaims, false);

                this._timerHelper.StartAllTimers();
            })
            .catch(err => {
                AppLogger.LogError("Client", "App Data Source Initialisation Failed");
                AppLogger.LogError("Client", err);
                throw err;
            });

        super.on("interactionCreate", this._events.onInteractionCreate);
        super.on("ready", this._events.onReady);

        await CardMetadataFunction.Execute(true);

        this._util.loadEvents(this, CoreClient._eventExecutors);
        this._util.loadSlashCommands(this);

        this._webhooks.start();

        await super.login(process.env.BOT_TOKEN);
    }

    public static RegisterCommand(name: string, command: Command, environment: Environment = Environment.All, serverId?: string) {
        const item: ICommandItem = {
            Name: name,
            Environment: environment,
            Command: command,
            ServerId: serverId,
        };

        if ((environment & CoreClient.Environment) == CoreClient.Environment) {
            CoreClient._commandItems.push(item);

            AppLogger.LogVerbose("Client", `Registered Command: ${name}`);
        }
    }

    public static RegisterChannelCreateEvent(fn: (channel: NonThreadGuildBasedChannel) => void) {
        if (this._eventExecutors) {
            this._eventExecutors.ChannelCreate.push(fn);
        } else {
            this._eventExecutors = {
                ChannelCreate: [ fn ],
                ChannelDelete: [],
                ChannelUpdate: [],
                GuildBanAdd: [],
                GuildBanRemove: [],
                GuildCreate: [],
                GuildMemberAdd: [],
                GuildMemberRemove: [],
                GuildMemebrUpdate: [],
                MessageCreate: [],
                MessageDelete: [],
                MessageUpdate: [],
            };
        }

        AppLogger.LogVerbose("Client", "Registered Channel Create Event");
    }

    public static RegisterChannelDeleteEvent(fn: (channel: DMChannel | NonThreadGuildBasedChannel) => void) {
        if (this._eventExecutors) {
            this._eventExecutors.ChannelDelete.push(fn);
        } else {
            this._eventExecutors = {
                ChannelCreate: [],
                ChannelDelete: [ fn ],
                ChannelUpdate: [],
                GuildBanAdd: [],
                GuildBanRemove: [],
                GuildCreate: [],
                GuildMemberAdd: [],
                GuildMemberRemove: [],
                GuildMemebrUpdate: [],
                MessageCreate: [],
                MessageDelete: [],
                MessageUpdate: [],
            };
        }

        AppLogger.LogVerbose("Client", "Registered Channel Delete Event");
    }

    public static RegisterChannelUpdateEvent(fn: (channel: DMChannel | NonThreadGuildBasedChannel) => void) {
        if (this._eventExecutors) {
            this._eventExecutors.ChannelCreate.push(fn);
        } else {
            this._eventExecutors = {
                ChannelCreate: [],
                ChannelDelete: [],
                ChannelUpdate: [ fn ],
                GuildBanAdd: [],
                GuildBanRemove: [],
                GuildCreate: [],
                GuildMemberAdd: [],
                GuildMemberRemove: [],
                GuildMemebrUpdate: [],
                MessageCreate: [],
                MessageDelete: [],
                MessageUpdate: [],
            };
        }

        AppLogger.LogVerbose("Client", "Registered Channel Update Event");
    }

    public static RegisterGuildBanAddEvent(fn: (ban: GuildBan) => void) {
        if (this._eventExecutors) {
            this._eventExecutors.GuildBanAdd.push(fn);
        } else {
            this._eventExecutors = {
                ChannelCreate: [],
                ChannelDelete: [],
                ChannelUpdate: [],
                GuildBanAdd: [ fn ],
                GuildBanRemove: [],
                GuildCreate: [],
                GuildMemberAdd: [],
                GuildMemberRemove: [],
                GuildMemebrUpdate: [],
                MessageCreate: [],
                MessageDelete: [],
                MessageUpdate: [],
            };
        }

        AppLogger.LogVerbose("Client", "Registered Guild Ban Add Event");
    }

    public static RegisterGuildBanRemoveEvent(fn: (channel: GuildBan) => void) {
        if (this._eventExecutors) {
            this._eventExecutors.GuildBanRemove.push(fn);
        } else {
            this._eventExecutors = {
                ChannelCreate: [],
                ChannelDelete: [],
                ChannelUpdate: [],
                GuildBanAdd: [],
                GuildBanRemove: [ fn ],
                GuildCreate: [],
                GuildMemberAdd: [],
                GuildMemberRemove: [],
                GuildMemebrUpdate: [],
                MessageCreate: [],
                MessageDelete: [],
                MessageUpdate: [],
            };
        }

        AppLogger.LogVerbose("Client", "Registered Guild Ban Remove Event");
    }

    public static RegisterGuildCreateEvent(fn: (guild: Guild) => void) {
        if (this._eventExecutors) {
            this._eventExecutors.GuildCreate.push(fn);
        } else {
            this._eventExecutors = {
                ChannelCreate: [],
                ChannelDelete: [],
                ChannelUpdate: [],
                GuildBanAdd: [],
                GuildBanRemove: [],
                GuildCreate: [ fn ],
                GuildMemberAdd: [],
                GuildMemberRemove: [],
                GuildMemebrUpdate: [],
                MessageCreate: [],
                MessageDelete: [],
                MessageUpdate: [],
            };
        }

        AppLogger.LogVerbose("Client", "Registered Guild Create Event");
    }

    public static RegisterGuildMemberAddEvent(fn: (member: GuildMember) => void) {
        if (this._eventExecutors) {
            this._eventExecutors.GuildMemberAdd.push(fn);
        } else {
            this._eventExecutors = {
                ChannelCreate: [],
                ChannelDelete: [],
                ChannelUpdate: [],
                GuildBanAdd: [],
                GuildBanRemove: [],
                GuildCreate: [],
                GuildMemberAdd: [ fn ],
                GuildMemberRemove: [],
                GuildMemebrUpdate: [],
                MessageCreate: [],
                MessageDelete: [],
                MessageUpdate: [],
            };
        }

        AppLogger.LogVerbose("Client", "Registered Guild Member Add Event");
    }

    public static RegisterGuildMemberRemoveEvent(fn: (member: GuildMember | PartialGuildMember) => void) {
        if (this._eventExecutors) {
            this._eventExecutors.GuildMemberRemove.push(fn);
        } else {
            this._eventExecutors = {
                ChannelCreate: [],
                ChannelDelete: [],
                ChannelUpdate: [],
                GuildBanAdd: [],
                GuildBanRemove: [],
                GuildCreate: [],
                GuildMemberAdd: [],
                GuildMemberRemove: [ fn ],
                GuildMemebrUpdate: [],
                MessageCreate: [],
                MessageDelete: [],
                MessageUpdate: [],
            };
        }

        AppLogger.LogVerbose("Client", "Registered Guild Member Remove Event");
    }

    public static GuildMemebrUpdate(fn: (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) => void) {
        if (this._eventExecutors) {
            this._eventExecutors.GuildMemebrUpdate.push(fn);
        } else {
            this._eventExecutors = {
                ChannelCreate: [],
                ChannelDelete: [],
                ChannelUpdate: [],
                GuildBanAdd: [],
                GuildBanRemove: [],
                GuildCreate: [],
                GuildMemberAdd: [],
                GuildMemberRemove: [],
                GuildMemebrUpdate: [ fn ],
                MessageCreate: [],
                MessageDelete: [],
                MessageUpdate: [],
            };
        }

        AppLogger.LogVerbose("Client", "Registered Guild Member Update Event");
    }

    public static RegisterMessageCreateEvent(fn: (message: Message<boolean>) => void) {
        if (this._eventExecutors) {
            this._eventExecutors.MessageCreate.push(fn);
        } else {
            this._eventExecutors = {
                ChannelCreate: [],
                ChannelDelete: [],
                ChannelUpdate: [],
                GuildBanAdd: [],
                GuildBanRemove: [],
                GuildCreate: [],
                GuildMemberAdd: [],
                GuildMemberRemove: [],
                GuildMemebrUpdate: [],
                MessageCreate: [ fn ],
                MessageDelete: [],
                MessageUpdate: [],
            };
        }

        AppLogger.LogVerbose("Client", "Registered Message Create Event");
    }

    public static RegisterMessageDeleteEvent(fn: (message: Message<boolean> | PartialMessage) => void) {
        if (this._eventExecutors) {
            this._eventExecutors.MessageDelete.push(fn);
        } else {
            this._eventExecutors = {
                ChannelCreate: [],
                ChannelDelete: [],
                ChannelUpdate: [],
                GuildBanAdd: [],
                GuildBanRemove: [],
                GuildCreate: [],
                GuildMemberAdd: [],
                GuildMemberRemove: [],
                GuildMemebrUpdate: [],
                MessageCreate: [],
                MessageDelete: [ fn ],
                MessageUpdate: [],
            };
        }

        AppLogger.LogVerbose("Client", "Registered Message Delete Event");
    }

    public static RegisterMessageUpdateEvent(fn: (oldMessage: Message<boolean> | PartialMessage, newMessage: Message<boolean> | PartialMessage) => void) {
        if (this._eventExecutors) {
            this._eventExecutors.MessageUpdate.push(fn);
        } else {
            this._eventExecutors = {
                ChannelCreate: [],
                ChannelDelete: [],
                ChannelUpdate: [],
                GuildBanAdd: [],
                GuildBanRemove: [],
                GuildCreate: [],
                GuildMemberAdd: [],
                GuildMemberRemove: [],
                GuildMemebrUpdate: [],
                MessageCreate: [],
                MessageDelete: [],
                MessageUpdate: [ fn ],
            };
        }

        AppLogger.LogVerbose("Client", "Registered Message Update Event");
    }

    public static RegisterButtonEvent(buttonId: string, event: ButtonEvent, environment: Environment = Environment.All) {
        const item: IButtonEventItem = {
            ButtonId: buttonId,
            Event: event,
            Environment: environment,
        };

        if ((environment & CoreClient.Environment) == CoreClient.Environment) {
            CoreClient._buttonEvents.push(item);

            AppLogger.LogVerbose("Client", `Registered Button Event: ${buttonId}`);
        }
    }

    public static RegisterStringDropdownEvent(dropdownId: string, event: StringDropdownEvent, environment: Environment = Environment.All) {
        const item: StringDropdownEventItem = {
            DropdownId: dropdownId,
            Event: event,
            Environment: environment,
        };

        if ((environment & CoreClient.Environment) == CoreClient.Environment) {
            CoreClient._stringDropdowns.push(item);

            AppLogger.LogVerbose("Client", `Registered String Dropdown Event: ${dropdownId}`);
        }
    }
}

