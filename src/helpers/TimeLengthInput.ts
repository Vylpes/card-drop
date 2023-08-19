import StringTools from "./StringTools";

export default class TimeLengthInput {
    public readonly value: string;

    constructor(input: string) {
        this.value = StringTools.ReplaceAll(input, ',', '');
    }

    public GetDays(): number {
        return this.GetValue('d');
    }

    public GetHours(): number {
        return this.GetValue('h');
    }

    public GetMinutes(): number {
        return this.GetValue('m');
    }

    public GetSeconds(): number {
        return this.GetValue('s');
    }

    public GetMilliseconds(): number {
        const days = this.GetDays();
        const hours = this.GetHours();
        const minutes = this.GetMinutes();
        const seconds = this.GetSeconds();

        let milliseconds = 0;

        milliseconds += seconds * 1000;
        milliseconds += minutes * 60 * 1000;
        milliseconds += hours * 60 * 60 * 1000;
        milliseconds += days * 24 * 60 * 60 * 1000;

        return milliseconds;
    }

    public GetDateFromNow(): Date {
        const now = Date.now();

        const dateFromNow = now
            + (1000 * this.GetSeconds())
            + (1000 * 60 * this.GetMinutes())
            + (1000 * 60 * 60 * this.GetHours())
            + (1000 * 60 * 60 * 24 * this.GetDays());

        return new Date(dateFromNow);
    }

    public GetLength(): string {
        const days = this.GetDays();
        const hours = this.GetHours();
        const minutes = this.GetMinutes();
        const seconds = this.GetSeconds();

        const value = [];

        if (days) {
            value.push(`${days} days`);
        }

        if (hours) {
            value.push(`${hours} hours`);
        }

        if (minutes) {
            value.push(`${minutes} minutes`);
        }

        if (seconds) {
            value.push(`${seconds} seconds`);
        }

        return value.join(", ");
    }

    public GetLengthShort(): string {
        const days = this.GetDays();
        const hours = this.GetHours();
        const minutes = this.GetMinutes();
        const seconds = this.GetSeconds();

        const value = [];

        if (days) {
            value.push(`${days}d`);
        }

        if (hours) {
            value.push(`${hours}h`);
        }

        if (minutes) {
            value.push(`${minutes}m`);
        }

        if (seconds) {
            value.push(`${seconds}s`);
        }

        return value.join(" ");
    }

    private GetValue(designation: string): number {
        const valueSplit = this.value.split(' ');

        const desString = valueSplit.find(x => x.charAt(x.length - 1) == designation);

        if (!desString) return 0;

        const desNumber = Number(desString.substring(0, desString.length - 1));

        if (!desNumber) return 0;

        return desNumber;
    }
}