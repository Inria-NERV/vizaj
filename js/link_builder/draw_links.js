import * as THREE from "three";
import { sensorMeshList, scene, uiScene, linkMeshList, LINK_LAYER} from '../../public/main';
import {updateAllDegreeLineLength } from "../draw_degree_line";
import { loadData } from '../load_data';
import { guiParams } from '../setup_gui';
import { maxSensorDistance } from '../draw_sensors';
import { deleteMesh } from '../mesh_helper';
import { getSplinePoints } from './compute_link_shape';
import { spriteLut } from './color_map.js';

const lut = new spriteLut();

async function loadAndDrawLinks(linksDataFileUrl){
    const links = await loadLinks(linksDataFileUrl);
    await drawLinksAndUpdateVisibility(links);
}

async function loadLinks(linksDataFileUrl){
    return loadData(linksDataFileUrl, 'connectivity matrix', connectivityMatrixOnLoadCallBack);
}

function connectivityMatrixOnLoadCallBack(data){
    const outList = [];
    const splittedData = data.split('\n').filter(x => x !== null && x !== '');
    for (let i = 0; i < splittedData.length; i++){
        const row = splittedData[i];
        const splittedRow = row.split(',');
        for (let j = 0; j < i; j++){
            outList.push(generateLinkData(i, j, splittedRow[j]));
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
    .then(() => updateVisibleLinks());
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
    lut.setColorMap( guiParams.linkColorMap );
    lut.setMax(maxLinkStrength);
    lut.setMin(minLinkStrength);
    generateLinkColorMapSprite();
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

async function clearAllLinks() {
    while (linkMeshList.length){
        const link = linkMeshList.pop();
        deleteMesh(link.mesh);
    }
    lut.clear();
}

function updateVisibleLinks() {
    const fullyConnectedGraphLinkCount = sensorMeshList.length * (sensorMeshList.length - 1) / 2;
    if (guiParams.maxStrengthToDisplay > linkMeshList.length / fullyConnectedGraphLinkCount){
        guiParams.maxStrengthToDisplay = linkMeshList.length / fullyConnectedGraphLinkCount;
    }
    const maxVisibleLinkIndice = fullyConnectedGraphLinkCount * guiParams.maxStrengthToDisplay;
    for (const link of linkMeshList.slice(0, maxVisibleLinkIndice)){
        link.mesh.visible = true;
    }
    for (const link of linkMeshList.slice(maxVisibleLinkIndice, linkMeshList.length)){
        link.mesh.visible = false;
    }
    updateAllDegreeLineLength();
}

function updateAllLinkMaterial(){
    lut.setColorMap( guiParams.linkColorMap );
    lut.updateColorMapSprite();
    for (let linkTuple of linkMeshList){
        updateLinkMaterial(linkTuple);
    }
}

function updateLinkMaterial(linkTuple){
    const mesh = linkTuple.mesh;
    mesh.material.opacity = guiParams.linkOpacity;
    updateLinkColor(linkTuple);
}

function updateLinkColor(linkTuple){
    const color = lut.getColor(linkTuple.link.strength);
    linkTuple.mesh.material.color = color;
}

function generateLinkColorMapSprite(){
    lut.drawColorMapSprite(uiScene);
}

 export {
    clearAllLinks,
    generateLinkData,
    loadAndDrawLinks,
    lut,
    drawLinksAndUpdateVisibility,
    redrawLinks,
    updateLinkOutline,
    updateVisibleLinks,
    updateAllLinkMaterial}
     