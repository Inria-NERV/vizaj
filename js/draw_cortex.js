import * as THREE from 'three';
import { cortexTriOnLoadCallback, csv3dCoordinatesOnLoadCallBack, loadData } from './load_data.js';
import { scene, cortexVertUrl, cortexTriUrl, cortexMaterial, GLOBAL_LAYER } from "../public/main.js";
import { guiParams } from './setup_gui';

let brainMesh;

function loadAndDrawCortexModel(){   
    loadCortexModel()
    .then((response) => makeVertCoordsList(response[0], response[1]))
    .then((response) => drawCortexModel(response));
    return;
}

function loadCortexModel(){
    return Promise.all([loadCortexVert(), loadCortexTri()]);
}
function loadCortexVert(){
    return loadData(cortexVertUrl, 'cortex vertices', csv3dCoordinatesOnLoadCallBack);
}
function loadCortexTri(){
    return loadData(cortexTriUrl, 'cortex faces', cortexTriOnLoadCallback);
}

async function makeVertCoordsList(cortexVert, cortexTri){
    const positions = [];
    for (let coords of cortexTri){
        Array.prototype.push.apply(positions, cortexVert[coords[0]]);
        Array.prototype.push.apply(positions, cortexVert[coords[1]]);
        Array.prototype.push.apply(positions, cortexVert[coords[2]]);
    }
    return new Float32Array(positions);
}

function drawCortexModel(vertices){
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute( vertices, 3 ));
    geometry.computeVertexNormals();
    brainMesh = new THREE.Mesh( geometry, cortexMaterial );
    brainMesh.receiveShadow = true;
    brainMesh.castShadow = true;
    repositionBrainMesh( brainMesh );
    brainMesh.name = 'cortex';
    // const box = new THREE.BoxHelper( brainMesh, 0xffff00 );
    // scene.add( box );
    scene.add( brainMesh );
}

function repositionBrainMesh(brainMesh){
    brainMesh.rotateY(Math.PI);
    brainMesh.translateY(-13);
    brainMesh.translateX(-15);
    const scale = .8;
    brainMesh.scale.set(scale,scale,scale);
}

function updateBrainMeshVisibility(){
    brainMesh.visible = guiParams.showBrain;
    brainMesh.layers.toggle(GLOBAL_LAYER);
}

function hideBrain(){
    guiParams.showBrain = false;
    updateBrainMeshVisibility();
}

function showBrain(){
    guiParams.showBrain = true;
    updateBrainMeshVisibility();
}

export {
    loadAndDrawCortexModel,
    updateBrainMeshVisibility,
    hideBrain,
    showBrain
};