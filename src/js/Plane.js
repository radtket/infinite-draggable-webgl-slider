import GlObject from "./GlObject";
import { fragmentShader, vertexShader, loader } from "./constants";
import gl from "./Gl";

const { THREE } = window;

const PLANE_GEO = new THREE.PlaneBufferGeometry(1, 1, 32, 32);

const PLANE_MAT = new THREE.ShaderMaterial({
  transparent: true,
  fragmentShader,
  vertexShader,
});

class Plane extends GlObject {
  init(el) {
    super.init(el);

    this.geo = PLANE_GEO;
    this.mat = PLANE_MAT.clone();

    this.mat.uniforms = {
      uTime: { value: 0 },
      uTexture: { value: 0 },
      uMeshSize: {
        value: new THREE.Vector2(this.rect.width, this.rect.height),
      },
      uImageSize: { value: new THREE.Vector2(0, 0) },
      uScale: { value: 0.75 },
      uVelo: { value: 0 },
    };

    this.img = this.el.querySelector("img");
    this.texture = loader.load(this.img.src, texture => {
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;

      this.mat.uniforms.uTexture.value = texture;
      this.mat.uniforms.uImageSize.value = [
        this.img.naturalWidth,
        this.img.naturalHeight,
      ];
    });

    this.mesh = new THREE.Mesh(this.geo, this.mat);
    this.mesh.scale.set(this.rect.width, this.rect.height, 1);
    this.add(this.mesh);
    gl.scene.add(this);
  }
}

export default Plane;
