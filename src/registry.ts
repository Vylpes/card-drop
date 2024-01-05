import { CoreClient } from "./client/client";
import { Environment } from "./constants/Environment";

// Global Command Imports
import About from "./commands/about";
import Drop from "./commands/drop";
import Gdrivesync from "./commands/gdrivesync";
import Inventory from "./commands/inventory";
import Resync from "./commands/resync";

// Test Command Imports
import Dropnumber from "./commands/stage/dropnumber";
import Droprarity from "./commands/stage/droprarity";

// Button Event Imports
import Claim from "./buttonEvents/Claim";
import InventoryButtonEvent from "./buttonEvents/Inventory";
import Reroll from "./buttonEvents/Reroll";

export default class Registry {
    public static RegisterCommands() {
        // Global Commands
        CoreClient.RegisterCommand("about", new About());
        CoreClient.RegisterCommand("drop", new Drop());
        CoreClient.RegisterCommand("gdrivesync", new Gdrivesync());
        CoreClient.RegisterCommand("inventory", new Inventory());
        CoreClient.RegisterCommand("resync", new Resync());

        // Test Commands
        CoreClient.RegisterCommand("dropnumber", new Dropnumber(), Environment.Test);
        CoreClient.RegisterCommand("droprarity", new Droprarity(), Environment.Test);
    }

    public static RegisterEvents() {

    }

    public static RegisterButtonEvents() {
        CoreClient.RegisterButtonEvent("claim", new Claim());
        CoreClient.RegisterButtonEvent("inventory", new InventoryButtonEvent);
        CoreClient.RegisterButtonEvent("reroll", new Reroll());
    }
}