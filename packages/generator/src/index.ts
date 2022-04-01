import { Compose, VERSION } from "@dcomp/defs";
import * as jsYaml from "js-yaml";

export const generate = (compose: Compose) =>
  jsYaml.dump({ version: VERSION, ...compose.spec });
