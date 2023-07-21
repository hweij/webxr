export interface GameContext {
  /** Time since start of game */
  t: number;
  /** Delta time since last tick */
  dt: number;
}

export interface GameObject {
  /** Called every "tick", to update state. A time delta in seconds is passed. */
  tick: (context: GameContext) => void;
}