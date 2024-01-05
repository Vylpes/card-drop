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

export class CoreClient extends Client {
    private static _commandItems: ICommandItem[];
    private static _eventExecutors: EventExecutors;
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

    public static get eventExecutors(): EventExecutors {
        return this._eventExecutors;
    }

    public static get buttonEvents(): IButtonEventItem[] {
        return this._buttonEvents;
    }

    constructor(intents: number[]) {
        super({ intents: intents });
        dotenv.config();

        CoreClient._commandItems = [];
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
    }

    public static RegisterButtonEvent(buttonId: string, event: ButtonEvent, environment: Environment = Environment.All) {
        const item: IButtonEventItem = {
            ButtonId: buttonId,
            Event: event,
            Environment: environment,
        };

        if ((environment & CoreClient.Environment) == CoreClient.Environment) {
            CoreClient._buttonEvents.push(item);
        }
    }
}
