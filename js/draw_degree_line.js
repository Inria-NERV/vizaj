import * as THREE from 'three';
import { Float32BufferAttribute } from 'three';
import { scene, linkMeshList, LINK_LAYER } from '../public/main';
import { sensorMeshList } from './draw_sensors';
import { centerPoint } from './link_builder/compute_link_shape';
import { guiParams } from './setup_gui';
import { deleteMesh } from './mesh_helper';

let degreeLineMaterial;

const DEGREE_LINE_MAX_SCALE = 200;

const DEGREE_LINE_TUBULAR_SEGMENTS = 2;
const DEGREE_LINE_RADIUS = 1.3;
const DEGREE_LINE_RADIAL_SEGMENTS = 8;

function drawDegreeLine(sensor){
    const sensorMesh = sensor.mesh;

    const unitVector = sensorMesh.position.clone()
        .addScaledVector(centerPoint, -1).normalize();
    const endPoint = sensorMesh.position.clone()
        .addScaledVector(unitVector, 
            DEGREE_LINE_MAX_SCALE );
    const flatEndPoint = sensorMesh.position.clone().addScaledVector(unitVector, .001);

    const curve = new THREE.LineCurve(sensorMesh.position, endPoint);
    const flatCurve = new THREE.LineCurve(sensorMesh.position, flatEndPoint);

    const scaledRadius = 
        DEGREE_LINE_RADIUS 
        * 10 / Math.sqrt(sensorMeshList.length)
        * guiParams.degreeLineRadius;

    const geometry = new THREE.TubeGeometry(
        curve,
        DEGREE_LINE_TUBULAR_SEGMENTS,
        scaledRadius,
        DEGREE_LINE_RADIAL_SEGMENTS,
        true
    );

    const flatGeometry = new THREE.TubeGeometry(
        flatCurve,
        DEGREE_LINE_TUBULAR_SEGMENTS,
        scaledRadius,
        DEGREE_LINE_RADIAL_SEGMENTS,
        true
    );

    geometry.morphAttributes.position = [];
    geometry.morphAttributes.position[0] = new Float32BufferAttribute(
        flatGeometry.attributes.position.array,
        3);

    const line = new THREE.Mesh(geometry, degreeLineMaterial);
    line.morphTargetInfluences = [];

    line.visible = guiParams.de
    
    line.layers.set(LINK_LAYER);

    sensor.degreeLine = line;
    updateDegreeLineLength(sensor);
    updatDegreeLineMaterial(line);
    updateDegreeLineVisibility(line);

    scene.add(line);
    return sensor;
}

async function drawAllDegreeLines(){
    degreeLineMaterial = new THREE.MeshBasicMaterial( 
        { color: guiParams.degreeLineColor, 
            opacity: guiParams.degreeLineOpacity, 
            transparent: true } );
    for (let i = 0; i < sensorMeshList.length; i++){
        sensorMeshList[i] = drawDegreeLine(sensorMeshList[i]);
    }
}

function getNodeDegree(sensorMesh){
    let nodeDegree = 0;
    for (const linkMesh of linkMeshList.filter(linkMesh=>linkMesh.mesh.visible === true)){
        const link = linkMesh.link;
        if (link.node1 == sensorMesh
            || link.node2 == sensorMesh){
                nodeDegree++;
            }
    }
    return nodeDegree;
}

function updateDegreeLineLength(sensor){
    const nodeDegree = getNodeDegree(sensor.mesh);
    sensor.degreeLine.morphTargetInfluences[0] = 
        (1 - 
            nodeDegree / (sensorMeshList.length - 1)
            * guiParams.degreeLineLength);
}

function updateAllDegreeLineMaterial(){
    for (let sensor of sensorMeshList){
        updatDegreeLineMaterial(sensor.degreeLine);
    }
}

function updatDegreeLineMaterial(mesh){
    mesh.material.opacity = guiParams.degreeLineOpacity;
    mesh.material.color = new THREE.Color(guiParams.degreeLineColor);
}

function updateAllDegreeLineLength(){
    for (let sensor of sensorMeshList){
        if (sensor.mesh && sensor.degreeLine){
            updateDegreeLineLength(sensor);
        }
    }
}

function updateAllDegreeLineVisibility(){
    for (let sensor of sensorMeshList){
        updateDegreeLineVisibility(sensor.degreeLine);
    }
}

function updateDegreeLineVisibility(mesh){
    mesh.visible = guiParams.showDegreeLines;
}

function redrawDegreeLines(){
    for (let sensor of sensorMeshList){
        if (sensor.degreeLine){
            deleteMesh(sensor.degreeLine);
            sensor.degreeLine = null;
        }
    }
    drawAllDegreeLines();
}

export {
    drawDegreeLine,
    drawAllDegreeLines,
    updateAllDegreeLineLength,
    updateAllDegreeLineVisibility,
    redrawDegreeLines,
    updateAllDegreeLineMaterial
}