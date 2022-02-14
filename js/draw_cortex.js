import * as THREE from 'three';
import { cortexTriOnLoadCallback, csv3dCoordinatesOnLoadCallBack, loadData } from './load_data.js';
import { scene, transformControls, cortexVertUrl, cortexTriUrl, GLOBAL_LAYER } from "../public/main.js";
import { guiParams } from './setup_gui';

let brainMesh;
let orbitControlsEnabled = false;

const cortexMaterial = new THREE.MeshStandardMaterial({
    color: '#ffc0cb',
    side: THREE.BackSide
  });

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
    scene.add( brainMesh );
}

function repositionBrainMesh(){
    brainMesh.rotation.set(0,Math.PI,0);
    brainMesh.position.set(2,-13,0);
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

function updateExtraItemMaterial(){
    if (brainMesh){
        brainMesh.material.color = new THREE.Color(guiParams.colorExtraItem);
    }
}

function toggleTransformControls(mode){
    if (!brainMesh){return;}
    if (!orbitControlsEnabled){
        transformControls.attach( brainMesh );
        orbitControlsEnabled = true;
    }
    else if (orbitControlsEnabled && transformControls.mode == mode){
        transformControls.detach( brainMesh );
        orbitControlsEnabled = false;
    }
    transformControls.setMode(mode);
}

function translateModeTransformControls(){
    toggleTransformControls('translate');
}
function rotateModeTransformControls(){
    toggleTransformControls('rotate');
}
function scaleModeTransformControls(){
    toggleTransformControls('scale');
}

export {
    loadAndDrawCortexModel,
    updateBrainMeshVisibility,
    hideBrain,
    showBrain,
    updateExtraItemMaterial,
    translateModeTransformControls,
    rotateModeTransformControls,
    scaleModeTransformControls,
    repositionBrainMesh
};