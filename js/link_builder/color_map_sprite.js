
import { Lut } from '../../node_modules/three/examples/jsm/math/Lut.js';
import { linkMeshList } from '../../public/main.js'; 

class ColorMapCanvas {
    constructor( colorMapName, maxLinkStrength=1, minLinkStrength=0, canvasLen=1000 ){
        this.lut = new Lut();
        this.lut.setColorMap( colorMapName );
        this.lut.setMax(maxLinkStrength);
        this.lut.setMin(minLinkStrength);
        this.topValueCanvas = document.createElement('canvas');
        this.topValueCanvas.width = canvasLen;
        this.topValueCanvas.height = canvasLen;
        this.bottomValueCanvas = document.createElement('canvas');
        this.bottomValueCanvas.width = canvasLen;
        this.bottomValueCanvas.height = canvasLen;
    }

    lut;
    getMaxV() {return this.lut.maxV;}
    getMinV() {return this.lut.minV;}

    drawColorMapCanvas(){
        if (!linkMeshList || linkMeshList.length == 0){ return; }
        const colorMap = document.getElementById("colorMap");
        colorMap.textContent = "";

        const topValue = document.createElement("div");
        topValue.innerText = parseFloat(this.getMaxV()).toFixed(2);
        topValue.className = "colorMapText";
        const bottomValue = document.createElement("div");
        bottomValue.innerText = parseFloat(this.getMinV()).toFixed(2);
        bottomValue.className = "colorMapText";

        const canvas = this.lut.createCanvas();
        canvas.setAttribute("id", "colorBar");
        colorMap.appendChild(topValue);
        colorMap.appendChild(canvas);
        colorMap.appendChild(bottomValue);
    }

    clear(){
        document.getElementById("colorMap").textContent = "";
    }


    getColor(val){
        return this.lut.getColor(val);
    }

    setColorMap(linkColorMap){
        if (linkColorMap){
            this.lut.setColorMap( linkColorMap );
        }
        this.drawColorMapCanvas();
    }

    static show(val=true){
        if(val){
            document.getElementById("colorMap").style.visibility = 'visible';
        }
        if(!val){
            document.getElementById("colorMap").style.visibility = 'hidden';
        }
    }
}

export { ColorMapCanvas }
