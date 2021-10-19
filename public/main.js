import * as THREE from "three";
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls";
import { GUI } from '../node_modules/three/examples/jsm/libs/dat.gui.module';
import "regenerator-runtime/runtime.js";

import { addLightAndBackground } from "../js/add_light_and_background";
import { loadAndDrawCortexModel } from "../js/draw_cortex.js";
import { loadAndDrawSensors, sensorMeshList } from '../js/draw_sensors.js';
import { loadAndDrawLinks, clearLinks } from "../js/draw_links";
import { setupCamera } from '../js/setup_camera';
import { setupGui, guiParams } from '../js/setup_gui';


const highlightedLinksPreviousMaterials = [];

const cortexVertUrl = require('../data/cortex_vert.csv');
const cortexTriUrl = require('../data/cortex_tri.csv');
const sensorLabelsUrl = require('../data/sensor_labels.csv');
const sensorCoordinatesUrl = require('../data/sensor_coordinates.csv');
const connectivityMatrixUrl = require('../data/conn_matrix_0.csv');
const imConnectivityMatrixUrl = require('../data/imag_conn_matrix_0.csv');

const GLOBAL_LAYER = 0,  LINK_LAYER = 1;

const SENSOR_RADIUS = 3;
const SENSOR_SEGMENTS = 20;
const SENSOR_RINGS = 50;

const cortexMaterial = new THREE.MeshStandardMaterial({
  color: 0xffc0cb,
  side: THREE.BackSide
});
const sensorMaterial =  new THREE.MeshPhysicalMaterial({
  color: 0xaaaaaa,
  opacity: 1.,
  transparent: true,
  reflectivity: 1
});
const enlightenedSensorMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  reflectivity: 1
});

const linkMeshList = [];

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
const camera = new THREE.PerspectiveCamera();
const controls = new OrbitControls(camera, renderer.domElement);
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const gui = new GUI();

document.body.appendChild(renderer.domElement);
const sensorNameDiv = document.getElementById("sensorName");
const fileInput = document.getElementById("fileInput");


//INTERSECTED is used to check wether the mouse intersects with a sensor
var INTERSECTED;

init();
animate();

function init() {
  THREE.Cache.enabled = true;
  setupGui();
  setupCamera();
  addLightAndBackground();
  loadAndDrawCortexModel();
  loadAndDrawSensors();
  loadAndDrawLinks(connectivityMatrixUrl);
  
  window.addEventListener("resize", onWindowResize);
  document.addEventListener("mousemove", onDocumentMouseMove);
  fileInput.addEventListener("change", handleFileSelect, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

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

  if (intersects.length !== 0 && sensorMeshList.includes(intersects[0].object)) {
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
  while (highlightedLinksPreviousMaterials.length > 0)
  {
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
  for (const linkMesh of linkMeshList)
  {
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

function handleFileSelect(evt) {
  if (evt.target.files.length === 0) { return; }
  const file = evt.target.files[0];
  const fileUrl = window.URL.createObjectURL(file);
  clearLinks();
  loadAndDrawLinks(fileUrl);
}


export {
    scene,
    camera,
    controls,
    renderer,
    linkMeshList,
    gui,
    cortexVertUrl, 
    cortexTriUrl, 
    sensorLabelsUrl, 
    sensorCoordinatesUrl, 
    connectivityMatrixUrl,
    imConnectivityMatrixUrl,
    cortexMaterial,
    sensorMaterial,
    SENSOR_RADIUS,
    SENSOR_SEGMENTS,
    SENSOR_RINGS,
    GLOBAL_LAYER,
    LINK_LAYER
};