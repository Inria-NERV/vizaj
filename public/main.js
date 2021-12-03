import * as THREE from "three";
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls";
import { sensorMaterial } from "../js/draw_sensors.js";
import { GUI } from '../node_modules/three/examples/jsm/libs/dat.gui.module';
import "regenerator-runtime/runtime.js";

import { addLightAndBackground } from "../js/add_light_and_background";
import { loadAndDrawCortexModel } from "../js/draw_cortex.js";
import { loadAndDrawSensors, clearLoadAndDrawSensors } from '../js/draw_sensors.js';
import { loadAndDrawLinks, clearAllLinks } from "../js/link_builder/draw_links";
import { drawAllDegreeLines } from "../js/draw_degree_line";
import { setupCamera } from '../js/setup_camera';
import { setupGui, guiParams } from '../js/setup_gui';

const highlightedLinksPreviousMaterials = [];

let cortexVertUrl = require('../data/cortex_vert.csv');
let cortexTriUrl = require('../data/cortex_tri.csv');
let sensorLabelsUrl = require('../data/sensor_labels.csv');
let sensorCoordinatesUrl = require('../data/sensor_coordinates.csv');
let connectivityMatrixUrl = require('../data/conn_matrix_0.csv');

const GLOBAL_LAYER = 0,  LINK_LAYER = 1;

const centerPoint = new THREE.Vector3();

const cortexMaterial = new THREE.MeshStandardMaterial({
  color: 0xffc0cb,
  side: THREE.BackSide
});
const enlightenedSensorMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  reflectivity: 1
});

const linkMeshList = [];
const sensorMeshList = [];

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
  preserveDrawingBuffer: true
});
const camera = new THREE.PerspectiveCamera();
const controls = new OrbitControls(camera, renderer.domElement);
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const gui = new GUI();

document.body.appendChild(renderer.domElement);
const sensorNameDiv = document.getElementById("sensorName");
const csvConnMatrixInput = document.getElementById("csvConnMatrixInput");
const csvNodePositionsInput = document.getElementById("csvNodePositions");
const csvNodeLabelsInput = document.getElementById("csvNodeLabels");

//INTERSECTED is used to check wether the mouse intersects with a sensor
var INTERSECTED;

init();
animate();

function init() {
  THREE.Cache.enabled = true;
  setupGui();
  generateSceneElements();
  
  window.addEventListener("resize", onWindowResize);
  document.addEventListener("mousemove", onDocumentMouseMove);
  csvConnMatrixInput.addEventListener("change", handleConnectivityMatrixFileSelect, false);
  csvNodePositionsInput.addEventListener("change", handleMontageCoordinatesFileSelect, false);
  csvNodeLabelsInput.addEventListener("change", handleMontageLabelsFileSelect, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

}

async function generateSceneElements(){
  setupCamera();
  addLightAndBackground();
  loadAndDrawCortexModel();
  await loadAndDrawSensors(sensorCoordinatesUrl, sensorLabelsUrl);
  await loadAndDrawLinks(connectivityMatrixUrl);
  drawAllDegreeLines();
}

function onDocumentMouseMove(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  const padding = 15;
  sensorNameDiv.style.top = event.clientY + padding + "px";
  sensorNameDiv.style.left = event.clientX + padding + "px";
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  hoverDisplayUpdate();
  renderer.render(scene, camera);
}

function hoverDisplayUpdate() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length !== 0 && sensorMeshList.map(x=>x.mesh).includes(intersects[0].object)) {
    if (INTERSECTED != intersects[0].object) {
      emptyIntersected();
      INTERSECTED = intersects[0].object;
      fillIntersected();
    }
  }
  else{
    emptyIntersected();
  }
}

function emptyIntersected() {
  if (INTERSECTED) {
    INTERSECTED.material = sensorMaterial;
  }
  INTERSECTED = null;
  sensorNameDiv.innerHTML = "";
  while (highlightedLinksPreviousMaterials.length > 0) {
    const elem = highlightedLinksPreviousMaterials.shift();
    for (const linkMesh of linkMeshList.filter((linkMesh) => linkMesh.link.node1.name === elem.node1Name && linkMesh.link.node2.name === elem.node2Name))
    {
      linkMesh.mesh.material = elem.material;
    }
  }
}

function fillIntersected() {
  INTERSECTED.material = enlightenedSensorMaterial;
  sensorNameDiv.innerHTML = INTERSECTED.name;
  for (const linkMesh of linkMeshList){
    if (linkMesh.link.node1.name == INTERSECTED.name || linkMesh.link.node2.name == INTERSECTED.name)
    {
      highlightedLinksPreviousMaterials.push({
        node1Name: linkMesh.link.node1.name,
        node2Name: linkMesh.link.node2.name,
        material: linkMesh.mesh.material});
        //If volume, change to MeshPhysicalMaterial
      linkMesh.mesh.material = new THREE.LineBasicMaterial({
        color : new THREE.Color(1, 1, 1), 
        opacity: 1,
        transparent: false
      });
    }
  }
}

function getNewFileUrl(evt){
  if (evt.target.files.length === 0) { return; }
  const file = evt.target.files[0];
  return window.URL.createObjectURL(file);
}

function handleConnectivityMatrixFileSelect(evt) {
  const fileUrl = getNewFileUrl(evt);
  clearAllLinks();
  loadAndDrawLinks(fileUrl);
}

function handleMontageCoordinatesFileSelect(evt) {
  sensorCoordinatesUrl = getNewFileUrl(evt);
  guiParams.mneMontage = -1;
}

// coordinate is loaded, then labels. Then, we update the new node montage in the labelbutton event handler
function handleMontageLabelsFileSelect(evt) {
  sensorLabelsUrl = getNewFileUrl(evt);
  guiParams.mneMontage = -1;
  clearLoadAndDrawSensors(sensorCoordinatesUrl, sensorLabelsUrl);
}

export {
    scene,
    camera,
    controls,
    renderer,
    sensorMeshList,
    linkMeshList,
    gui,
    cortexVertUrl, 
    cortexTriUrl, 
    cortexMaterial,
    sensorMaterial,
    GLOBAL_LAYER,
    LINK_LAYER,
    centerPoint,
    csvConnMatrixInput,
    csvNodePositionsInput,
    csvNodeLabelsInput
};