import { store } from "./constants";

const { THREE } = window;

const { ww, wh } = store;

class Gl {
  constructor() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.OrthographicCamera(
      ww / -2,
      ww / 2,
      wh / 2,
      wh / -2,
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
    this.renderer.setSize(ww, wh);
    this.renderer.setClearColor(0xffffff, 0);

    const { domElement } = this.renderer;
    domElement.classList.add("dom-gl");
    document.body.appendChild(domElement);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

const gl = new Gl();

export default gl;
