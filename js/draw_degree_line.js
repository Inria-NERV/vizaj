import * as THREE from 'three';
import { Float32BufferAttribute } from 'three';
import { scene, linkMeshList, LINK_LAYER } from '../public/main';
import { sensorMeshList } from './draw_sensors';
import { updateVisibleLinks } from './link_builder/draw_links';
import { guiParams } from './setup_gui';

const degreeLineMaterial = new THREE.MeshBasicMaterial( 
    { color: 0x9999ff, 
        opacity: .6, 
        transparent: true } );

const DEGREE_LINE_UNIT_MAX_SCALE = 200;

const DEGREE_LINE_TUBULAR_SEGMENTS = 2;
const DEGREE_LINE_RADIUS = 1.3;
const DEGREE_LINE_RADIAL_SEGMENTS = 8;

function drawDegreeLine(sensor){
    const sensorMesh = sensor.mesh;

    const unitVector = sensorMesh.position.clone().normalize();
    const endPoint = sensorMesh.position.clone().addScaledVector(unitVector, DEGREE_LINE_UNIT_MAX_SCALE );
    const flatEndPoint = sensorMesh.position.clone().addScaledVector(unitVector, .01);

    const curve = new THREE.LineCurve(sensorMesh.position, endPoint);
    const flatCurve = new THREE.LineCurve(sensorMesh.position, flatEndPoint);

    const geometry = new THREE.TubeGeometry(
        curve,
        DEGREE_LINE_TUBULAR_SEGMENTS,
        DEGREE_LINE_RADIUS,
        DEGREE_LINE_RADIAL_SEGMENTS,
        true
    );

    const flatGeometry = new THREE.TubeGeometry(
        flatCurve,
        DEGREE_LINE_TUBULAR_SEGMENTS,
        DEGREE_LINE_RADIUS,
        DEGREE_LINE_RADIAL_SEGMENTS,
        true
    );

    geometry.morphAttributes.position = [];
    geometry.morphAttributes.position[0] = new Float32BufferAttribute(
        flatGeometry.attributes.position.array,
        3);

    const line = new THREE.Mesh(geometry, degreeLineMaterial);
    line.morphTargetInfluences = [];
    
    line.layers.set(LINK_LAYER);

    scene.add(line);

    sensor.degreeLine = line;
    updateNodeDegreeLine(sensor);

    return sensor;
}

function drawAllDegreeLines(){
    for (let i = 0; i < sensorMeshList.length; i++){
        sensorMeshList[i] = drawDegreeLine(sensorMeshList[i]);
    }
}

function getNodeDegree(sensorMesh){
    let nodeDegree = 0;
    for (const linkMesh of linkMeshList.filter(linkMesh=>linkMesh.mesh.visible === true)){
        const link = linkMesh.link;
        if (link.node1.name == sensorMesh.name 
            || link.node2.name == sensorMesh.name){
                nodeDegree++;
            }
    }
    return nodeDegree;
}

function updateNodeDegreeLine(sensor){
    const sensorCount = sensorMeshList.length;
    const nodeDegree = getNodeDegree(sensor.mesh);
    sensor.degreeLine.morphTargetInfluences[0] = (1 - nodeDegree / (sensorCount - 1));
}

function updateAllDegreeLines(){
    for (let sensor of sensorMeshList){
        if (sensor.mesh && sensor.degreeLine){
            updateNodeDegreeLine(sensor);
        }
    }
    guiParams.averageDegree = computeAverageDegree();
}

function computeAverageDegree(){
    let nodeDegree = 0.;
    for (let sensor of sensorMeshList){
        nodeDegree += getNodeDegree(sensor.mesh);
    }
    return nodeDegree / (sensorMeshList.length - 1);
}

function updateDegreeLinesVisibility(){
    for (let sensor of sensorMeshList){
        sensor.degreeLine.visible = guiParams.showDegreeLines;
    }
}

function updateLinkVisibilityByLinkDegree(){
    let avgDegreeTemp = 0.;
    let i = 0;
    let sensorDegreeDict = {};
    for (let key of sensorMeshList.map(x => x.mesh.name)){
        sensorDegreeDict[key] = 0.;
    }
    while (avgDegreeTemp < guiParams.averageDegree && i < linkMeshList.length){
        //for some reason updating degree line manually using the gui works with computing 
        // this way rather than just calculating degree = link_count * 2 / sensor_count
        const link = linkMeshList[i].link;
        sensorDegreeDict[link.node1.name]++; 
        sensorDegreeDict[link.node2.name]++; 
        avgDegreeTemp = Object.values(sensorDegreeDict).reduce((a,b)=>a+b, 0.) / (sensorMeshList.length);
        i++;
    }
    guiParams.minStrengthToDisplay = 0.;
    guiParams.maxStrengthToDisplay = i/linkMeshList.length;
    updateVisibleLinks(guiParams.minStrengthToDisplay, guiParams.maxStrengthToDisplay);
}

export {
    drawDegreeLine,
    drawAllDegreeLines,
    updateAllDegreeLines,
    updateDegreeLinesVisibility,
    updateLinkVisibilityByLinkDegree
}