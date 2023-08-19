import { CoreClient } from "./client/client";

import About from "./commands/about";

export default class Registry {
    public static RegisterCommands() {
        CoreClient.RegisterCommand('about', new About());
    }

    public static RegisterEvents() {

    }
}