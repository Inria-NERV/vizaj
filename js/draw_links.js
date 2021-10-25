import * as THREE from "three";
import { sensorMeshList } from './draw_sensors';
import { scene, linkMeshList, LINK_LAYER} from '../public/main';
import { loadData } from './load_data';
import { guiParams } from './setup_gui';
import { maxSensorDistance } from './draw_sensors';
import { Matrix3, Vector3 } from "three";
import { link } from "fs";


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

function drawLinksAndUpdateVisibility(linkList)
{
    drawLinks(linkList)
    .then(() => {linkMeshList.sort((x1, x2) => x2.link.strength - x1.link.strength)})
    .then(() => updateVisibleLinks(guiParams.minStrengthToDisplay, guiParams.maxStrengthToDisplay));
}

async function drawLinks(linkList){
    const L = maxSensorDistance * .5;
    for (const link of linkList){
        const splinePoints = getSplinePoints(link, L);
        //Change here the generate link method to get volume, or just a line
        const curveObject = guiParams.generateLinkMesh(splinePoints, link);
        curveObject.layers.set(LINK_LAYER);
        scene.add(curveObject);
        linkMeshList.push({link: link, mesh: curveObject});
    }
}

function getSplinePoints(link, L){
    const linkToGlobalMatrix = getLinkToGlobalMatrix(link.node1.position, link.node2.position);
    const globalToLinkMatrix = linkToGlobalMatrix.clone().invert();
    const pointA = {controlPoint: link.node1.position};
    const pointB = {controlPoint: link.node2.position};
    const linkBasisA = pointA.controlPoint.clone().applyMatrix3(globalToLinkMatrix);
    const linkBasisB = pointB.controlPoint.clone().applyMatrix3(globalToLinkMatrix);
    const normalisedDistance = linkBasisA.distanceTo(linkBasisB) / maxSensorDistance;
    const l = new Vector3((linkBasisA.x + linkBasisB.x)/2, (linkBasisA.y + linkBasisB.y)/2, (linkBasisA.z + linkBasisB.z)/2).distanceTo(new Vector3(0,0,0));
    const pointC = computePointC(linkBasisA, linkBasisB, linkToGlobalMatrix, l, L, normalisedDistance);
    const quaternionA = new THREE.Quaternion();
    quaternionA.setFromAxisAngle( new Vector3(0,0,1), Math.PI * (1 - guiParams.linkSensorAngles ) );
    const quaternionB = new THREE.Quaternion();
    quaternionB.setFromAxisAngle( new Vector3(0,0,-1), Math.PI  * ( 1 - guiParams.linkSensorAngles ) );
    pointA.handleRight = new THREE.Vector3(linkBasisA.x * guiParams.linkSensorHandleDistances,0,0)
        .applyQuaternion( quaternionA )
        .add( linkBasisA )
        .applyMatrix3(linkToGlobalMatrix);
    pointB.handleLeft  = new THREE.Vector3(linkBasisB.x * guiParams.linkSensorHandleDistances,0,0)
        .applyQuaternion( quaternionB )
        .add( linkBasisB )
        .applyMatrix3(linkToGlobalMatrix);
    const splineLeft = new THREE.CubicBezierCurve3(pointA.controlPoint, pointA.handleRight, pointC.handleLeft, pointC.controlPoint);
    const splineRight = new THREE.CubicBezierCurve3(pointC.controlPoint, pointC.handleRight, pointB.handleLeft, pointB.controlPoint);
    const curvePath = new THREE.CurvePath();
    curvePath.add(splineLeft);
    curvePath.add(splineRight);
    return curvePath;
}

//This function is to get the rotation to be in the link plan
//It makes it easier to write 3d operations in such a plan
function getLinkToGlobalMatrix(A, B){
    const i = A.clone().addScaledVector( B, -1 ).normalize();
    const j = B.clone().add( A ).normalize();
    const k = i.clone().cross( j );

    const m = new Matrix3();
    m.set(i.x, j.x, k.x,
          i.y, j.y, k.y,
          i.z, j.z, k.z);
    return m;
}


function flattenDistanceProportion(normalisedDistance){
    if (normalisedDistance == 1 || normalisedDistance == 0) {return normalisedDistance;}
    const k = 2.3;
    return 1 / ( 1 + (normalisedDistance / ( 1 - normalisedDistance) ) ** ( -k ) );
}

function computePointC(linkBasisA, linkBasisB, linkToGlobalMatrix, l, L, flattenedNormalisedDistance){
    const controlPointC = new THREE.Vector3(
        0,
        linkBasisA.distanceTo(linkBasisB) * guiParams.linkHeight + l,//flattenedNormalisedDistance * L / 2 + l,
        0
    );
    const leftHandleRotation = new THREE.Quaternion();
    leftHandleRotation.setFromAxisAngle(new Vector3(0,0,+1), Math.PI * guiParams.linkTopPointAngle );
    const rightHandleRotation = new THREE.Quaternion();
    rightHandleRotation.setFromAxisAngle(new Vector3(0,0,-1), Math.PI * guiParams.linkTopPointAngle );
    return {controlPoint: controlPointC.clone().applyMatrix3(linkToGlobalMatrix),
        handleLeft: controlPointC.clone()
            .add( new Vector3(linkBasisA.x * guiParams.linkTopPointHandleDistances, 0, 0) )
            .applyQuaternion(leftHandleRotation)
            .applyMatrix3(linkToGlobalMatrix),
        handleRight: controlPointC.clone()
            .add( new Vector3(linkBasisB.x * guiParams.linkTopPointHandleDistances, 0, 0) )
            .applyQuaternion(rightHandleRotation)
            .applyMatrix3(linkToGlobalMatrix),
        controlPointLinkBasis: controlPointC
    };
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
    const linkProfileShape = new THREE.Shape().absarc(0., 0., 1. - link.normDist * guiParams.linkThickness, 0, Math.PI * 2, false);
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
        clearLink(link.mesh);
        linkListTemp.push(link.link);
    }
    drawLinksAndUpdateVisibility(linkListTemp);
}

function clearLinks() {
    while (linkMeshList.length){
        const link = linkMeshList.pop();
        clearLink(link.mesh);
    }
}

function clearLink(mesh){
    mesh.geometry.dispose();
    mesh.material.dispose();
    scene.remove(mesh);
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
    clearLinks,
    loadAndDrawLinks,
    generateLinkLineMesh,
    generateLinkVolumeMesh,
    redrawLinks,
    updateVisibleLinks}
     