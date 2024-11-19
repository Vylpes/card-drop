import UserEffect from "../../src/database/entities/app/UserEffect";
import EffectHelper from "../../src/helpers/EffectHelper";

describe("AddEffectToUserInventory", () => {
    describe("GIVEN effect is in database", () => {
        const effectMock = {
            AddUnused: jest.fn(),
            Save: jest.fn(),
        };

        beforeAll(async () => {
            UserEffect.FetchOneByUserIdAndName = jest.fn().mockResolvedValue(effectMock);

            await EffectHelper.AddEffectToUserInventory("userId", "name", 1);
        });

        test("EXPECT database to be fetched", () => {
            expect(UserEffect.FetchOneByUserIdAndName).toHaveBeenCalledTimes(1);
            expect(UserEffect.FetchOneByUserIdAndName).toHaveBeenCalledWith("userId", "name");
        });

        test("EXPECT effect to be updated", () => {
            expect(effectMock.AddUnused).toHaveBeenCalledTimes(1);
            expect(effectMock.AddUnused).toHaveBeenCalledWith(1);
        });

        test("EXPECT effect to be saved", () => {
            expect(effectMock.Save).toHaveBeenCalledTimes(1);
            expect(effectMock.Save).toHaveBeenCalledWith(UserEffect, effectMock);
        });
    });

    describe("GIVEN effect is not in database", () => {
        beforeAll(async () => {
            UserEffect.FetchOneByUserIdAndName = jest.fn().mockResolvedValue(null);
            UserEffect.prototype.Save = jest.fn();

            await EffectHelper.AddEffectToUserInventory("userId", "name", 1);
        });

        test("EXPECT effect to be saved", () => {
            expect(UserEffect.prototype.Save).toHaveBeenCalledTimes(1);
            expect(UserEffect.prototype.Save).toHaveBeenCalledWith(UserEffect, expect.any(UserEffect));
        });
    });
});

describe("UseEffect", () => {
    describe("GIVEN effect is in database", () => {
        describe("GIVEN now is before effect.WhenExpires", () => {
            let result: boolean | undefined;

            // nowMock < whenExpires
            const nowMock = new Date(2024, 11, 3, 13, 30);
            const whenExpires = new Date(2024, 11, 3, 14, 0);

            const userEffect = {
                Unused: 1,
                WhenExpires: whenExpires,
            };

            beforeAll(async () => {
                jest.setSystemTime(nowMock);

                UserEffect.FetchOneByUserIdAndName = jest.fn().mockResolvedValue(userEffect);

                result = await EffectHelper.UseEffect("userId", "name", new Date());
            });

            test("EXPECT false returned", () => {
                expect(result).toBe(false);
            });
        });

        describe("GIVEN currently used effect is inactive", () => {
            let result: boolean | undefined;

            // nowMock > whenExpires
            const nowMock = new Date(2024, 11, 3, 13, 30);
            const whenExpires = new Date(2024, 11, 3, 13, 0);
            const whenExpiresNew = new Date(2024, 11, 3, 15, 0);

            const userEffect = {
                Unused: 1,
                WhenExpires: whenExpires,
                UseEffect: jest.fn(),
                Save: jest.fn(),
            };

            beforeAll(async () => {
                jest.setSystemTime(nowMock);

                UserEffect.FetchOneByUserIdAndName = jest.fn().mockResolvedValue(userEffect);

                result = await EffectHelper.UseEffect("userId", "name", whenExpiresNew);
            });

            test("EXPECT UseEffect to be called", () => {
                expect(userEffect.UseEffect).toHaveReturnedTimes(1);
                expect(userEffect.UseEffect).toHaveBeenCalledWith(whenExpiresNew);
            });

            test("EXPECT effect to be saved", () => {
                expect(userEffect.Save).toHaveBeenCalledTimes(1);
                expect(userEffect.Save).toHaveBeenCalledWith(UserEffect, userEffect);
            });

            test("EXPECT true returned", () => {
                expect(result).toBe(true);
            });
        });

        describe("GIVEN effect.WhenExpires is null", () => {
            let result: boolean | undefined;

            // nowMock > whenExpires
            const nowMock = new Date(2024, 11, 3, 13, 30);
            const whenExpiresNew = new Date(2024, 11, 3, 15, 0);

            const userEffect = {
                Unused: 1,
                WhenExpires: null,
                UseEffect: jest.fn(),
                Save: jest.fn(),
            };

            beforeAll(async () => {
                jest.setSystemTime(nowMock);

                UserEffect.FetchOneByUserIdAndName = jest.fn().mockResolvedValue(userEffect);

                result = await EffectHelper.UseEffect("userId", "name", whenExpiresNew);
            });

            test("EXPECT UseEffect to be called", () => {
                expect(userEffect.UseEffect).toHaveBeenCalledTimes(1);
                expect(userEffect.UseEffect).toHaveBeenCalledWith(whenExpiresNew);
            });

            test("EXPECT effect to be saved", () => {
                expect(userEffect.Save).toHaveBeenCalledTimes(1);
                expect(userEffect.Save).toHaveBeenCalledWith(UserEffect, userEffect);
            });

            test("EXPECT true returned", () => {
                expect(result).toBe(true);
            });
        });
    });

    describe("GIVEN effect is not in database", () => {
        let result: boolean | undefined;

        // nowMock > whenExpires
        const nowMock = new Date(2024, 11, 3, 13, 30);
        const whenExpiresNew = new Date(2024, 11, 3, 15, 0);

        beforeAll(async () => {
            jest.setSystemTime(nowMock);

            UserEffect.FetchOneByUserIdAndName = jest.fn().mockResolvedValue(null);

            result = await EffectHelper.UseEffect("userId", "name", whenExpiresNew);
        });

        test("EXPECT false returned", () => {
            expect(result).toBe(false);
        });
    });

    describe("GIVEN effect.Unused is 0", () => {
        let result: boolean | undefined;

        // nowMock > whenExpires
        const nowMock = new Date(2024, 11, 3, 13, 30);
        const whenExpiresNew = new Date(2024, 11, 3, 15, 0);

        const userEffect = {
            Unused: 0,
            WhenExpires: null,
            UseEffect: jest.fn(),
            Save: jest.fn(),
        };

        beforeAll(async () => {
            jest.setSystemTime(nowMock);

            UserEffect.FetchOneByUserIdAndName = jest.fn().mockResolvedValue(userEffect);

            result = await EffectHelper.UseEffect("userId", "name", whenExpiresNew);
        });

        test("EXPECT false returned", () => {
            expect(result).toBe(false);
        });
    });
});

