export enum Environment {
    None = 0,
    Production = 1 << 0,
    Stage = 1 << 1,
    Local = 1 << 2,

    All = Production | Stage | Local,
}