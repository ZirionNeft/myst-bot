export class AppArgs {
  private static _knownArgs = ["--log-level"];

  // Parse app arguments
  private static _args = (() => {
    const a = process.argv
      ?.filter((e) => AppArgs._knownArgs.indexOf(e.split("=")[0]) !== -1)
      ?.map((v) => {
        const a = v.split("=");
        return { [a[0].slice(2)]: a[1] };
      });
    return (a.length ? a.reduce((p, c) => ({ ...p, ...c })) : a) ?? [];
  })();

  static get args() {
    return this._args;
  }
}
