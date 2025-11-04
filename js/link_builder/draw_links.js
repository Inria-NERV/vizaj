import * as THREE from "three";
import { sensorMeshList, scene, linkMeshList, LINK_LAYER} from '../../public/main';
import {updateAllDegreeLineLength } from "../draw_degree_line";
import { csvConnectivityMatrixCheckForError,  loadData } from '../load_data';
import { guiControllers, guiParams } from '../setup_gui';
import { maxSensorDistance } from '../draw_sensors';
import { deleteMesh } from '../mesh_helper';
import { getSplinePoints } from './compute_link_shape';
import { ColorMapCanvas } from './color_map_sprite.js';

let colorMapCanvas;

async function loadAndDrawLinksFromUrl(url) {
    const links = await loadLinks(url);
    await loadAndDrawLinks(links);
}

async function loadAndDrawLinks(data, keepLinkDensity = false) {
    const matrix = formatCsvMatrix(data);

    csvConnectivityMatrixCheckForError(matrix);
    const links = connectivityMatrixExtractData(matrix);

    // If keepLinkDensity is true, we want to keep the previous link density, not compute a new one
    const linkDensity = keepLinkDensity ? guiParams.linkDensity : null;
    await clearAllLinks();
    await drawLinksAndUpdateVisibility(links);
    ecoFiltering(linkDensity);
}

function formatCsvMatrix(data) {
    return data.reduce((acc, row) => row ? [...acc, row.split(',')] : acc, []);
}

async function loadLinks(linksDataFileUrl){
    return loadData(linksDataFileUrl, 'connectivity matrix');
}

function connectivityMatrixExtractData(matrix) {
    const outList = [];
    matrix.forEach((row, i) => {
        row.forEach((value, j) => {
            if (i > j && value != 0 && value) {
                outList.push(generateLinkData(i, j, value));
            }
        });
    });
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
        if (link.node1.position.distanceTo(link.node2.position) == 0){
            console.log("Ignored link between nodes " + link.node1.id + " and " + link.node2.id +" : nodes are superimposed.");
            continue
        }
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

function ecoFiltering(density = null){
    // According to Eco filtering, one optimal way of filtering the links is to set node degree = 3
    // in other words : number of links = number of nodes * 3 / 2
    const optimalDensity = 3 / 2 * sensorMeshList.length / linkMeshList.length;
    guiParams.linkDensity = density || optimalDensity;
    updateVisibleLinks();
}

function updateAllLinkMaterial(minStrength = null, maxStrength = null){
    colorMapCanvas.setColorMap(guiParams.linkColorMap);
    for (let linkTuple of linkMeshList){
        updateLinkMaterial(linkTuple, minStrength, maxStrength);
    }
    guiControllers.linkOpacity.updateDisplay();
}

function updateLinkMaterial(linkTuple, minStrength = null, maxStrength = null){
    const mesh = linkTuple.mesh;
    mesh.material.opacity = guiParams.linkOpacity;
    updateLinkColor(linkTuple, minStrength, maxStrength);
}

function updateLinkColor(linkTuple, minStrength = null, maxStrength = null) {
    const strength = linkTuple.link.strength;
    let color;
    if (minStrength !== null && maxStrength !== null) {
        // Normalize the link strength to the range [0, 1]
        const normalizedStrength = (strength - minStrength) / (maxStrength - minStrength);
        color = colorMapCanvas.getColor(normalizedStrength);
    } else {
        color = colorMapCanvas.getColor(strength);
    }
    linkTuple.mesh.material.color = color;
}

function rescaleColors() {
    // Only consider visible links for scaling
    const visibleLinks = linkMeshList.filter(link => link.mesh.visible);
    const strengths = visibleLinks.map(link => link.link.strength);
    const minStrength = strengths.length ? Math.min(...strengths) : Infinity;
    const maxStrength = strengths.length ? Math.max(...strengths) : -Infinity;
    updateAllLinkMaterial(minStrength, maxStrength);

    // Update the color map texts with new min and max values
    const colorMapTexts = document.querySelectorAll('.colorMapText');
    if (colorMapTexts.length >= 2) {
        colorMapTexts[0].innerHTML = maxStrength.toFixed(2);
        colorMapTexts[1].innerHTML = minStrength.toFixed(2);
    }
}


 export {
    clearAllLinks,
    generateLinkData,
    loadAndDrawLinks,
    loadAndDrawLinksFromUrl,
    colorMapCanvas,
    drawLinksAndUpdateVisibility,
    redrawLinks,
    rescaleColors,
    updateLinkOutline,
    updateVisibleLinks,
    updateAllLinkMaterial,
    updateLinkMaterial,
    ecoFiltering
 };
