import {CoreClient} from "../src/client/client";
import Registry from "../src/registry";
import fs from "fs";
import path from "path";

describe("RegisterCommands", () => {
    test("EXPECT every command in the commands folder to be registered", () => {
        const registeredCommands: string[] = [];

        CoreClient.RegisterCommand = jest.fn().mockImplementation((name: string) => {
            registeredCommands.push(name);
        });

        Registry.RegisterCommands();

        const commandFiles = getFilesInDirectory(path.join(process.cwd(), "src", "commands"))
            .filter(x => x.endsWith(".ts"));

        for (const file of commandFiles) {
            expect(registeredCommands).toContain(file.split("/").pop()!.split(".")[0]);
        }

        expect(commandFiles.length).toBe(registeredCommands.length);
    });
});

describe("RegisterButtonEvents", () => {
    test("EXEPCT every button event in the button events folder to be registered", () => {
        const registeredButtonEvents: string[] = [];

        CoreClient.RegisterButtonEvent = jest.fn().mockImplementation((name: string) => {
            registeredButtonEvents.push(name);
        });

        Registry.RegisterButtonEvents();

        const eventFiles = getFilesInDirectory(path.join(process.cwd(), "src", "buttonEvents"))
            .filter(x => x.endsWith(".ts"));

        for (const file of eventFiles) {
            expect(registeredButtonEvents).toContain(file.split("/").pop()!.split(".")[0].toLowerCase());
        }

        expect(eventFiles.length).toBe(registeredButtonEvents.length);
    });
});

function getFilesInDirectory(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);

    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
            /* recurse into a subdirectory */
            results = results.concat(getFilesInDirectory(file));
        } else {
            /* is a file */
            results.push(file);
        }
    });

    return results;
}
