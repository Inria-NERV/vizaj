import * as THREE from 'three';
import { Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { scene, transformControls, 
    cortexMeshUrl, GLOBAL_LAYER } from "../public/main.js";
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
    .then((response) => drawCortexModel(response));
    return;
}

async function loadCortexModel(){
    const loader = new GLTFLoader();
    let cortexGeometry;
    await new Promise((resolve, reject) =>
        loader.load(cortexMeshUrl,
            function ( gltf ) {
                const hemi0Mesh = gltf.scene.children[0].children[0];
                const hemi1Mesh = gltf.scene.children[0].children[1];
                cortexGeometry = BufferGeometryUtils.mergeBufferGeometries([hemi0Mesh.geometry, hemi1Mesh.geometry]);
                resolve();
            },
            function ( xhr ) {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            function ( error ) {
                console.log( error );
                reject();
            }
        )
    );
    return cortexGeometry;
}

function drawCortexModel(cortexGeometry){
    extraItemMesh = new THREE.Mesh( cortexGeometry, cortexMaterial );
    initExtraItem();
    scene.add( extraItemMesh );
}

function initExtraItem(){
    extraItemMesh.receiveShadow = true;
    extraItemMesh.castShadow = true;
    resetPositionExtraItemMesh( );
}

function drawExtraItemModel(geometry){
    removeExtraItemMesh();
    extraItemMesh = new THREE.Mesh( geometry, cortexMaterial );
    initExtraItem();
    scene.add(extraItemMesh);
}

function drawExtraItemSphereModel(){
    const geometry = new THREE.SphereGeometry( 32, 32, 16 );
    drawExtraItemModel(geometry);
}

function drawExtraItemCubeModel(){
    const geometry = new THREE.BoxGeometry( 40, 40, 40 );
    drawExtraItemModel(geometry);
}

function resetPositionExtraItemMesh(){
    extraItemPosition = new Vector3(0,-17,0);
    extraItemRotation = new Vector3(0,0,0);
    extraItemScale = new Vector3(1,1,1);
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