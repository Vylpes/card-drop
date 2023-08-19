
import { EventType } from "../constants/EventType";

export default interface IEventItem {
    EventType: EventType,
    ExecutionFunction: Function,
}