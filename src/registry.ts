import { CoreClient } from "./client/client";

// Global Command Imports
import About from "./commands/about";
import Drop from "./commands/drop";

// Test Command Imports
import Dropnumber from "./commands/442730357897429002/dropnumber";

// Button Event Imports
import Claim from "./buttonEvents/Claim";
import Reroll from "./buttonEvents/Reroll";

export default class Registry {
    public static RegisterCommands() {
        // Global Commands
        CoreClient.RegisterCommand('about', new About());
        CoreClient.RegisterCommand('drop', new Drop());

        // Test Commands
        CoreClient.RegisterCommand('dropnumber', new Dropnumber(), "442730357897429002");
    }

    public static RegisterEvents() {

    }

    public static RegisterButtonEvents() {
        CoreClient.RegisterButtonEvent('claim', new Claim());
        CoreClient.RegisterButtonEvent('reroll', new Reroll());
    }
}