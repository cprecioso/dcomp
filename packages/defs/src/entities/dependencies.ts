import { EntityType, EntityMap, EntitySpecMap } from "./entity";

type _<T> = T;

export type DepEntityType = Exclude<EntityType, "compose">;
export type DepEntity = EntityMap[DepEntityType];

const makeKey = (dep: DepEntity) => `${dep.type}:${dep.name}` as const;

export class Dependencies {
  storage = new Map<ReturnType<typeof makeKey>, DepEntity>();

  add(dep: DepEntity) {
    const key = makeKey(dep);
    const prevVal = this.storage.get(key);
    if (prevVal === dep) return this;
    if (prevVal)
      throw new Error(
        `There already exists an entity [${prevVal.type}] with the same name [${prevVal.name}]`
      );
    this.storage.set(key, dep);
    return this;
  }

  addAll(it?: Iterable<DepEntity>) {
    if (it) for (const el of it) this.add(el);
    return this;
  }

  *ofType<Type extends DepEntityType, U>(
    type: Type,
    fn: (el: EntityMap[Type]) => U = (i) =>
      // @ts-expect-error
      i
  ) {
    for (const el of this.storage.values()) {
      if (el.type === type)
        yield fn(
          // @ts-expect-error
          el
        );
    }
  }

  asSpecRecordOfType<Type extends DepEntityType>(
    type: Type
  ): Record<string, EntitySpecMap[Type]> {
    return Object.fromEntries(this.ofType(type, (v) => [v.name, v.spec]));
  }

  *deepIterate(): Iterable<DepEntity> {
    for (const dep of this.storage.values()) {
      yield dep;
      yield* dep._deps.deepIterate();
    }
  }

  flatten() {
    this.addAll(this.deepIterate());
    return this;
  }
}
