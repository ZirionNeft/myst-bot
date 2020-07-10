
export default abstract class BaseCommand {

    get aliases(): string[] {
        return this._aliases;
    }

    protected _onlyBotChannel = false;
    protected _aliases: string[] = [];
}