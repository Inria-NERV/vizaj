import * as THREE from 'three';
import { scene, 
    sensorMeshList,
    centerPoint } from "../public/main.js";
import { loadData, parseCsv3dCoordinatesRow } from "./load_data.js";
import { clearAllLinks } from './link_builder/draw_links';
import { guiParams, defaultMontageCoordinates, defaultMontageLabels } from "./setup_gui";
import { deleteMesh } from "./mesh_helper";

const SENSOR_RADIUS = 3;
const SENSOR_SEGMENTS = 20;
const SENSOR_RINGS = 50;

const CENTER_POINT_OFFSET_X = 0;
const CENTER_POINT_OFFSET_Y = 63;
const CENTER_POINT_OFFSET_Z = 0;

const SCALE_FACTOR = 100;

const sensorMaterial =  new THREE.MeshPhysicalMaterial({
    color: 0xaaaaaa,
    opacity: 1.,
    transparent: true,
    reflectivity: 1
  });

let maxSensorDistance = 0.;
let meanSensorDistance = 0.;

async function clearLoadAndDrawSensors(sensorCoordinatesUrl, sensorLabelsUrl){
    await clearAllLinks();
    await clearAllSensors();
    await loadAndDrawSensors(sensorCoordinatesUrl);
    await loadAndAssignSensorLabels(sensorLabelsUrl);
}

async function loadAndDrawSensors(sensorCoordinatesUrl) {  
    const data = await loadSensorCoordinates(sensorCoordinatesUrl);
    await getCenterPoint(data);
    await getMaxMeanSensorDistance(data);
    await drawAllSensors(data);
}

async function loadSensorCoordinates(sensorCoordinatesUrl) {
    return loadData(sensorCoordinatesUrl, 'sensor coordinates', parseCsv3dCoordinatesRow);
}

async function loadAndAssignSensorLabels(sensorLabelsUrl){
    console.log('coucou');
    const labelList = await loadSensorLabels(sensorLabelsUrl);
    assignSensorLabels(labelList);
}

function assignSensorLabels(labelList){
    for (let i = 0; i < labelList.length; i++){
        const label = labelList[i];
        console.log(label);
        sensorMeshList[i].mesh.name = label;
    }
}

function loadSensorLabels(sensorLabelsUrl){
    return loadData(sensorLabelsUrl, 'sensor labels', (x) => x);
}

async function drawAllSensors(coordinatesList){
    for (let coordinates of coordinatesList) {
        await drawSensor(coordinates);
      }
}

async function drawSensor(coordinates){
    const sensorGeometry = new THREE.SphereGeometry(SENSOR_RADIUS, SENSOR_SEGMENTS, SENSOR_RINGS);
    let sensor = new THREE.Mesh(
        sensorGeometry,
        sensorMaterial
    );
    let sensorCount = Object.keys(sensorMeshList).length;
    sensor.castShadow = false;
    sensor.name = sensorCount;
    sensor.position.x = (coordinates[0]) / meanSensorDistance * SCALE_FACTOR - centerPoint.x;
    sensor.position.y = (coordinates[1]) / meanSensorDistance * SCALE_FACTOR - centerPoint.y;
    sensor.position.z = (coordinates[2]) / meanSensorDistance * SCALE_FACTOR - centerPoint.z;
    scene.add(sensor);
    sensorMeshList.push({mesh: sensor});
}

async function getMaxMeanSensorDistance(positions){
    maxSensorDistance = 0.;
    meanSensorDistance = 0.;
    let count = 0;
    for (var i = 0; i < positions.length; i++) {
        for (var j = 0; j < i; j++) {
            const _dist = new THREE.Vector3(positions[i][0], positions[i][1], positions[i][2])
                .distanceTo(new THREE.Vector3(positions[j][0], positions[j][1], positions[j][2]))
            if (maxSensorDistance <= _dist) {
                maxSensorDistance = _dist;
            }
            count++;
            meanSensorDistance += _dist;
        }
    }
    meanSensorDistance = meanSensorDistance / count;
}

async function getCenterPoint(positions){
    let x = 0;
    let y = 0;
    let z = 0;
    for (let position of positions) {
        x += position[0];
        y += position[1];
        z += position[2];
    }
    centerPoint.set(
        x/positions.length - CENTER_POINT_OFFSET_X,
        y/positions.length - CENTER_POINT_OFFSET_Y,
        z/positions.length - CENTER_POINT_OFFSET_Z
    );
}

async function clearAllSensors(){
    while (sensorMeshList.length){
        const sensor = sensorMeshList.pop();
        deleteMesh(sensor.mesh);
        if (sensor.degreeLine){
            deleteMesh(sensor.degreeLine);
        }
    } 
}

function setMneMontage(){
    if (guiParams.mneMontage === -1) {return;}
    const newSensorCoordinatesUrl = defaultMontageCoordinates[guiParams.mneMontage];
    const newSensorLabelsUrl = defaultMontageLabels[guiParams.mneMontage];
    clearLoadAndDrawSensors(newSensorCoordinatesUrl, newSensorLabelsUrl);
}

export {
    sensorMaterial,
    loadAndDrawSensors, 
    loadAndAssignSensorLabels,
    clearLoadAndDrawSensors,
    sensorMeshList, 
    maxSensorDistance, 
    clearAllSensors,
    setMneMontage};
