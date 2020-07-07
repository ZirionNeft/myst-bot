import { Client } from "@typeit/discord";

export default class App {
    private static _client: Client;

    static get Client(): Client {
        return this._client;
    }

    static async start(): Promise<void> {
        this._client = new Client();

        try {
            // In the login method, you must specify the glob string to load your classes (for the framework).
            // In this case that's not necessary because the entry point of your application is this file.
            await this._client.login(
                process.env.DISCORD_TOKEN ?? "",
                `${__dirname}/RgdBot.ts`, // glob string to load the classes
                `${__dirname}/RgdBot.js` // If you compile your bot, the file extension will be .js
            );
        } catch (e) {
            console.error('Login failed!');
        }
    }
}