import gl from "./Gl";
import Slider from "./Slider";

const { gsap } = window;
/***/
/** * INIT STUFF *** */
/***/

const slider = new Slider(document.querySelector("#js-slider"));

gsap.ticker.add(() => {
  gl.render();
  slider.render();
});
