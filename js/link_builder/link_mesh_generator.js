import * as THREE from "three";
import { guiParams } from '../setup_gui';

class linkMeshGenerator{
    
}

class linkLineGenerator extends linkMeshGenerator{
    static ARC_SEGMENTS = 48;

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

    static getGeometry(curvePath, link){
        //Here we have to divide by the number of curves to get ARC_SEGMENTS points into splinePoints
        const splinePoints = curvePath.getPoints((this.ARC_SEGMENTS-1)/curvePath.curves.length);
        return new THREE.BufferGeometry().setFromPoints( splinePoints );
    }
}

class linkVolumeGenerator extends linkMeshGenerator{
    static LINK_SEGMENTS = 48;
    static LINK_RADIAL_SEGMENTS = 20;

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
        const geometry = new THREE.TubeGeometry(
            curvePath,
            this.LINK_SEGMENTS,
            (1 - link.normDist) * guiParams.linkThickness,
            this.LINK_RADIAL_SEGMENTS,
            false
        );
        return geometry;
    }
}

export {
    linkLineGenerator,
    linkVolumeGenerator
}