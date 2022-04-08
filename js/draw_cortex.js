import * as THREE from 'three';
import { Vector3 } from 'three';
import { cortexTriOnLoadCallback, csv3dCoordinatesOnLoadCallBack, loadData } from './load_data.js';
import { scene, transformControls, cortexVertUrl, cortexTriUrl, GLOBAL_LAYER } from "../public/main.js";
import { guiParams } from './setup_gui';
import { deleteMesh } from './mesh_helper.js';

let extraItemMesh;
let extraItemPosition = new Vector3(8,-13,0);
let extraItemRotation = new Vector3(0,Math.PI,0);
let extraItemScale = new Vector3(.8,.8,.8);
let transformControlsEnabled = false;

const cortexMaterial = new THREE.MeshStandardMaterial({
    color: '#ffc0cb',
    side: THREE.DoubleSide
  });

function loadAndDrawCortexModel(){  
    removeExtraItemMesh(); 
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
    extraItemMesh = new THREE.Mesh( geometry, cortexMaterial );
    initExtraItem();
    scene.add( extraItemMesh );
}

function initExtraItem(){
    extraItemMesh.receiveShadow = true;
    extraItemMesh.castShadow = true;
    repositionExtraItemMesh( extraItemMesh );
}

function drawExtraItemModel(geometry){
    removeExtraItemMesh();
    extraItemMesh = new THREE.Mesh( geometry, cortexMaterial );
    initExtraItem();
    scene.add(extraItemMesh);
}

function drawExtraItemSphereModel(){
    const geometry = new THREE.SphereGeometry( 40, 32, 16 );
    drawExtraItemModel(geometry);
}

function drawExtraItemCubeModel(){
    const geometry = new THREE.BoxGeometry( 50, 50, 50 );
    drawExtraItemModel(geometry);
}

function resetPositionExtraItemMesh(){
    extraItemPosition = new Vector3(8,-13,0);
    extraItemRotation = new Vector3(0,Math.PI,0);
    extraItemScale = new Vector3(.8,.8,.8);
    repositionExtraItemMesh();
}

function repositionExtraItemMesh(){
    extraItemMesh.rotation.set(extraItemRotation.x, extraItemRotation.y, extraItemRotation.z);
    extraItemMesh.position.set(extraItemPosition.x, extraItemPosition.y, extraItemPosition.z);
    extraItemMesh.scale.set(extraItemScale.x, extraItemScale.y, extraItemScale.z);
}

function updateExtraItemMeshVisibility(){
    extraItemMesh.visible = guiParams.showExtraItem;
    extraItemMesh.layers.toggle(GLOBAL_LAYER);
}

function hideExtraItem(){
    guiParams.showExtraItem = false;
    updateExtraItemMeshVisibility();
}

function showExtraItem(){
    guiParams.showExtraItem = true;
    updateExtraItemMeshVisibility();
}

function removeExtraItemMesh(){
    if (extraItemMesh){
        deleteMesh(extraItemMesh);
        extraItemMesh = null;
    }
}

function updateExtraItemMaterial(){
    if (extraItemMesh){
        extraItemMesh.material.color = new THREE.Color(guiParams.colorExtraItem);
    }
}

function updateExtraItemMesh(){
    extraItemPosition = extraItemMesh.position;
    extraItemRotation = extraItemMesh.rotation;
    extraItemScale = extraItemMesh.scale;
    showExtraItem();
    disableTransformControls();
    if (guiParams.extraItemMeshShape == 'brain'){
        loadAndDrawCortexModel();
    }
    if (guiParams.extraItemMeshShape == 'sphere'){
        drawExtraItemSphereModel();
    }
    if (guiParams.extraItemMeshShape == 'cube'){
        drawExtraItemCubeModel();
    }
}

function toggleTransformControls(mode){
    if (!extraItemMesh){return;}
    if (!transformControlsEnabled){
        transformControls.attach( extraItemMesh );
        transformControlsEnabled = true;
    }
    else if ( transformControls.mode == mode){
        disableTransformControls();
    }
    transformControls.setMode(mode);
}

function disableTransformControls(){
    if (transformControlsEnabled){
        transformControls.detach( extraItemMesh );
        transformControlsEnabled = false;
    }
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
    drawExtraItemSphereModel,
    updateExtraItemMeshVisibility as updateBrainMeshVisibility,
    hideExtraItem as hideBrain,
    showExtraItem as showBrain,
    updateExtraItemMaterial,
    updateExtraItemMesh,
    translateModeTransformControls,
    rotateModeTransformControls,
    scaleModeTransformControls,
    repositionExtraItemMesh as repositionBrainMesh,
    resetPositionExtraItemMesh
};