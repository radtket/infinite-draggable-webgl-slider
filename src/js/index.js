import gsap from "gsap";

import gl from "./Gl";
import Slider from "./Slider";

/***/
/** * INIT STUFF *** */
/***/

const slider = new Slider(document.querySelector("#js-slider"));

gsap.ticker.add(() => {
  gl.render();
  slider.render();
});
