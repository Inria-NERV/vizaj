import * as THREE from "three"
import { sensorMeshList, scene, linkMeshList, LINK_LAYER} from '../../public/main';
import { updateAllDegreeLines } from "../draw_degree_line";
import { loadData } from '../load_data';
import { guiParams } from '../setup_gui';
import { maxSensorDistance } from '../draw_sensors';


async function loadAndDrawLinks(linksDataFileUrl){
    const links = await loadLinks(linksDataFileUrl);
    await drawLinksAndUpdateVisibility(links);
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
                node1:sensorMeshList[i].mesh,
                node2:sensorMeshList[j].mesh,
                strength: parseFloat(splittedRow[j]),
                normDist: sensorMeshList[i].mesh.position.distanceTo(sensorMeshList[j].mesh.position) / maxSensorDistance
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
    for (const link of linkList){
        const splinePoints = guiParams.getSplinePoints(link);
        const curveObject = guiParams.linkGenerator.generateLink(splinePoints, link);
        curveObject.layers.set(LINK_LAYER);
        scene.add(curveObject);
        linkMeshList.push({link: link, mesh: curveObject});
    }
}

function updateLinkOutline(){
    for (let linkTuple of linkMeshList){
        const splinePoints = guiParams.getSplinePoints(linkTuple.link);
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

function updateVisibleLinks(minStrength, maxStrength) {
    const minVisibleLinkIndice = (linkMeshList.length) * minStrength;
    const maxVisibleLinkIndice = (linkMeshList.length) * maxStrength;
    for (const link of linkMeshList.slice(0, minVisibleLinkIndice)){
        link.mesh.visible = false;
    }
    for (const link of linkMeshList.slice(minVisibleLinkIndice, maxVisibleLinkIndice)){
        link.mesh.visible = true;
    }
    for (const link of linkMeshList.slice(maxVisibleLinkIndice, linkMeshList.length)){
        link.mesh.visible = false;
    }
    updateAllDegreeLines();
}

 export {
    clearAllLinks as clearLinks,
    deleteMesh,
    loadAndDrawLinks,
    redrawLinks,
    updateLinkOutline,
    updateVisibleLinks}
     