uniform sampler2D tDiffuse;
uniform vec2 resolution;
uniform float time;
uniform float grayscale;
uniform float horizontalHold;
uniform bool extremeHorizontalMeltdown;
varying vec2 vUv;

// Barrel distortion
vec2 barrelDistortion(vec2 coord) {
  vec2 center_coord = coord - 0.5;
  // squared distance from center point
  float dist = dot(center_coord, center_coord);
  // apply distortion relative to distance
  center_coord *= 1.0 + 0.25 * dist;
  // convert back to UV space
  return center_coord + 0.5;
}

// Horizontal hold distortion
vec2 horizontalHoldDistortion(vec2 uv, float time) {
  if (horizontalHold < 0.1) return uv;

  // Create rolling effect - lines shift at different rates
  float rollSpeed = 0.5 + horizontalHold * 2.0;
  
  // Offset horizontal roll by vertical position
  // This creates a more distorted rolling effect with a diagonal shift
  float roll1 = uv.y + time * rollSpeed;

  float vertRollModifier = extremeHorizontalMeltdown ? 2.0 : 0.01;
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
    // remove out of bounds pixels to achieve rounded corner effect
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
