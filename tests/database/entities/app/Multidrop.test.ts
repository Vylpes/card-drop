import Multidrop from "../../../../src/database/entities/app/Multidrop";

describe("Multidrop", () => {
    test("EXPECT kept and sacrificed cards to be recorded", () => {
        const multidrop = new Multidrop("user-1");

        multidrop.Keep("card-1");
        multidrop.Keep("card-2");
        multidrop.Sacrifice("card-3");

        expect(multidrop.CardsKept).toEqual([ "card-1", "card-2" ]);
        expect(multidrop.CardsSacrificed).toEqual([ "card-3" ]);
    });
});
