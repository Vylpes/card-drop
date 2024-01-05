import { Environment } from "../constants/Environment";
import { ButtonEvent } from "../type/buttonEvent";

interface ButtonEventItem {
    ButtonId: string,
    Event: ButtonEvent,
    Environment: Environment,
}

export default ButtonEventItem;