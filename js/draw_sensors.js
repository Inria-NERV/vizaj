import * as THREE from 'three';
import { scene, 
    sensorMeshList,
    sensorMaterial,
    SENSOR_RADIUS, SENSOR_RINGS, SENSOR_SEGMENTS } from "../public/main.js";
import { loadData, parseCsv3dCoordinatesRow } from "./load_data.js";
import { guiParams } from "./setup_gui";
import { deleteMesh } from "./link_builder/draw_links";

let maxSensorDistance = 0.;

//TODO: add await to draw all sensors to ensure sensorMeshList is populated before being used
async function loadAndDrawSensors(sensorCoordinatesUrl, sensorLabelsUrl) {  
    const data = await loadAllSensorData(sensorCoordinatesUrl, sensorLabelsUrl);
    await drawAllSensors(data[0], data[1]);
    getMaxSensorDistance(data[1]);
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
    sensor.position.x = coordinates[0];
    sensor.position.y = coordinates[1];
    sensor.position.z = coordinates[2];
    scene.add(sensor);
    sensorMeshList.push({mesh: sensor});
}

function getMaxSensorDistance(positions){
    maxSensorDistance = 0.;
    for (var i = 0; i < positions.length; i++) {
        for (var j = 0; j < i; j++) {
            const _dist = new THREE.Vector3(positions[i][0], positions[i][1], positions[i][2])
                .distanceTo(new THREE.Vector3(positions[j][0], positions[j][1], positions[j][2]))
            if (maxSensorDistance <= _dist) {
                maxSensorDistance = _dist;
            }
        }
    }
}

function clearAllSensors(){
    while (sensorMeshList.length){
        const sensor = sensorMeshList.pop();
        deleteMesh(sensor.mesh);
    } 
}

export {
    loadAndDrawSensors, 
    sensorMeshList, 
    maxSensorDistance, 
    clearAllSensors};
