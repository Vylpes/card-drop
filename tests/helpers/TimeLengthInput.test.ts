import TimeLengthInput from "../../src/helpers/TimeLengthInput";

describe("ConvertFromMilliseconds", () => {
    test("EXPECT 1000ms to be outputted as a second", () => {
        const timeLength = TimeLengthInput.ConvertFromMilliseconds(1000);
        expect(timeLength.GetLengthShort()).toBe("1s");
    });

    test("EXPECT 60000ms to be outputted as a minute", () => {
        const timeLength = TimeLengthInput.ConvertFromMilliseconds(60000);
        expect(timeLength.GetLengthShort()).toBe("1m");
    });

    test("EXPECT 3600000ms to be outputted as an hour", () => {
        const timeLength = TimeLengthInput.ConvertFromMilliseconds(3600000);
        expect(timeLength.GetLengthShort()).toBe("1h");
    });

    test("EXPECT 86400000ms to be outputted as a day", () => {
        const timeLength = TimeLengthInput.ConvertFromMilliseconds(86400000);
        expect(timeLength.GetLengthShort()).toBe("1d");
    });

    test("EXPECT a combination to be outputted correctly", () => {
        const timeLength = TimeLengthInput.ConvertFromMilliseconds(90061000);
        expect(timeLength.GetLengthShort()).toBe("1d 1h 1m 1s");
    });

    test("EXPECT 0ms to be outputted as empty", () => {
        const timeLength = TimeLengthInput.ConvertFromMilliseconds(0);
        expect(timeLength.GetLengthShort()).toBe("");
    });

    test("EXPECT 123456789ms to be outputted correctly", () => {
        const timeLength = TimeLengthInput.ConvertFromMilliseconds(123456789);
        expect(timeLength.GetLengthShort()).toBe("1d 10h 17m 36s");
    });
});