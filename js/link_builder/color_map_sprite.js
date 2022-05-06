import * as THREE from "three";
import { Lut } from '../../node_modules/three/examples/jsm/math/Lut.js';
import { linkMeshList, uiScene } from '../../public/main.js'; 
import { colorMapCanvas } from './draw_links';
import { deleteMesh } from '../mesh_helper.js';

class ColorMapCanvas {
    constructor( colorMapName, maxLinkStrength=1, minLinkStrength=0, canvasLen=1000 ){
        this.lut = new Lut();
        this.lut.setColorMap( colorMapName );
        this.lut.setMax(maxLinkStrength);
        if (maxLinkStrength == minLinkStrength){
            this.lut.setMin(minLinkStrength - 0.001);
        }
        else {
            this.lut.setMin(minLinkStrength);
        }
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

    static changeTextColor(color){
        let elements = document.getElementsByClassName('colorMapText');
        if (!elements) return;
        for (let e of elements) e.style.color = color;
    }
}

//this one exists in the scene, it is generated in order to print the color map
class ColorMapSprite{

    colorMapSprite;
    colorMapCanvas;
    topValueSprite;
    bottomValueSprite;
    topValueCanvas;
    bottomValueCanvas;

    constructor(_colorMapCanvas=colorMapCanvas, canvasLen=1000){
        this.colorMapCanvas = _colorMapCanvas;
        this.topValueCanvas = document.createElement('canvas');
        this.topValueCanvas.width = canvasLen;
        this.topValueCanvas.height = canvasLen;
        this.bottomValueCanvas = document.createElement('canvas');
        this.bottomValueCanvas.width = canvasLen;
        this.bottomValueCanvas.height = canvasLen;
    }
    draw(scene=uiScene){
        const spriteMaterial = new THREE.SpriteMaterial( {
            map: new THREE.CanvasTexture(this.colorMapCanvas.lut.createCanvas()),
            visible: true
        });

        this.colorMapSprite = new THREE.Sprite(spriteMaterial);
        this.colorMapSprite.scale.x = 0.075;
        scene.add(this.colorMapSprite);
        this.drawTopValueSprite(scene);
        this.drawBottomValueSprite(scene);
    }

    clear(){
        this.topValueSprite.material.map.image.getContext( '2d' ).clearRect(0,0,1000,1000);
        this.bottomValueSprite.material.map.image.getContext( '2d' ).clearRect(0,0,1000,1000);
        deleteMesh(this.topValueSprite, uiScene);
        deleteMesh(this.bottomValueSprite, uiScene);
        deleteMesh(this.colorMapSprite, uiScene);
    }

    drawTopValueSprite(scene){
        this.topValueSprite = ColorMapSprite.generateValueSprite(this.colorMapCanvas.getMaxV(), this.topValueCanvas);
        this.topValueSprite.position.y = .53;
        scene.add(this.topValueSprite);
    }

    drawBottomValueSprite(scene){
        this.bottomValueSprite = ColorMapSprite.generateValueSprite(this.colorMapCanvas.getMinV(), this.bottomValueCanvas);
        this.bottomValueSprite.position.y = -.6;
        scene.add(this.bottomValueSprite);
    }

    static generateValueSprite(number, canvas){
        const sprite = ColorMapSprite.createTextSprite(parseFloat(number).toFixed(2), canvas);
        ColorMapSprite.setSpriteScale(sprite);
        return sprite;
    }

    static createTextSprite(message, canvas){
        ColorMapSprite.updateTextCanvas(message, canvas);
        const amap = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial(
            {map: amap, visible: true}
        );
        const sprite = new THREE.Sprite(mat);
        return sprite;
    }

    static updateTextCanvas(message, canvas){
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'left';
        ctx.font = "500px Arial";
        ctx.fillStyle = document.getElementsByClassName('colorMapText')[0].style.color;
        ctx.fillText(message,10,500);
    }

    static setSpriteScale(sprite){
        sprite.scale.set(.085 * window.innerHeight / 789, .15 * window.innerWidth / 1440,1);
    }
}

export { ColorMapCanvas, ColorMapSprite }
