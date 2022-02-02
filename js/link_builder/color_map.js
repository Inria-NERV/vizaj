import * as THREE from "three";
import { deleteMesh } from "../mesh_helper";
import { Lut } from '../../node_modules/three/examples/jsm/math/Lut.js';
import { uiScene } from "../../public/main";


const canvasLen = 1000;

class spriteLut extends Lut {
    constructor( colormap, count = 32 ){
        super( colormap, count );
        this.topValueCanvas = document.createElement('canvas');
        this.topValueCanvas.width = canvasLen;
        this.topValueCanvas.height = canvasLen;
        this.bottomValueCanvas = document.createElement('canvas');
        this.bottomValueCanvas.width = canvasLen;
        this.bottomValueCanvas.height = canvasLen;
    }

    colorMapSprite;
    topValueCanvas;
    bottomValueCanvas;
    topValueSprite;
    bottomValueSprite;

    drawColorMapSprite(scene){
        const spriteMaterial = new THREE.SpriteMaterial( {
            map: new THREE.CanvasTexture(this.createCanvas()),
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

    updateColorMapSprite(){
        const map = this.colorMapSprite.material.map;
        this.updateCanvas( map.image );
        map.needsUpdate = true;
    }

    static generateValueSprite(number, canvas){
        const sprite = spriteLut.createTextSprite(parseFloat(number).toFixed(2), canvas);
        spriteLut.setSpriteScale(sprite);
        return sprite;
    }

    drawTopValueSprite(scene){
        this.topValueSprite = spriteLut.generateValueSprite(this.maxV, this.topValueCanvas);
        this.topValueSprite.position.y = .53;
        scene.add(this.topValueSprite);
    }

    drawBottomValueSprite(scene){
        this.bottomValueSprite = spriteLut.generateValueSprite(this.minV, this.bottomValueCanvas);
        this.bottomValueSprite.position.y = -.58;
        scene.add(this.bottomValueSprite);
    }

    static createTextSprite(message, canvas){
        spriteLut.updateTextCanvas(message, canvas);
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
        ctx.fillStyle = "white";
        ctx.fillText(message,10,500);
    }

    updateColorMapSprites(){
        if (this.topValueSprite){
            spriteLut.setSpriteScale(this.topValueSprite);
        }
        if (this.bottomValueSprite){
            spriteLut.setSpriteScale(this.bottomValueSprite);
        }
    }

    static setSpriteScale(sprite){
        sprite.scale.set(.085 * window.innerHeight / 789, .15 * window.innerWidth / 1440,1);
    }
}

export { spriteLut }
