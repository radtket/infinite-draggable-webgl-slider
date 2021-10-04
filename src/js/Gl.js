import { store } from "./constants";

const { THREE } = window;

class Gl {
  constructor() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.OrthographicCamera(
      store.ww / -2,
      store.ww / 2,
      store.wh / 2,
      store.wh / -2,
      1,
      10
    );
    this.camera.lookAt(this.scene.position);
    this.camera.position.z = 1;

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    this.renderer.setPixelRatio(1.5);
    this.renderer.setSize(store.ww, store.wh);
    this.renderer.setClearColor(0xffffff, 0);

    this.init();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  init() {
    const { domElement } = this.renderer;
    domElement.classList.add("dom-gl");
    document.body.appendChild(domElement);
  }
}

const gl = new Gl();

export default gl;
