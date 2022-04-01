import { DefinitionsService as ServiceSpec } from "../spec";
import { OverrideProperties } from "../util";
import { BaseEntity } from "./base";
import { Network as NetworkEntity } from "./network";
import { Volume as VolumeEntity } from "./volume";

type ArrayElement<T extends any[]> = T extends (infer U)[] ? U : never;

type VolumeConfig = ArrayElement<NonNullable<ServiceSpec["volumes"]>>;
type VolumeConfigObj = Exclude<VolumeConfig, string>;
export interface ServiceVolumeDefinition
  extends OverrideProperties<
    VolumeConfigObj,
    { source?: VolumeEntity | VolumeConfigObj["source"] }
  > {}

type PortConfig = ArrayElement<NonNullable<ServiceSpec["ports"]>>;
type PortConfigObj = Exclude<PortConfig, string | number>;
export interface ServicePortDefinition
  extends OverrideProperties<PortConfigObj, { published?: number }> {}

export interface ServiceDefinition
  extends OverrideProperties<
    ServiceSpec,
    {
      depends_on?: Service[];
      networks?: NetworkEntity[];
      volumes_from?: never;
      volumes?: ServiceVolumeDefinition[];
      environment?: Record<string, string>;
      ports?: (ServicePortDefinition | number)[];
    }
  > {}

export class Service extends BaseEntity<"service", ServiceDefinition> {
  type = "service" as const;

  get spec(): ServiceSpec {
    return {
      ...this._definition,
      depends_on: this._definition.depends_on?.map((s) => s.name),
      networks: this._definition.networks?.map((s) => s.name),
      volumes: this._definition.volumes?.map((v) => ({
        ...v,
        source: v.source instanceof VolumeEntity ? v.source.name : v.source,
      })),
    };
  }

  /** @internal */
  *_getDependencies(definition: ServiceDefinition) {
    yield* definition.depends_on ?? [];
    yield* definition.networks ?? [];
    for (const { source } of definition.volumes ?? []) {
      if (source instanceof VolumeEntity) yield source;
    }
  }

  get internalPorts() {
    return (
      this._definition.expose?.map((p) =>
        typeof p === "number" ? p : Number.parseInt(p)
      ) ?? []
    );
  }
}
