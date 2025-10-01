import * as THREE from "three";
// Import shaders as raw text
import vertexShader from "./shaders/crt_vert.glsl?raw";
import fragmentShader from "./shaders/crt_frag.glsl?raw";

let grayscaleUniform: { value: number } | null = null;
let horizontalHoldUniform: { value: number } = { value: 0.0 };
let verticalHoldUniform: { value: number } = { value: 0.0 };
let extremeHorizontalMeltdownUniform: { value: boolean } = { value: false };
let barrelDistortionUniform: { value: boolean } = { value: false };
let scanlinesUniform: { value: boolean } = { value: false };
let crtRenderer: THREE.WebGLRenderer | null = null;
let shouldRender = true;

type ShaderInits = {
  grayscale: boolean;
  horizontalHold: number;
  verticalHold: number;
  extremeHorizontalMeltdown: boolean;
  barrelDistortion: boolean;
  scanlines: boolean;
};

// Usage: Call setUpCRTScene(videoElement) after your video is loaded and playing
export function setUpCRTScene(
  video: HTMLVideoElement,
  container: HTMLElement = document.body,
  {
    grayscale = false,
    horizontalHold = 0.0,
    verticalHold = 0.0,
    extremeHorizontalMeltdown = false,
    barrelDistortion = false,
    scanlines = false,
  }: Partial<ShaderInits> = {}
) {
  // Create renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true, // Enable transparency to show CSS background gif
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.classList.add("threejs-canvas"); // @todo: fix this so i can be more selective in the CSS
  container.appendChild(renderer.domElement);

  // Store reference to renderer for external access
  crtRenderer = renderer;

  // Create scene and camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 2;

  // Create video texture
  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.format = THREE.RGBFormat;

  // Use PlaneGeometry for CRT effect
  const geometry = new THREE.PlaneGeometry(2, 1.5, 128, 128); // 4:3 aspect

  // CRT-style shader with:
  // barrel distortion, grayscale, horizontal/vertical hold, and extreme horizontal meltdown
  const material = new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: videoTexture },
      resolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      time: { value: 0 },
      grayscale: { value: grayscale },
      horizontalHold: { value: horizontalHold },
      verticalHold: { value: verticalHold },
      extremeHorizontalMeltdown: { value: extremeHorizontalMeltdown },
      barrelDistortion: { value: barrelDistortion },
      scanlines: { value: scanlines },
    },
    vertexShader,
    fragmentShader,
  });

  const mesh = new THREE.Mesh(geometry, material);
  // @todo: only do this if in "webcam mirror mode"
  // needs to be mirrored to ....look like a mirror, but it makes text backwards 
  //   mesh.scale.x = -1; // Flip the mesh horizontally
  scene.add(mesh);

  // Store reference to uniforms for external control
  grayscaleUniform = material.uniforms.grayscale;
  horizontalHoldUniform = material.uniforms.horizontalHold;
  verticalHoldUniform = material.uniforms.verticalHold;
  extremeHorizontalMeltdownUniform =
    material.uniforms.extremeHorizontalMeltdown;
  barrelDistortionUniform = material.uniforms.barrelDistortion;
  scanlinesUniform = material.uniforms.scanlines;

  // Handle resizing
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    material.uniforms.resolution.value.set(
      window.innerWidth,
      window.innerHeight
    );
  });

  // Animation loop
  function animate() {
    material.uniforms.time.value = performance.now() / 1000.0;
    requestAnimationFrame(animate);

    if (shouldRender) {
      renderer.render(scene, camera);
    }
  }
  animate();
}

// Export function to control grayscale from outside
export function setGrayscaleShader(enabled: boolean) {
  if (grayscaleUniform) {
    grayscaleUniform.value = enabled ? 1.0 : 0.0;
  }
}

// Export function to control horizontal hold from outside
export function setHorizontalHoldShader(holdValue: number) {
  console.log("Setting horizontal hold to:", holdValue);
  if (horizontalHoldUniform) {
    horizontalHoldUniform.value = holdValue;
  }
}

export function setVerticalHoldShader(target: number) {
  console.log("Setting vertical hold to:", target);
  if (verticalHoldUniform) {
    verticalHoldUniform.value = target;
  }
}

export function setExtremeHorizontalMeltdownShader(enabled: boolean) {
  extremeHorizontalMeltdownUniform.value = enabled;
}

export function setBarrelDistortionShader(enabled: boolean) {
  console.log("Setting barrel distortion to:", enabled);
  barrelDistortionUniform.value = enabled;
}

export function setScanlinesShader(enabled: boolean) {
  console.log("Setting scanlines to:", enabled);
  scanlinesUniform.value = enabled;
}

// Export function to clear the renderer (useful for channel changes)
export function clearCRTRenderer() {
  if (crtRenderer) {
    crtRenderer.clear();
  }
  shouldRender = false;
}

// Export function to resume rendering
export function resumeCRTRenderer() {
  shouldRender = true;
}
