import {ArgsOf, Client, Discord, On, Once} from '@typeit/discord';
import * as Path from 'path';


@Discord(process.env.COMMAND_PREFIX ?? '!', {
    import: [
        // replace extension with *.ts when the bot launch by ts-node,
        // otherwise *.js and Node launch
        Path.join(__dirname, "commands", "*.js"),
    ]
})
export class RgdBot {

    @Once('ready')
    ready() {
        console.log(Client.getCommands());
    }

    @On("message")
    onMessage([message]: ArgsOf<"message">, client: Client) {

    }
}