import {
  ComposeSpecification as ComposeSpec,
  DefinitionsNetwork as NetworkSpec,
  DefinitionsService as ServiceSpec,
  DefinitionsVolume as VolumeSpec,
} from "../spec";
import { BaseEntity } from "./base";

type _<T> = T;

export type EntityType = "compose" | "network" | "service" | "volume";

type _MakeEntitySpecMap<T extends Record<EntityType, unknown>> = T;

export interface EntitySpecMap
  extends _MakeEntitySpecMap<{
    compose: ComposeSpec;
    network: NetworkSpec;
    service: ServiceSpec;
    volume: VolumeSpec;
  }> {}

export interface EntityMap
  extends _<{
    [P in EntityType]: BaseEntity<P, any>;
  }> {}

export type Entity = EntityMap[EntityType];
