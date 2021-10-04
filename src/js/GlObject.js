import { store } from "./constants";

const { THREE } = window;

class GlObject extends THREE.Object3D {
  init(el) {
    this.el = el;
    this.resize();
  }

  resize() {
    this.rect = this.el.getBoundingClientRect();
    const { left, top, width, height } = this.rect;

    this.pos = {
      x: left + width / 2 - store.ww / 2,
      y: top + height / 2 - store.wh / 2,
    };

    this.position.y = this.pos.y;
    this.position.x = this.pos.x;

    this.updateX();
  }

  updateX(current) {
    current && (this.position.x = current + this.pos.x);
  }
}

export default GlObject;
