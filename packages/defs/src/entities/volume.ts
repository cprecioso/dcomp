import { DefinitionsVolume as VolumeSpec } from "../spec";
import { OverrideProperties } from "../util";
import { BaseEntity } from "./base";

export interface VolumeDefinition extends OverrideProperties<VolumeSpec, {}> {}

export class Volume extends BaseEntity<"volume", VolumeDefinition> {
  type = "volume" as const;

  get spec(): VolumeSpec {
    return this._definition;
  }
}
