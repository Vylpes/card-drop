export default class StringTools {
    public static Capitalise(str: string): string {
        const words = str.split(" ");
        const result: string[] = [];

        words.forEach(word => {
            const firstLetter = word.substring(0, 1).toUpperCase();
            const rest = word.substring(1);

            result.push(firstLetter + rest);
        });

        return result.join(" ");
    }

    public static CapitaliseArray(str: string[]): string[] {
        const res: string[] = [];

        str.forEach(s => {
            res.push(StringTools.Capitalise(s));
        });

        return res;
    }

    public static RandomString(length: number) {
        let result = "";

        const characters = "abcdefghkmnpqrstuvwxyz23456789";
        const charactersLength = characters.length;

        for ( let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }

    public static ReplaceAll(str: string, find: string, replace: string) {
        return str.replace(new RegExp(find, "g"), replace);
    }

    public static IsHexCode(str: string): boolean {
        if (str.length != 6) return false;

        const characters = "0123456789abcdefABCDEF";

        for (let i = 0; i < 6; i++) {
            const char = str[i];

            if (!characters.includes(char)) return false;
        }

        return true;
    }
}