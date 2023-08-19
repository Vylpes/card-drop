import { Command } from "../type/command";

export default interface ICommandItem {
    Name: string,
    Command: Command,
    ServerId?: string,
}