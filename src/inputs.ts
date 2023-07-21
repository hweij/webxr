/** Hysteresis for converting analog to binary */
const HYST = 0.2;

type StateValue = {
  pressed: boolean;
  value: number;
}

type ThumbState = {
  pressed: boolean;
  x: number;
  y: number;
  /** Thumb-left "button" (with hysteresis) */
  left: boolean;
  /** Thumb-right "button" (with hysteresis) */
  right: boolean;
  /** Thumb-forward "button" (with hysteresis) */
  forward: boolean;
  /** Thumb-back "button" (with hysteresis) */
  back: boolean;
}

type InputDevice = {
  trigger: StateValue;
  grab: StateValue;
  thumb: ThumbState;
  ax: boolean;
  by: boolean;
}

function defaultInputValue() {
  return {
    trigger : { pressed: false, value: 0 },
    grab: { pressed: false, value: 0 },
    thumb: { pressed: false, x: 0, y: 0, left: false, right: false, forward: false, back: false },
    ax: false,
    by: false
  };
}

/** Left and right controller inputs: buttons, thumb */
export class Inputs {
  left: InputDevice = defaultInputValue()
  right: InputDevice = defaultInputValue();

  update(inputSources: XRInputSourceArray) {
    for (const source of inputSources) {
      let dev;
      switch (source.handedness) {
        case 'right':
          dev = this.right;
          break;
        case 'left':
          dev = this.left;
          break;
      }
      if (dev) {
        const gamepad = source.gamepad;
        if (gamepad) {
          dev.trigger.pressed = gamepad.buttons[0].pressed;
          dev.trigger.value = gamepad.buttons[0].value;
          dev.grab.pressed = gamepad.buttons[1].pressed;
          dev.grab.value = gamepad.buttons[1].value;
          dev.thumb.pressed = gamepad.buttons[3].pressed;
          dev.thumb.x = gamepad.axes[2];
          dev.thumb.y = gamepad.axes[3];
          dev.thumb.left = hyst(dev.thumb.left, dev.thumb.x, -0.5);
          dev.thumb.right = hyst(dev.thumb.right, dev.thumb.x, 0.5);
          dev.thumb.forward = hyst(dev.thumb.forward, dev.thumb.y, -0.5);
          dev.thumb.back = hyst(dev.thumb.back, dev.thumb.y, 0.5);
          dev.ax = gamepad.buttons[4].pressed;
          dev.by = gamepad.buttons[5].pressed;
        }
      }
    }
  }
}

function hyst(state: boolean, v: number, triggerValue: number) {
  const low = (v <= (triggerValue - HYST));
  const high = (v >= (triggerValue + HYST));
  if (triggerValue < 0.5) {
    // Active low (true)
    return (low || state) && !high;
  }
  else {
    // Active high (true)
    return (high || state) && !low;
  }
}