const float DRAW_BLACK = -999.0;
uniform sampler2D tDiffuse;
uniform vec2 resolution;
uniform float time;
uniform float grayscale;
uniform float horizontalHold;
uniform float verticalHold;
uniform bool extremeHorizontalMeltdown;
uniform bool barrelDistortion;
uniform bool scanlines;
varying vec2 vUv;

// Barrel distortion
vec2 applyBarrelDistortion(vec2 coord) {
  vec2 center_coord = coord - 0.5;
  // squared distance from center point
  float dist = dot(center_coord, center_coord);
  // apply distortion relative to distance
  center_coord *= 1.0 + 0.40 * dist;
  // convert back to UV space
  return center_coord + 0.5;
}

// Horizontal hold distortion
vec2 horizontalHoldDistortion(vec2 uv, float time) {
  if (horizontalHold < 0.1) return uv;

  // Rolling effect with diagonal shift
  float rollSpeed = 0.5 + horizontalHold * 2.0;
  float vertRollModifier = extremeHorizontalMeltdown ? 2.0 : 0.01;

  uv.x += (uv.y + time * rollSpeed) * vertRollModifier;
  uv.x = fract(uv.x);	// Wrap horizontal coordinates

  return uv;
}

// Vertical hold distortion
vec2 verticalHoldDistortion(vec2 uv, float time) {

  if (verticalHold < 0.1) return uv;

  // NTSC: 525 total scan lines lines, 486 make up the visible raster
  // We'll apply this proportion to any video resolution
  float visibleRatio = 486.0 / 525.0;
  float visibleStart = (1.0 - visibleRatio) / 2.0;
  float visibleEnd = 1.0 - visibleStart;

  // Vertical hold rolling effect
  uv.y += 0.1 * time * verticalHold / 2.0;
  uv.y = fract(uv.y);
    if (uv.y < visibleStart || uv.y > visibleEnd) {
      uv.x = DRAW_BLACK; // signal to main to blank color
  }

  return uv;
}

void main() {
  vec2 uv = vUv;
  
  // Apply barrel distortion first if enabled
  if (barrelDistortion) {
    uv = applyBarrelDistortion(uv);
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      // remove out of bounds pixels to achieve rounded corner effect
      return;
    }
  }
  
  // Apply horizontal hold distortion
  uv = horizontalHoldDistortion(uv, time);
  // Apply vertical hold distortion
  uv = verticalHoldDistortion(uv, time);

  // If verticalHoldDistortion signaled black bar, blank color
    if (uv.x == DRAW_BLACK) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  // Sample texture with distorted UV coordinates
  vec3 color = texture2D(tDiffuse, uv).rgb;

  // Apply grayscale if enabled
  if (grayscale > 0.0) {
    float gray = dot(color, vec3(0.299, 0.587, 0.114));
    color = vec3(gray);
  }

  // Scanlines
  if (scanlines) {
	float scanlineNumber = vUv.y * 486.0;
    float scanline = 0.85 + 0.15 * sin(3.14159 * scanlineNumber);
    color *= scanline;
  }

  // Simple vignette
  if (barrelDistortion) {
    float vignette = smoothstep(0.8, 0.5, length(vUv - 0.5));
    color *= vignette;
  }

  gl_FragColor = vec4(color, 1.0);
}
