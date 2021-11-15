import * as THREE from "three";
import { sensorMeshList } from './draw_sensors';
import { scene, linkMeshList, LINK_LAYER} from '../public/main';
import { loadData } from './load_data';
import { guiParams } from './setup_gui';
import { maxSensorDistance } from './draw_sensors';



function loadAndDrawLinks(linksDataFileUrl){
    loadLinks(linksDataFileUrl)
    .then((response) => drawLinksAndUpdateVisibility(response));
}

async function loadLinks(linksDataFileUrl){
    return loadData(linksDataFileUrl, 'connectivity matrix', (x)=>x, connectivityMatrixOnLoadCallBack);
}

function connectivityMatrixOnLoadCallBack(data){
    const outList = [];
    const splittedData = data.split('\n').filter((d) => d !== '');
    for (let i = 0; i < splittedData.length; i++){
        const row = splittedData[i];
        const splittedRow = row.split(',');
        for (let j = 0; j < i; j++){
            outList.push({
                node1:sensorMeshList[i],
                node2:sensorMeshList[j],
                strength: parseFloat(splittedRow[j]),
                normDist: sensorMeshList[i].position.distanceTo(sensorMeshList[j].position) / maxSensorDistance
            });
        }
    }
    return outList;
}

async function drawLinksAndUpdateVisibility(linkList){
    drawLinks(linkList)
    .then(() => {linkMeshList.sort((x1, x2) => x2.link.strength - x1.link.strength)})
    .then(() => updateVisibleLinks(guiParams.minStrengthToDisplay, guiParams.maxStrengthToDisplay));
}

async function drawLinks(linkList){
    const L = maxSensorDistance * .5;
    for (const link of linkList){
        const splinePoints = guiParams.getSplinePoints(link, L);
        //Change here the generate link method to get volume, or just a line
        const curveObject = guiParams.generateLinkMesh(splinePoints, link);
        curveObject.layers.set(LINK_LAYER);
        scene.add(curveObject);
        linkMeshList.push({link: link, mesh: curveObject});
    }
}


function generateLinkLineMesh(curvePath, link){
    const splinePoints = curvePath.getPoints(24);
    const geometry = new THREE.BufferGeometry().setFromPoints( splinePoints );
    const linkMat = new THREE.LineBasicMaterial( { 
        color : new THREE.Color(link.strength, 0, 1-link.strength), 
        opacity: link.strength,
    transparent: true } );
    const curveObject = new THREE.Line( geometry, linkMat );
    return curveObject;
}

function generateLinkVolumeMesh(curvePath, link){
    const linkMat = new THREE.MeshPhysicalMaterial({
        color : new THREE.Color(link.strength, 0, 1-link.strength), 
        opacity: link.strength,
        transparent: true
    });
    const linkProfileShape = new THREE.Shape().absarc(0., 0., (1. - link.normDist) * guiParams.linkThickness, 0, Math.PI * 2, false);
    const extrudeSettings = {
        steps: 24,
        bevelEnabled: false,
        extrudePath: curvePath
    };
    const geometry = new THREE.ExtrudeGeometry( linkProfileShape, extrudeSettings );
    const curveObject = new THREE.Mesh( geometry, linkMat );
    return curveObject;
}

function redrawLinks(){
    const linkListTemp = [];
    while (linkMeshList.length){
        const link = linkMeshList.pop();
        deleteMesh(link.mesh);
        linkListTemp.push(link.link);
    }
    drawLinksAndUpdateVisibility(linkListTemp);
}

function clearAllLinks() {
    while (linkMeshList.length){
        const link = linkMeshList.pop();
        deleteMesh(link.mesh);
    }
}

function deleteMesh(mesh){
    disposeMesh(mesh);
    scene.remove(mesh);
}


function disposeMesh(mesh){
    mesh.geometry.dispose();
    mesh.material.dispose();
}

//TODO: adapt to remove only links and nodes
function clearAll(){
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }
}

function updateVisibleLinks(minStrength, maxStrength) {
    const minVisibleLinkIndice = (linkMeshList.length) * minStrength;
    const maxVisibleLinkIndice = (linkMeshList.length) * maxStrength;
    for (const link of linkMeshList.slice(0, minVisibleLinkIndice))
    {
        link.mesh.visible = false;
    }
    for (const link of linkMeshList.slice(minVisibleLinkIndice, maxVisibleLinkIndice))
    {
        link.mesh.visible = true;
    }
    for (const link of linkMeshList.slice(maxVisibleLinkIndice, linkMeshList.length))
    {
        link.mesh.visible = false;
    }
}

 export {
    clearAllLinks as clearLinks,
    clearAll,
    deleteMesh,
    loadAndDrawLinks,
    generateLinkLineMesh,
    generateLinkVolumeMesh,
    redrawLinks,
    updateVisibleLinks}
     