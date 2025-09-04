/**
 * Add debug overlay with channel/volume/mute, and feature controls
 **/
export const createDebugOverlay = (): HTMLDivElement => {
  const overlay = document.createElement("div");
  overlay.className = "video-overlay";
  overlay.innerHTML = `
    <div class="debug-controls">
      <div style="display:flex; flex-direction:column; gap:0.5rem; align-items:center;">
        <span>
        <button class="channel-down">Channel Down</button>
          <button class="channel-up">Channel Up</button>
        </span>
        <span>
          <button class="volume-down">Volume Down</button>
          <button class="volume-up">Volume Up</button>
        </span>
        <button class="toggle-mute">Toggle Mute</button>
      </div>
      <div style="margin-top:1rem; display:flex; flex-direction:column; gap:0.5rem; align-items:center;">
        <button class="toggle-grayscale">Toggle Grayscale</button>
        <button class="toggle-scanlines">Toggle Scanlines</button>
        <span>
          <button class="horizontal-hold-down">Horizontal Hold -</button>
          <button class="horizontal-hold-up">Horizontal Hold +</button>
        </span>
        <span>
          <button class="vertical-hold-down">Vertical Hold -</button>
          <button class="vertical-hold-up">Vertical Hold +</button>
        </span>
        <button class="extreme-horizontal-meltdown">Extreme Horizontal Meltdown</button>
        <button class="percussive-maintenance">Percussive Maintenance</button>
        <button class="barrel-distortion">Barrel Distortion</button>
        <button class="webcam-mode">Toggle Webcam Mode</button>
      </div>
    </div>
  `;
  return overlay;
};
