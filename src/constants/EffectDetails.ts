class EffectDetail {
    public readonly id: string;
    public readonly friendlyName: string;
    public readonly duration: number;
    public readonly cost: number;

    constructor(id: string, friendlyName: string, duration: number, cost: number) {
        this.id = id;
        this.friendlyName = friendlyName;
        this.duration = duration;
        this.cost = cost;
    }
};

export const EffectDetails = new Map<string, EffectDetail>([
    [ "unclaimed", new EffectDetail("unclaimed", "Unclaimed Chance Up", 24 * 60 * 60 * 1000, 100) ],
]);
