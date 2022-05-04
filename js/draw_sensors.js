import * as THREE from 'three';
import { scene, 
    sensorMeshList,
    intersectedNodeList,
    emptyIntersected
 } from "../public/main.js";
import { csv3dCoordinatesOnLoadCallBack, csvMontageLoadingCheckForError, csvSensorLabelsCheckForError, loadData } from "./load_data.js";
import { clearAllLinks } from './link_builder/draw_links';
import { deleteMesh } from "./mesh_helper";
import { drawAllDegreeLines } from './draw_degree_line.js';
import { guiControllers, guiParams } from './setup_gui.js';

let sensorCount = 0;

const montageBarycenter = new THREE.Vector3();

export const SENSOR_RADIUS = 3.8;
const SENSOR_SEGMENTS = 20;
const SENSOR_RINGS = 50;

const MIN_RADIUS_SCALE = .1;
const MAX_RADIUS_SCALE = 4;

const SCALE_FACTOR = 100;

const sensorMaterial =  new THREE.MeshPhysicalMaterial({
    color: guiParams.sensorColor,
    opacity: guiParams.sensorOpacity,
    transparent: true,
    reflectivity: 1
  });

let maxSensorDistance = 0.;

async function clearLoadAndDrawSensors(sensorCoordinatesUrl, sensorLabelsUrl, fileName){
    const data = await loadSensorCoordinates(sensorCoordinatesUrl);  
    csvMontageLoadingCheckForError(data, fileName);
    await clearAllLinks();
    await clearAllSensors();
    await drawSensorsAndUpdateGlobalValues(data);
    if (sensorLabelsUrl){
        await loadAndAssignSensorLabels(sensorLabelsUrl);
    }
}

async function drawSensorsAndUpdateGlobalValues(data){
    await getMontageBarycenter(data);
    await drawAllSensors(data);
    await setMaxSensorDistance();
    await drawAllDegreeLines();
}

async function loadSensorCoordinates(sensorCoordinatesUrl) {
    const data = await loadData(sensorCoordinatesUrl, 'sensor coordinates', csv3dCoordinatesOnLoadCallBack);
    return data;
}

async function loadAndAssignSensorLabels(sensorLabelsUrl){
    const labelList = await loadSensorLabels(sensorLabelsUrl);
    csvSensorLabelsCheckForError(labelList);
    assignSensorLabels(labelList);
}

function assignSensorLabels(labelList){
    for (let i = 0; i < labelList.length; i++){
        const label = labelList[i];
        sensorMeshList[i].mesh.name = label;
    }
}

function loadSensorLabels(sensorLabelsUrl){
    return loadData(sensorLabelsUrl, 'sensor labels');
}

async function drawAllSensors(coordinatesList){
    const meanSensorDistance = await getMeanSensorDistance(coordinatesList);
    sensorCount = coordinatesList.length;
    for (let coordinates of coordinatesList) {
        await drawSensor(coordinates, meanSensorDistance);
      }
    guiParams.sensorRadiusFactor = Math.min(
        Math.max(8/Math.sqrt(sensorCount), MIN_RADIUS_SCALE), 
        MAX_RADIUS_SCALE);
    updateAllSensorRadius();
}

async function drawSensor(coordinates, meanSensorDistance){
    const dotGeometry = new THREE.SphereGeometry(
        0,
        SENSOR_SEGMENTS,
        SENSOR_RINGS
    );
    const sensorGeometry = new THREE.SphereGeometry(
        SENSOR_RADIUS, 
        SENSOR_SEGMENTS, 
        SENSOR_RINGS);
    dotGeometry.position = sensorGeometry.position;

    sensorGeometry.morphAttributes.position = [];
    sensorGeometry.morphAttributes.position[0] = new THREE.Float32BufferAttribute(
        dotGeometry.attributes.position.array,
        3);

    let sensor = new THREE.Mesh(
        sensorGeometry,
        sensorMaterial
    );
    sensor.position.x = (coordinates[0] - montageBarycenter.x) / meanSensorDistance * SCALE_FACTOR;
    sensor.position.y = (coordinates[1] - montageBarycenter.y) / meanSensorDistance * SCALE_FACTOR;
    sensor.position.z = (coordinates[2] - montageBarycenter.z) / meanSensorDistance * SCALE_FACTOR;
    sensor.castShadow = false;
    sensor.name = '';
    scene.add(sensor);
    sensorMeshList.push({mesh: sensor});
    return sensor;
}

async function setMaxSensorDistance(){
    maxSensorDistance = 0.;
    for (var i = 0; i < sensorMeshList.length; i++) {
        for (var j = 0; j < i; j++) {
            const _dist = sensorMeshList[i].mesh.position
                .distanceTo(sensorMeshList[j].mesh.position);
            if (maxSensorDistance <= _dist) {
                maxSensorDistance = _dist;
            }
        }
    }
}

async function getMeanSensorDistance(positions){
    let meanSensorDistance = 0.;
    let count = 0;
    for (var i = 0; i < positions.length; i++) {
        for (var j = 0; j < i; j++) {
            const _dist = new THREE.Vector3(positions[i][0], positions[i][1], positions[i][2])
                .distanceTo(new THREE.Vector3(positions[j][0], positions[j][1], positions[j][2]))
            count++;
            meanSensorDistance += _dist;
        }
    }
    return meanSensorDistance / count;
}

function updateAllSensorMaterial(){
    if(intersectedNodeList){
        emptyIntersected();
    }
    for (let sensor of sensorMeshList){
        if (sensor.mesh){
            updateSensorMaterial(sensor.mesh);
        }
    }
    if (guiParams.sensorOpacity == 0){
        showSensors(false);
    }
    else{
        showSensors();
    }
    guiControllers.sensorOpacity.updateDisplay();
}

function updateSensorMaterial(mesh){
    mesh.material.opacity = guiParams.sensorOpacity;
    mesh.material.color = new THREE.Color(guiParams.sensorColor);
}

function showSensors(show=true){
    for (let sensor of sensorMeshList){
        sensor.mesh.visible = show;
    }
}

function updateAllSensorRadius(){
    for (let sensor of sensorMeshList){
        if (sensor.mesh){
            updateSensorRadius(sensor.mesh);
        }
    }
    guiControllers.sensorRadius.updateDisplay();
}

function updateSensorRadius(mesh){
    mesh.morphTargetInfluences[0] = 1 - guiParams.sensorRadiusFactor;
}

async function getMontageBarycenter(positions){
    let x = 0;
    let y = 0;
    let z = 0;
    for (let position of positions) {
        x += position[0];
        y += position[1];
        z += position[2];
    }
    
    montageBarycenter.set(
        x/positions.length,
        y/positions.length,
        z/positions.length
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

export {
    sensorMaterial,
    drawSensorsAndUpdateGlobalValues,
    loadAndAssignSensorLabels,
    loadSensorCoordinates,
    clearLoadAndDrawSensors,
    assignSensorLabels,
    sensorMeshList, 
    sensorCount,
    maxSensorDistance, 
    clearAllSensors,
    updateAllSensorRadius,
    updateAllSensorMaterial };
