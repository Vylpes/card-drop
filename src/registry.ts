import { CoreClient } from "./client/client";
import { Environment } from "./constants/Environment";

// Global Command Imports
import About from "./commands/about";
import AllBalance from "./commands/allbalance";
import Balance from "./commands/balance";
import Daily from "./commands/daily";
import Drop from "./commands/drop";
import Gdrivesync from "./commands/gdrivesync";
import Give from "./commands/give";
import Inventory from "./commands/inventory";
import Resync from "./commands/resync";
import Sacrifice from "./commands/sacrifice";
import Series from "./commands/series";
import Stats from "./commands/stats";
import Trade from "./commands/trade";
import View from "./commands/view";

// Test Command Imports
import Dropnumber from "./commands/stage/dropnumber";
import Droprarity from "./commands/stage/droprarity";

// Button Event Imports
import Claim from "./buttonEvents/Claim";
import InventoryButtonEvent from "./buttonEvents/Inventory";
import Reroll from "./buttonEvents/Reroll";
import SacrificeButtonEvent from "./buttonEvents/Sacrifice";
import SeriesEvent from "./buttonEvents/Series";
import TradeButtonEvent from "./buttonEvents/Trade";

export default class Registry {
    public static RegisterCommands() {
        // Global Commands
        CoreClient.RegisterCommand("about", new About());
        CoreClient.RegisterCommand("allbalance", new AllBalance());
        CoreClient.RegisterCommand("balance", new Balance());
        CoreClient.RegisterCommand("daily", new Daily());
        CoreClient.RegisterCommand("drop", new Drop());
        CoreClient.RegisterCommand("gdrivesync", new Gdrivesync());
        CoreClient.RegisterCommand("give", new Give());
        CoreClient.RegisterCommand("inventory", new Inventory());
        CoreClient.RegisterCommand("resync", new Resync());
        CoreClient.RegisterCommand("sacrifice", new Sacrifice());
        CoreClient.RegisterCommand("series", new Series());
        CoreClient.RegisterCommand("stats", new Stats());
        CoreClient.RegisterCommand("trade", new Trade());
        CoreClient.RegisterCommand("view", new View());

        // Test Commands
        CoreClient.RegisterCommand("dropnumber", new Dropnumber(), Environment.Test);
        CoreClient.RegisterCommand("droprarity", new Droprarity(), Environment.Test);
    }

    public static RegisterButtonEvents() {
        CoreClient.RegisterButtonEvent("claim", new Claim());
        CoreClient.RegisterButtonEvent("inventory", new InventoryButtonEvent());
        CoreClient.RegisterButtonEvent("reroll", new Reroll());
        CoreClient.RegisterButtonEvent("sacrifice", new SacrificeButtonEvent());
        CoreClient.RegisterButtonEvent("series", new SeriesEvent());
        CoreClient.RegisterButtonEvent("trade", new TradeButtonEvent());
    }
}