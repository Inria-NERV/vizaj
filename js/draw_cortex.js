
import * as THREE from 'three';
import { loadData, parseCsv3dCoordinatesRow } from './load_data.js';
import { scene, cortexVertUrl, cortexTriUrl, cortexMaterial, GLOBAL_LAYER } from "../public/main.js";
import { guiParams } from './setup_gui';

let brainMesh;

export function loadAndDrawCortexModel()
{   
    loadCortexModel()
    .then((response) => makeVertCoordsList(response[0], response[1]))
    .then((response) => drawCortexModel(response));
    return;
}

function loadCortexModel(){
    return Promise.all([loadCortexVert(), loadCortexTri()]);
}

function parseRowCortexTri(row) {
    const splitted_row = row.split(",");
    return [parseInt(splitted_row[0]-1), parseInt(splitted_row[1]-1), parseInt(splitted_row[2]-1)];
}
function loadCortexVert(){
    return loadData(cortexVertUrl, 'cortex vertices', parseCsv3dCoordinatesRow);
}
function loadCortexTri(){
    return loadData(cortexTriUrl, 'cortex faces', parseRowCortexTri);
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
    //geometry.setFromPoints(vertices);
    geometry.computeVertexNormals();
    brainMesh = new THREE.Mesh( geometry, cortexMaterial );
    brainMesh.receiveShadow = true;
    brainMesh.castShadow = true;
    brainMesh.translateY(50);
    brainMesh.name = 'cortex';
    scene.add( brainMesh );
}

function updateBrainMeshVisibility()
{
    brainMesh.visible = guiParams.showBrain;
    brainMesh.layers.toggle(GLOBAL_LAYER);
}

export {
    updateBrainMeshVisibility
};