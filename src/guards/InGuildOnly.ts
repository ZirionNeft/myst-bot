import { GuardFunction } from "@typeit/discord";
import { DMChannel } from "discord.js";
import { Container } from "typescript-ioc";
import GuildService from "../services/GuildService";
import LoggerFactory from "../utils/LoggerFactory";

export const InGuildOnly = () => {
  const guard: GuardFunction<"commandMessage"> = async (
    [message],
    client,
    next
  ) => {
    if (!(message.channel instanceof DMChannel) && message.guild) {
      try {
        // Check that guild exists in database
        // TODO: optimize in future coz this action will perform after every guild command
        await Container.get(GuildService).findOneOrCreate(message.guild.id);
      } catch (e) {
        LoggerFactory.get(InGuildOnly).error(e);
      }

      await next();
    }
  };

  return guard;
};
