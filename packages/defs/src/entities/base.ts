import { Dependencies, DepEntity } from "./dependencies";
import { EntitySpecMap, EntityType } from "./entity";

export abstract class BaseEntity<Type extends EntityType, Definition> {
  public abstract readonly type: Type;

  constructor(
    public readonly name: string,
    protected readonly _definition: Definition
  ) {
    if (this._getDependencies)
      this._deps.addAll(this._getDependencies(_definition));
  }

  public abstract readonly spec: EntitySpecMap[Type];

  /** @internal */ public readonly _deps = new Dependencies();

  /** @internal */
  protected _getDependencies(definition: Definition): Iterable<DepEntity> {
    return [];
  }
}
