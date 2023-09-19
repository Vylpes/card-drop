export enum Environment {
    None = 0,
    Production = 1 << 1,
    Stage = 1 << 2,
    Local = 1 << 3,
}