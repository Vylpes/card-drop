import {Environment} from "../constants/Environment";
import {StringDropdownEvent} from "../type/stringDropdownEvent";

interface StringDropdownEventItem {
    DropdownId: string,
    Event: StringDropdownEvent,
    Environment: Environment,
}

export default StringDropdownEventItem;
