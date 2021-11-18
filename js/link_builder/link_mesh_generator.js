import * as THREE from "three";
import { guiParams } from '../setup_gui';

const ARC_SEGMENTS = 48;

class linkMeshGenerator{
    
}

class linkLineGenerator extends linkMeshGenerator{
    static generateLink(curvePath, link){
        const geometry = this.getGeometry(curvePath, link);
        const linkMat = this.getMaterial(link.strength);
        const curveObject = new THREE.Line( geometry, linkMat );
        return curveObject;
    }

    static getMaterial(strength){
        return new THREE.LineBasicMaterial( { 
            color : new THREE.Color(strength, 0, 1-strength),
            linewidth: 0.001,
            opacity: strength,
            transparent: false 
        } );
    }

    static getGeometry(curvePath, link=None){
        const splinePoints = curvePath.getPoints((ARC_SEGMENTS-1)/curvePath.curves.length);
        return new THREE.BufferGeometry().setFromPoints( splinePoints );
    }
}

class linkVolumeGenerator extends linkMeshGenerator{
    static generateLink(curvePath, link){
        const geometry = this.getGeometry(curvePath, link);
        const linkMat = this.getMaterial(link.strength);
        const curveObject = new THREE.Mesh( geometry, linkMat );
        return curveObject;
    }

    static getMaterial(strength){
        return new THREE.MeshPhysicalMaterial({
            color : new THREE.Color(strength, 0, 1-strength), 
            opacity: strength,
            transparent: false
        });
    }

    static getGeometry(curvePath, link){
        const extrudeSettings = {
            steps: ARC_SEGMENTS,
            bevelEnabled: false,
            extrudePath: curvePath
        };
        const linkProfileShape = new THREE.Shape().absarc(0., 0., (1. - link.normDist) * guiParams.linkThickness, 0, Math.PI * 2, false);
        return new THREE.ExtrudeGeometry( linkProfileShape, extrudeSettings );
    }
}

export {
    linkLineGenerator,
    linkVolumeGenerator
}