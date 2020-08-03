declare type Category = "Economy" | "Guild" | "Other";

declare interface CommandInfo {
  usages: string;
  category: Category;
  coreCommand?: boolean;
  aliases?: string[];
}
