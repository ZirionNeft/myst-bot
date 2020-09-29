declare type Category = "Economy" | "Guild" | "Other" | "Admin";

declare interface CommandInfo {
  usages: string;
  category: Category;
  coreCommand?: boolean;
  aliases?: string[];
}
