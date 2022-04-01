import { ComposeSpecification as ComposeSpec } from "../spec";
import { OverrideProperties } from "../util";
import { BaseEntity } from "./base";
import { Dependencies, DepEntity } from "./dependencies";
import { Network } from "./network";
import { Service } from "./service";
import { Volume } from "./volume";

export interface ComposeDefinition
  extends OverrideProperties<
    ComposeSpec,
    {
      name: never;
      services?: Service[];
      networks?: Network[];
      volumes?: Volume[];
    }
  > {}

export class Compose extends BaseEntity<"compose", ComposeDefinition> {
  type = "compose" as const;

  get spec(): ComposeSpec {
    const internalDeps = this._getInternalDeps();

    return {
      ...this._definition,
      name: this.name,
      services: internalDeps.asSpecRecordOfType("service"),
      volumes: internalDeps.asSpecRecordOfType("volume"),
      networks: internalDeps.asSpecRecordOfType("network"),
    };
  }

  private _getInternalDeps() {
    return new Dependencies()
      .addAll(this._definition.services)
      .addAll(this._definition.volumes)
      .addAll(this._definition.networks)
      .flatten();
  }
}
