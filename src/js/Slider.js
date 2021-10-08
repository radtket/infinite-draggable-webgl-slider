import gsap from "gsap";
import { store } from "./constants";
import Plane from "./Plane";

const { isDevice, ww } = store;

const usePosition = ({ changedTouches, clientX, clientY, target }) => {
  return {
    x: changedTouches ? changedTouches[0].clientX : clientX,
    y: changedTouches ? changedTouches[0].clientY : clientY,
    target,
  };
};

const useIsVisible = ({ left, right, width, min, max }, { state, opts }) => {
  const { currentRounded } = state;
  const { threshold } = opts;
  const translate = gsap.utils.wrap(min, max, currentRounded);

  const start = left + translate;
  const end = right + translate;

  return {
    translate,
    isVisible: start < threshold + ww && end > -threshold,
    progress: gsap.utils.clamp(
      0,
      1,
      1 - (translate + left + width) / (ww + width)
    ),
  };
};

class Slider {
  constructor(el, opts = {}) {
    this.bindAll();

    this.el = el;

    this.opts = { speed: 2, threshold: 50, ease: 0.075, ...opts };

    this.ui = {
      items: this.el.querySelectorAll(".js-slide"),
      titles: document.querySelectorAll(".js-title"),
      lines: document.querySelectorAll(".js-progress-line"),
    };

    this.state = {
      snap: {
        points: [],
      },
      flags: {
        dragging: false,
      },
      on: {
        x: 0,
        y: 0,
      },
      off: 0,
      current: 0,
      currentRounded: 0,
      diff: 0,
      max: 0,
      min: 0,
      progress: 0,
      target: 0,
      y: 0,
    };

    this.items = [];

    this.events = {
      move: isDevice ? "touchmove" : "mousemove",
      up: isDevice ? "touchend" : "mouseup",
      down: isDevice ? "touchstart" : "mousedown",
    };

    this.init();
  }

  bindAll() {
    ["onDown", "onMove", "onUp"].forEach(fn => {
      this[fn] = this[fn].bind(this);
      // return (this[fn] = this[fn].bind(this));
    });
  }

  init() {
    return gsap.utils.pipe(this.setup(), this.on());
  }

  destroy() {
    this.off();
    this.state = null;
    this.items = null;
    this.opts = null;
    this.ui = null;
  }

  on() {
    const { move, up, down } = this.events;

    window.addEventListener(down, this.onDown);
    window.addEventListener(move, this.onMove);
    window.addEventListener(up, this.onUp);
  }

  off() {
    const { move, up, down } = this.events;

    window.removeEventListener(down, this.onDown);
    window.removeEventListener(move, this.onMove);
    window.removeEventListener(up, this.onUp);
  }

  setup() {
    const { state, ui } = this;
    const { items, titles } = ui;

    const { width: wrapWidth, left: wrapDiff } =
      this.el.getBoundingClientRect();

    // Set bounding
    state.max = -(
      items[items.length - 1].getBoundingClientRect().right -
      wrapWidth -
      wrapDiff
    );
    state.min = 0;

    // Global timeline
    this.tl = gsap
      .timeline({
        paused: true,
        defaults: {
          duration: 1,
          ease: "linear",
        },
      })
      .fromTo(
        ".js-progress-line-2",
        {
          scaleX: 1,
        },
        {
          scaleX: 0,
          duration: 0.5,
          ease: "power3",
        },
        0
      )
      .fromTo(
        ".js-titles",
        {
          yPercent: 0,
        },
        {
          yPercent: -(100 - 100 / titles.length),
        },
        0
      )
      .fromTo(
        ".js-progress-line",
        {
          scaleX: 0,
        },
        {
          scaleX: 1,
        },
        0
      );

    // Cache stuff
    Array.from(items).reduce((all, el) => {
      const { left, right, width } = el.getBoundingClientRect();

      // Create webgl plane
      const plane = new Plane();
      plane.init(el);

      // Timeline that plays when visible
      const tl = gsap.timeline({ paused: true }).fromTo(
        plane.mat.uniforms.uScale,
        {
          value: 0.65,
        },
        {
          value: 1,
          duration: 1,
          ease: "linear",
        }
      );

      all.push({
        el,
        plane,
        left,
        right,
        width,
        min: left < ww ? ww * 0.775 : -(ww * 0.225 - wrapWidth * 0.2),
        max:
          left > ww
            ? state.max - ww * 0.775
            : state.max + (ww * 0.225 - wrapWidth * 0.2),
        tl,
        out: false,
      });

      return all;
    }, this.items);
  }

  calc() {
    const { state } = this;
    state.current += (state.target - state.current) * this.opts.ease;
    state.currentRounded = Math.round(state.current * 100) / 100;
    state.diff = (state.target - state.current) * 0.0005;
    state.progress = gsap.utils.wrap(0, 1, state.currentRounded / state.max);

    this.tl && this.tl.progress(state.progress);
  }

  transformItems() {
    const { items = [], state, opts } = this;
    const { flags } = state;

    items.forEach((_, i) => {
      const item = this.items[i];
      const { translate, isVisible, progress } = useIsVisible(item, {
        state,
        opts,
      });

      item.plane.updateX(translate);
      item.plane.mat.uniforms.uVelo.value = this.state.diff;

      if (!item.out && item.tl) {
        item.tl.progress(progress);
      }

      if (isVisible || flags.resize) {
        item.out = false;
      } else if (!item.out) {
        item.out = true;
      }
    });
  }

  render() {
    this.calc();
    this.transformItems();
  }

  onDown(e) {
    const { x, y } = usePosition(e);
    const { flags, on } = this.state;

    flags.dragging = true;
    on.x = x;
    on.y = y;
  }

  onUp() {
    const { state } = this;

    state.flags.dragging = false;
    state.off = state.target;
  }

  onMove(e) {
    const { x, y } = usePosition(e);
    const { state } = this;

    if (!state.flags.dragging) {
      return;
    }

    const { off, on } = state;
    const moveX = x - on.x;
    const moveY = y - on.y;

    if (Math.abs(moveX) > Math.abs(moveY) && e.cancelable) {
      e.preventDefault();
      e.stopPropagation();
    }

    state.target = off + moveX * this.opts.speed;
  }
}

export default Slider;
