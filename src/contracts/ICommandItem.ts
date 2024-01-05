import { Environment } from "../constants/Environment";
import { Command } from "../type/command";

interface ICommandItem {
    Name: string,
    Command: Command,
    Environment: Environment,
    ServerId?: string,
}

export default ICommandItem;