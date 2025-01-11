describe("AddEffectToUserInventory", () => {
    test.todo("GIVEN effect is found in database, EXPECT effect unused to be incremented");

    test.todo("GIVEN effect is NOT found in database, EXPECT new effect to be created");
});

describe("UseEffect", () => {
    test.todo("GIVEN user can not use effect, EXPECT false returned");

    test.todo("GIVEN user has effect, EXPECT entity to be updated AND true returned");
});

describe("CanUseEffect", () => {
    test.todo("GIVEN effect is not in database, EXPECT false returned");

    test.todo("GIVEN user does not have any of the effect unused, EXPECT false returned");

    test.todo("GIVEN effectDetail can not be found, EXPECT false returned");

    test.todo("GIVEN effect has NOT passed the cooldown, EXPECT false returned");

    test.todo("GIVEN effect has passed the cooldown, EXPECT true returned");

    test.todo("GIVEN effect does not have a WhenExpires date supplied, EXPECT true returned");
});

describe("HasEffect", () => {
    test.todo("GIVEN effect is NOT found in database, EXPECT false returned");

    test.todo("GIVEN effect does NOT have an expiry date, EXPECT false returned");

    test.todo("GIVEN effect.WhenExpires is in the future, EXPECT false returned");

    test.todo("GIVEN effect.WhenExpires is in the past, EXPECT true returned");
});

describe("GenerateEffectEmbed", () => {
    test.todo("GIVEN user has no effects, EXPECT embed to be generated");

    test.todo("GIVEN user has some effects, EXPECT embed to be generated");
});