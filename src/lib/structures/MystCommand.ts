import { Args, PieceContext } from "@sapphire/framework";
import { Category, MystCommandOptions } from "mystbot";
import { Command } from "@sapphire/plugin-subcommands";

export abstract class MystCommand<T = Args> extends Command<T> {
  public usages: string;
  public category: Category;

  protected constructor(
    context: PieceContext,
    options: MystCommandOptions = {}
  ) {
    super(context, options);
    this.usages = options.usages ?? "";
    this.category = options.category ?? "General";
  }
}
declare module "@sapphire/framework" {
  interface Command {
    usages: string;
    category: Category;
  }
}
