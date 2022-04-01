import Liftoff from "liftoff";
import { generate } from "@dcomp/generator";
import fs from "fs";
import path from "path";

void (async () => {
  const Dcomp = new Liftoff({
    name: "dcomp",
    configName: "Compose",
    extensions: { ".mjs": null },
  });

  const preparedEnv = await new Promise<Liftoff.LiftoffEnv>((f) =>
    Dcomp.prepare({}, f)
  );

  const [env] = await new Promise<[env: Liftoff.LiftoffEnv, argv: string[]]>(
    (f) => Dcomp.execute(preparedEnv, (env, argv) => f([env, argv]))
  );

  if (!env.configPath) throw new Error("No Compose.mjs file found");

  console.log(env.configPath);

  const { default: composeDef } = await import(env.configPath);

  const composeFile = generate(composeDef);
  await fs.promises.writeFile(
    path.resolve(env.cwd, "docker-compose.yml"),
    composeFile
  );
})();
