import { Subscribe } from "../decorators/Subscribe";
import { OnlyInstantiableByContainer } from "typescript-ioc";
import { MessageHelpers } from "../utils/MessageHelpers";
import { MessageEmbed } from "discord.js";
import type { BusinessEventArgs, Subscriber } from "../structures/EventBus";

// TODO: Rework to Sapphire's events?

@OnlyInstantiableByContainer
export class LevelUpSubscriber implements Subscriber<"levelUp"> {
	@Subscribe("levelUp")
	public async handle([
		userId,
		guildId,
		experienceDTO,
	]: BusinessEventArgs<"levelUp">) {
		await MessageHelpers.sendInInfoChannel.call(
			this,
			guildId,
			new MessageEmbed()
				.setDescription(
					`<@${userId}> just leveled up [**${
						experienceDTO.level - 1
					}**] --> [**${experienceDTO.level}**], yeeeah!`
				)
				.setColor("GOLD")
		);
	}
}
