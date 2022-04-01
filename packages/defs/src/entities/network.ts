import { DefinitionsNetwork as NetworkSpec } from "../spec";
import { OverrideProperties } from "../util";
import { BaseEntity } from "./base";

export interface NetworkDefinition
  extends OverrideProperties<NetworkSpec, {}> {}

export class Network extends BaseEntity<"network", NetworkDefinition> {
  type = "network" as const;

  get spec(): NetworkSpec {
    return this._definition;
  }
}