describe("HasEffect", () => {
    describe("GIVEN effect is in database", () => {
        describe("GIVEN effect.WhenExpires is defined", () => {
            describe("GIVEN now is before effect.WhenExpires", () => {
                let result: boolean | undefined;

                const nowMock = new Date(2024, 11, 3, 13, 30);
                const whenExpires = new Date(2024, 11, 3, 15, 0);

                const userEffect = {
                    WhenExpires: whenExpires,
                };

                beforeAll(async () => {
                    jest.setSystemTime(nowMock);

                    UserEffect.FetchOneByUserIdAndName = jest.fn().mockResolvedValue(userEffect);

                    result = await EffectHelper.HasEffect("userId", "name");
                });

                test("EXPECT true returned", () => {
                    expect(result).toBe(true);
                });
            });

            describe("GIVEN now is after effect.WhenExpires", () => {
                let result: boolean | undefined;

                const nowMock = new Date(2024, 11, 3, 16, 30);
                const whenExpires = new Date(2024, 11, 3, 15, 0);

                const userEffect = {
                    WhenExpires: whenExpires,
                };

                beforeAll(async () => {
                    jest.setSystemTime(nowMock);

                    UserEffect.FetchOneByUserIdAndName = jest.fn().mockResolvedValue(userEffect);

                    result = await EffectHelper.HasEffect("userId", "name");
                });

                test("EXPECT false returned", () => {
                    expect(result).toBe(false);
                });
            });
        });

        describe("GIVEN effect.WhenExpires is undefined", () => {
            let result: boolean | undefined;

            const userEffect = {
                WhenExpires: undefined,
            };

            beforeAll(async () => {
                UserEffect.FetchOneByUserIdAndName = jest.fn().mockResolvedValue(userEffect);

                result = await EffectHelper.HasEffect("userId", "name");
            });

            test("EXPECT false returned", () => {
                expect(result).toBe(false);
            });
        });
    });

    describe("GIVEN effect is not in database", () => {
        let result: boolean | undefined;

        beforeAll(async () => {
            UserEffect.FetchOneByUserIdAndName = jest.fn().mockResolvedValue(null);

            result = await EffectHelper.HasEffect("userId", "name");
        });

        test("EXPECT false returned", () => {
            expect(result).toBe(false);
        });
    });
});
