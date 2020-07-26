import {
  DCommand,
  DDiscord,
  MetadataStorage,
  Modifier,
  Rule,
} from "@typeit/discord";

export function Aliases(...aliases: string[][]);
export function Aliases(...aliases: string[][]) {
  return (target: Function, key?: string, descriptor?: PropertyDescriptor) => {
    const stringifyExpr = (aliases: string[]) =>
      aliases.reduceRight((p: string, c: string): string => `(?:${c}|${p})`);

    // TODO: Сделать поддержку аргументов вида :arg
    MetadataStorage.instance.addModifier(
      Modifier.createModifier<DCommand | DDiscord>(async (original) => {
        original.argsRules = [
          ...original.argsRules,
          () => {
            let chain = Rule(stringifyExpr(aliases[0]));
            for (let i = 1; i < aliases.length; i++) {
              if (aliases[i].length > 0)
                chain = chain.space(stringifyExpr(aliases[i]));
            }
            return [chain.end()];
          },
        ];
      }).decorateUnknown(target, key, descriptor)
    );
  };
}
