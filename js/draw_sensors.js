import * as THREE from 'three';
import { scene, sensorLabelsUrl, sensorCoordinatesUrl, sensorMaterial,
    SENSOR_RADIUS, SENSOR_RINGS, SENSOR_SEGMENTS } from "../public/main.js";
import { loadData, parseCsv3dCoordinatesRow } from "./load_data.js";

const sensorMeshList = [];
let maxSensorDistance = 0.;

export function loadAndDrawSensors()
{   
    loadAllSensorData()
    .then((response) => {
        drawAllSensors(response[0], response[1]);
        getMaxSensorDistance(response[1]);
    });
}

function loadAllSensorData()
{
    return Promise.all([loadSensorLabels(), loadSensorCoordinates()]);
}

async function loadSensorCoordinates() {
    return loadData(sensorCoordinatesUrl, 'sensor coordinates', parseCsv3dCoordinatesRow);
}

async function loadSensorLabels(){
    return loadData(sensorLabelsUrl, 'sensor labels', (x) => x);
}

function drawAllSensors(labelList, coordinatesList)
{
    for (let i = 0; i < labelList.length; i++) {
        drawSensor(labelList[i], coordinatesList[i]);
      }
}

function drawSensor(label, coordinates){
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
      sensorMeshList.push(sensor);
}

function getMaxSensorDistance(positions)
{
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

export {sensorMeshList, maxSensorDistance};