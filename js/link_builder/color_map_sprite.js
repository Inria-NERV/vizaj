import * as THREE from "three";
import { deleteMesh } from "../mesh_helper";
import { Lut } from '../../node_modules/three/examples/jsm/math/Lut.js';
import { uiScene } from "../../public/main";

class ColorMapSprite {
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
    colorMapSprite;
    topValueCanvas;
    bottomValueCanvas;
    topValueSprite;
    bottomValueSprite;
    getMaxV() {return this.lut.maxV;}
    getMinV() {return this.lut.minV;}

    drawColorMapSprite(scene){
        const spriteMaterial = new THREE.SpriteMaterial( {
            map: new THREE.CanvasTexture(this.lut.createCanvas()),
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
        this.topValueSprite = ColorMapSprite.generateValueSprite(this.getMaxV(), this.topValueCanvas);
        this.topValueSprite.position.y = .53;
        scene.add(this.topValueSprite);
    }

    drawBottomValueSprite(scene){
        this.bottomValueSprite = ColorMapSprite.generateValueSprite(this.getMinV(), this.bottomValueCanvas);
        this.bottomValueSprite.position.y = -.6;
        scene.add(this.bottomValueSprite);
    }

    getColor(val){
        return this.lut.getColor(val);
    }

    setColorMap(linkColorMap){
        if (linkColorMap){
            this.lut.setColorMap( linkColorMap );
        }
        const map = this.colorMapSprite.material.map;
        this.lut.updateCanvas( map.image );
        map.needsUpdate = true;
    }

    updateSpriteValueScale(){
        if (this.topValueSprite){
            ColorMapSprite.setSpriteScale(this.topValueSprite);
        }
        if (this.bottomValueSprite){
            ColorMapSprite.setSpriteScale(this.bottomValueSprite);
        }
    }

    show(val=true){
        if (this.colorMapSprite){
            this.colorMapSprite.visible = val;
        }
        if (this.topValueSprite){
            this.topValueSprite.visible = val;
        }
        if (this.bottomValueSprite){
            this.bottomValueSprite.visible = val;
        }
    }

    static setSpriteScale(sprite){
        sprite.scale.set(.085 * window.innerHeight / 789, .15 * window.innerWidth / 1440,1);
    }

    static updateTextCanvas(message, canvas){
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'left';
        ctx.font = "500px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(message,10,500);
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


    static generateValueSprite(number, canvas){
        const sprite = ColorMapSprite.createTextSprite(parseFloat(number).toFixed(2), canvas);
        ColorMapSprite.setSpriteScale(sprite);
        return sprite;
    }
}

export { ColorMapSprite }
