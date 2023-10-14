import { Environment } from "../constants/Environment";
import { ButtonEvent } from "../type/buttonEvent";

export default interface IButtonEventItem {
    ButtonId: string,
    Event: ButtonEvent,
    Environment: Environment,
}