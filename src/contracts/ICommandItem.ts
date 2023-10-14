import { Environment } from "../constants/Environment";
import { Command } from "../type/command";

export default interface ICommandItem {
    Name: string,
    Command: Command,
    Environment: Environment,
    ServerId?: string,
}