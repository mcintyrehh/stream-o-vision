import * as THREE from "three";

let grayscaleUniform: { value: number } | null = null;
let horizontalHoldUniform: { value: number } = { value: 0.0 }; // Default to no hold

// Usage: Call setUpCRTScene(videoElement) after your video is loaded and playing
export function setUpCRTScene(
  video: HTMLVideoElement,
  container: HTMLElement = document.body
) {
  // Create renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

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

  // CRT-style barrel distortion and scanlines shader
  const material = new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: videoTexture },
      resolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      time: { value: 0 },
      grayscale: { value: 0.0 },
      horizontalHold: { value: 0.0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform vec2 resolution;
      uniform float time;
      uniform float grayscale;
      uniform float horizontalHold;
      varying vec2 vUv;
      
      // Barrel distortion
      vec2 barrelDistortion(vec2 coord) {
        vec2 cc = coord - 0.5;
        float dist = dot(cc, cc);
        cc *= 1.0 + 0.25 * dist;
        return cc + 0.5;
      }
      
      // Horizontal hold distortion
      vec2 horizontalHoldDistortion(vec2 uv, float time) {
        if (horizontalHold < 0.1) return uv;
        
        // Create rolling effect - lines shift at different rates
        float rollSpeed = 0.5 + horizontalHold * 2.0;
        
        // Offset horizontal roll by vertical position
        // This creates a more distorted rolling effect with a diagonal shift
        float roll1 = uv.y + time * rollSpeed;

        float vertRollModifier = 0.01;
        float totalRoll = roll1 * vertRollModifier;

        uv.x += totalRoll;
        
        // Wrap horizontal coordinates
        uv.x = fract(uv.x);
        
        return uv;
      }
      
      void main() {
        // Barrel distortion
        vec2 uv = barrelDistortion(vUv);
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // vignette
          return;
        }
        
        // Apply horizontal hold distortion
        uv = horizontalHoldDistortion(uv, time);
        
        vec3 color = texture2D(tDiffuse, uv).rgb;
        
        // Apply grayscale if enabled
        if (grayscale > 0.0) {
          float gray = dot(color, vec3(0.299, 0.587, 0.114));
          color = vec3(gray);
        }
        
        // Scanlines
        float scanline = 0.85 + 0.15 * sin(3.14159 * vUv.y * resolution.y * 0.5 + time * 2.0);
        color *= scanline;

        // Simple vignette
        float vignette = smoothstep(0.8, 0.5, length(vUv - 0.5));
        color *= vignette;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Store reference to uniforms for external control
  grayscaleUniform = material.uniforms.grayscale;
  horizontalHoldUniform = material.uniforms.horizontalHold;

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
    renderer.render(scene, camera);
  }
  animate();
}

// Export function to control grayscale from outside
export function setGrayscale(enabled: boolean) {
  if (grayscaleUniform) {
    grayscaleUniform.value = enabled ? 1.0 : 0.0;
  }
}

// Export function to control horizontal hold from outside
export function setHorizontalHold(holdValue: number) {
  console.log("Setting horizontal hold to:", holdValue);
  if (horizontalHoldUniform) {
    horizontalHoldUniform.value = holdValue;
  }
}
