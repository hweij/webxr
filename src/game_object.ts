export interface GameObject {
  /** Called every "tick", to update state */
  tick: (dt: number) => void;
}