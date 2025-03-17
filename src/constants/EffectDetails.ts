class EffectDetail {
    public readonly id: string;
    public readonly friendlyName: string;
    public readonly duration: number;
    public readonly cost: number;
    public readonly cooldown: number;

    constructor(id: string, friendlyName: string, duration: number, cost: number, cooldown: number) {
        this.id = id;
        this.friendlyName = friendlyName;
        this.duration = duration;
        this.cost = cost;
        this.cooldown = cooldown;
    }
};

export const EffectDetails = new Map<string, EffectDetail>([
    [ "unclaimed", new EffectDetail("unclaimed", "Unclaimed Chance Up", 10 * 60 * 1000, 100, 3 * 60 * 60 * 1000) ],
]);

export const EffectChoices = [
    { name: "Unclaimed Chance Up", value: "unclaimed" },
];
