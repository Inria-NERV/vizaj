import * as THREE from 'three';
import { scene, 
    sensorMeshList,
    centerPoint } from "../public/main.js";
import { loadData, parseCsv3dCoordinatesRow } from "./load_data.js";
import { clearAllLinks } from './link_builder/draw_links';
import { guiParams, defaultMontageCoordinates, defaultMontageLabels } from "./setup_gui";
import { deleteMesh } from "./mesh_helper";
import { Vector3 } from 'three';

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

async function loadAndDrawSensors(sensorCoordinatesUrl, sensorLabelsUrl) {  
    const data = await loadAllSensorData(sensorCoordinatesUrl, sensorLabelsUrl);
    await getCenterPoint(data[1]);
    await getMaxMeanSensorDistance(data[1]);
    await drawAllSensors(data[0], data[1]);
}

function loadAllSensorData(sensorCoordinatesUrl, sensorLabelsUrl) {
    return Promise.all([loadSensorLabels(sensorLabelsUrl), loadSensorCoordinates(sensorCoordinatesUrl)]);
}

function loadSensorCoordinates(sensorCoordinatesUrl) {
    return loadData(sensorCoordinatesUrl, 'sensor coordinates', parseCsv3dCoordinatesRow);
}

function loadSensorLabels(sensorLabelsUrl){
    return loadData(sensorLabelsUrl, 'sensor labels', (x) => x);
}

async function drawAllSensors(labelList, coordinatesList){
    for (let i = 0; i < labelList.length; i++) {
        await drawSensor(labelList[i], coordinatesList[i]);
      }
}

async function drawSensor(label, coordinates){
    const sensorGeometry = new THREE.SphereGeometry(SENSOR_RADIUS, SENSOR_SEGMENTS, SENSOR_RINGS);
    let sensor = new THREE.Mesh(
        sensorGeometry,
        sensorMaterial
    );
    sensor.castShadow = false;
    sensor.name = label;
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

function setCustomMontage(){
    guiParams.mneMontage == -1;

}

function setMneMontage(){
    if (guiParams.mneMontage == -1) {return;}
    const newSensorCoordinatesUrl = defaultMontageCoordinates[guiParams.mneMontage];
    const newSensorLabelsUrl = defaultMontageLabels[guiParams.mneMontage];
    clearAllSensors();
    clearAllLinks();
    loadAndDrawSensors(newSensorCoordinatesUrl, newSensorLabelsUrl);
}

export {
    sensorMaterial,
    loadAndDrawSensors, 
    sensorMeshList, 
    maxSensorDistance, 
    clearAllSensors,
    setCustomMontage,
    setMneMontage};
