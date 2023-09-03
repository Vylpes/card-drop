import { CoreClient } from "./client/client";

import About from "./commands/about";
import Drop from "./commands/drop";

import Claim from "./buttonEvents/Claim";
import Reroll from "./buttonEvents/Reroll";

export default class Registry {
    public static RegisterCommands() {
        CoreClient.RegisterCommand('about', new About());
        CoreClient.RegisterCommand('drop', new Drop());
    }

    public static RegisterEvents() {

    }

    public static RegisterButtonEvents() {
        CoreClient.RegisterButtonEvent('claim', new Claim());
        CoreClient.RegisterButtonEvent('reroll', new Reroll());
    }
}