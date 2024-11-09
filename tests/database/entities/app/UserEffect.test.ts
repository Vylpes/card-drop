import UserEffect from "../../../../src/database/entities/app/UserEffect";

let userEffect: UserEffect;
const now = new Date();

beforeEach(() => {
    userEffect = new UserEffect("name", "userId", 1);
});

describe("AddUnused", () => {
    beforeEach(() => {
        userEffect.AddUnused(1);
    });

    test("EXPECT unused to be the amount more", () => {
        expect(userEffect.Unused).toBe(2);
    });
});

describe("UseEffect", () => {
    describe("GIVEN Unused is 0", () => {
        let result: boolean;

        beforeEach(() => {
            userEffect.Unused = 0;

            result = userEffect.UseEffect(now);
        });

        test("EXPECT false returned", () => {
            expect(result).toBe(false);
        });

        test("EXPECT details not to be changed", () => {
            expect(userEffect.Unused).toBe(0);
            expect(userEffect.WhenExpires).toBeUndefined();
        });
    });

    describe("GIVEN Unused is greater than 0", () => {
        let result: boolean;

        beforeEach(() => {
            result = userEffect.UseEffect(now);
        });

        test("EXPECT true returned", () => {
            expect(result).toBe(true);
        });

        test("EXPECT Unused to be subtracted by 1", () => {
            expect(userEffect.Unused).toBe(0);
        });

        test("EXPECT WhenExpires to be set", () => {
            expect(userEffect.WhenExpires).toBe(now);
        });
    });
});

describe("IsEffectActive", () => {
    describe("GIVEN WhenExpires is null", () => {
        let result: boolean;

        beforeEach(() => {
            result = userEffect.IsEffectActive();
        });

        test("EXPECT false returned", () => {
            expect(result).toBe(false);
        });
    });

    describe("GIVEN WhenExpires is defined", () => {
        describe("AND WhenExpires is in the past", () => {
            let result: boolean;

            beforeEach(() => {
                userEffect.WhenExpires = new Date(now.getTime() - 100);

                result = userEffect.IsEffectActive();
            });

            test("EXPECT false returned", () => {
                expect(result).toBe(false);
            });
        });

        describe("AND WhenExpires is in the future", () => {
            let result: boolean;

            beforeEach(() => {
                userEffect.WhenExpires = new Date(now.getTime() + 100);

                result = userEffect.IsEffectActive();
            });

            test("EXPECT true returned", () => {
                expect(result).toBe(true);
            });
        });
    });
});
