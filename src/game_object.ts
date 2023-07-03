export interface GameObject {
  /** Called every "tick", to update state. A time delta in seconds is passed. */
  tick: (dt: number) => void;
}