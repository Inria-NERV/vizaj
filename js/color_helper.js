

export function hexToHsl(hex) {

    const r = parseInt("0x" + hex[1] + hex[2]) / 255,
         g = parseInt("0x" + hex[3] + hex[4]) / 255,
         b = parseInt("0x" + hex[5] + hex[6]) / 255;

    let cmin = Math.min(r,g,b),
        cmax = Math.max(r,g,b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;
    
    // Calculate hue
    // No difference
    if (delta == 0){
        h = 0;
    } 
    // Red is max
    else if (cmax == r){
        h = ((g - b) / delta) % 6;
    }
    // Green is max
    else if (cmax == g){
        h = (b - r) / delta + 2;
    }
        
    // Blue is max
    else{
        h = (r - g) / delta + 4;
    }
        

    h = Math.round(h * 60);
    
    // Make negative hues positive behind 360°
    if (h < 0){
        h += 360;
    }
    

    // Calculate lightness
    l = (cmax + cmin) / 2;

    // Calculate saturation
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        
    // Multiply l and s by 100
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return {
        h:h,
        s:s,
        l:l
    }
}