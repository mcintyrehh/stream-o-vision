void scanLineEffect(inout vec3 color, vec2 vUv, float time) {	
	// Calculate proper line frequency for exactly 486 visible lines
    float targetLines = 486.0; // NTSC visible lines
    
    // Much slower field switching for less aggressive flickering
    float currentField = mod(floor(time * 60.0), 2.0); // 60Hz field switching
    
    // Calculate which line we're on (0-485)
    float currentLine = floor(vUv.y * targetLines);
    
    // Determine which field this line belongs to (odd or even)
    float pixelField = mod(currentLine, 2.0);
    
    // Create scanlines with correct frequency for 486 lines
    float scanline = 0.85 + 0.15 * sin(3.14159 * currentLine);
    
    // Add vertical phosphor bloom - sample surrounding lines
    float bloom = 0.0;
    float bloomRadius = 1.5; // How many lines above/below to affect
    
    // Sample a few lines above and below for bloom effect
    for (float i = -bloomRadius; i <= bloomRadius; i += 0.5) {
      float sampleLine = currentLine + i;
      if (sampleLine >= 0.0 && sampleLine < targetLines) {
        float distance = abs(i);
        float weight = exp(-distance * distance * 0.5); // Gaussian falloff
        float sampleScanline = 0.85 + 0.15 * sin(3.14159 * sampleLine);
        bloom += sampleScanline * weight * 0.1; // Reduced intensity for bloom
      }
    }
    
    // Combine main scanline with bloom
    scanline = mix(scanline, scanline + bloom, 0.3); // 30% bloom contribution
    
    // Apply interlaced field dimming (243 lines per field)
    if (pixelField != currentField) {
      color *= scanline * 0.2; // Off-field: dimmer (phosphor persistence)
    } else {
      color *= scanline; // On-field: full intensity
    }
}