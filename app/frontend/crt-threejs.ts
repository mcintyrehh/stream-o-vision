import * as THREE from "three";

// Usage: Call setupCRTScene(videoElement) after your video is loaded and playing
export function setupCRTScene(
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
      varying vec2 vUv;
      
      // Barrel distortion
      vec2 barrelDistortion(vec2 coord) {
        vec2 cc = coord - 0.5;
        float dist = dot(cc, cc);
        cc *= 1.0 + 0.25 * dist;
        return cc + 0.5;
      }
      
      void main() {
        // Barrel distortion
        vec2 uv = barrelDistortion(vUv);
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // vignette
          return;
        }
        vec3 color = texture2D(tDiffuse, uv).rgb;
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
