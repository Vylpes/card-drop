
import { Environment } from "../constants/Environment";
import { EventType } from "../constants/EventType";

export default interface IEventItem {
    EventType: EventType,
    ExecutionFunction: Function,
    Environment: Environment,
}