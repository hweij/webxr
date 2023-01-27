type StateValue = {
  pressed: boolean;
  value: number;
}

type ThumbState = {
  pressed: boolean;
  x: number;
  y: number;
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
    thumb: { pressed: false, x: 0, y: 0 },
    ax: false,
    by: false
  };
}

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
          dev.ax = gamepad.buttons[4].pressed;
          dev.by = gamepad.buttons[5].pressed;
        }
      }
    }
  }
}
