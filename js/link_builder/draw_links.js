import * as THREE from "three";
import { sensorMeshList, scene, linkMeshList, LINK_LAYER} from '../../public/main';
import {updateAllDegreeLineLength } from "../draw_degree_line";
import { csvConnectivityMatrixCheckForError, loadData } from '../load_data';
import { guiControllers, guiParams } from '../setup_gui';
import { maxSensorDistance } from '../draw_sensors';
import { deleteMesh } from '../mesh_helper';
import { getSplinePoints } from './compute_link_shape';
import { ColorMapCanvas } from './color_map_sprite.js';

let colorMapCanvas;

async function loadAndDrawLinks(linksDataFileUrl){
    const rawData = await loadLinks(linksDataFileUrl);
    csvConnectivityMatrixCheckForError(rawData);
    const links = connectivityMatrixExtractData(rawData);
    clearAllLinks();
    await drawLinksAndUpdateVisibility(links);
    ecoFiltering();
}

async function loadLinks(linksDataFileUrl){
    return loadData(linksDataFileUrl, 'connectivity matrix');
}



function connectivityMatrixExtractData(data){
    const outList = [];
    const splittedData = data.filter(x => x !== null && x !== '');
    for (let i = 0; i < splittedData.length; i++){
        const row = splittedData[i];
        const splittedRow = row.split(',');
        for (let j = 0; j < i; j++){
            if (splittedRow[j] != 0 && splittedRow[j]){
                outList.push(generateLinkData(i, j, splittedRow[j]));
            }
        }
    }
    return outList;
}

function generateLinkData(i_node1, i_node2, strength){
    return {
        node1:sensorMeshList[i_node1].mesh,
        node2:sensorMeshList[i_node2].mesh,
        strength: parseFloat(strength),
        normDist: sensorMeshList[i_node1].mesh.position.distanceTo(sensorMeshList[i_node2].mesh.position) / maxSensorDistance
      }
}

async function drawLinksAndUpdateVisibility(linkList){
    drawLinks(linkList)
    .then(() => {linkMeshList.sort((x1, x2) => x2.link.strength - x1.link.strength)})
    .then(() => {
        updateVisibleLinks();
    });
    guiControllers.linkDensity.max(linkList.length / (sensorMeshList.length * (sensorMeshList.length - 1) / 2));
}

async function drawLinks(linkList){
    for (const link of linkList){
        const splinePoints = getSplinePoints(link);
        const curveObject = guiParams.linkGenerator.generateLink(splinePoints, link);
        curveObject.layers.set(LINK_LAYER);
        scene.add(curveObject);
        linkMeshList.push({link: link, mesh: curveObject});
    }
    const maxLinkStrength = Math.max.apply(Math, linkMeshList.map(linkMesh => linkMesh.link.strength));
    const minLinkStrength = Math.min.apply(Math, linkMeshList.map(linkMesh => linkMesh.link.strength));
    colorMapCanvas = new ColorMapCanvas(guiParams.linkColorMap, maxLinkStrength, minLinkStrength);
    updateAllLinkMaterial();
}

function updateLinkOutline(){
    for (let linkTuple of linkMeshList){
        const splinePoints = getSplinePoints(linkTuple.link);
        const curveGeometry = guiParams.linkGenerator.getGeometry(splinePoints, linkTuple.link);

        const position = linkTuple.mesh.geometry.attributes.position;
        const target = curveGeometry.attributes.position;
        for (let i = 0; i < target.count; i++){
            position.setXYZ(i, target.array[i*3], target.array[i*3+1], target.array[i*3+2]);
        }
        position.needsUpdate = true;
    }
    guiControllers.linkHeight.updateDisplay();
    guiControllers.linkTopPointHandleDistances.updateDisplay();
    guiControllers.linkSensorAngles.updateDisplay();
    guiControllers.linkSensorHandleDistances.updateDisplay();
}

function redrawLinks(){
    const linkListTemp = [];
    while (linkMeshList.length){
        const link = linkMeshList.pop();
        deleteMesh(link.mesh);
        linkListTemp.push(link.link);
    }
    drawLinksAndUpdateVisibility(linkListTemp);
    guiControllers.linkAlignmentTarget.updateDisplay();
    guiControllers.linkThickness.updateDisplay();
}

async function clearAllLinks() {
    while (linkMeshList.length){
        const link = linkMeshList.pop();
        deleteMesh(link.mesh);
    }
    if(colorMapCanvas){
        colorMapCanvas.clear();
    }
    guiControllers.linkDensity.max(0);
    guiParams.linkDensity = 0;
}

function updateVisibleLinks() {
    const fullyConnectedGraphLinkCount = sensorMeshList.length * (sensorMeshList.length - 1) / 2;
    if (guiParams.linkDensity > linkMeshList.length / fullyConnectedGraphLinkCount){
        guiParams.linkDensity = linkMeshList.length / fullyConnectedGraphLinkCount;
    }
    const maxVisibleLinkIndice = fullyConnectedGraphLinkCount * guiParams.linkDensity;
    for (const link of linkMeshList.slice(0, maxVisibleLinkIndice)){
        link.mesh.visible = true;
    }
    for (const link of linkMeshList.slice(maxVisibleLinkIndice, linkMeshList.length)){
        link.mesh.visible = false;
    }
    updateAllDegreeLineLength();
    guiControllers.linkDensity.updateDisplay();
}

function ecoFiltering(){
    // According to Eco filtering, one optimal way of filtering the links is to set node degree = 3
    // in other words : number of links = number of nodes * 3 / 2
    guiParams.linkDensity = 3 / 2 * sensorMeshList.length / linkMeshList.length;
    updateVisibleLinks();
}

function updateAllLinkMaterial(){
    colorMapCanvas.setColorMap(guiParams.linkColorMap );
    for (let linkTuple of linkMeshList){
        updateLinkMaterial(linkTuple);
    }
    guiControllers.linkOpacity.updateDisplay();
}

function updateLinkMaterial(linkTuple){
    const mesh = linkTuple.mesh;
    mesh.material.opacity = guiParams.linkOpacity;
    updateLinkColor(linkTuple);
}

function updateLinkColor(linkTuple){
    const color = colorMapCanvas.getColor(linkTuple.link.strength);
    linkTuple.mesh.material.color = color;
}

 export {
    clearAllLinks,
    generateLinkData,
    loadAndDrawLinks,
    colorMapCanvas,
    drawLinksAndUpdateVisibility,
    redrawLinks,
    updateLinkOutline,
    updateVisibleLinks,
    updateAllLinkMaterial,
    ecoFiltering}
     