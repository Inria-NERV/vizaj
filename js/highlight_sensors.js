import * as THREE from "three";
import { hexToHsl } from "../js/color_helper";

/**
 * Create a DOM element to display the sensor label
 * @param {*} id - id of the sensor
 */
function createSensorLabel(id) {
  const labelContainer = document.createElement("div");
  labelContainer.id = "sensorName-" + id;
  labelContainer.className = "sensorName";
  const parentContainer = document.getElementById("sensorNameContainer");
  parentContainer.appendChild(labelContainer);
  document.body.appendChild(labelContainer);

  return labelContainer;
}

/**
 * Remove the sensor label from the DOM
 * @param {*} uuid - uuid of the sensor
 */
function removeSensorLabel(uuid) {
  const labelContainer = document.getElementById("sensorName-" + uuid);
  if (labelContainer) {
    labelContainer.parentNode.removeChild(labelContainer);
  }
}

/**
 * Move the sensor label to the specified position
 * @param {*} container - label container DOM element
 * @param {*} x - x position
 * @param {*} y - y position
 */
function moveSensorLabel(container, x, y) {
  container.style.top = y + "px";
  container.style.left = x + "px";
  container.style.visibility = 'visible';
}

/**
 * Update the sensor label text
 * @param {*} container - label container DOM element
 * @param {*} label - new label text
 */
function renameSensorLabel(container, label) {
  container.innerHTML = label;
}

/**
 * Display label of the hovered sensor.
 * If no node is being hovered, no label is shown.
 * @param {*} intersectedNode - the node being hovered
 * @param {*} camera
 * @param {*} renderer 
 */
function updateHoveredSensorLabel(intersectedNode, camera, renderer) {
  const hoveredSensorNameDiv = document.getElementById("hoveredSensorName");
  if (intersectedNode) {
    const vector = new THREE.Vector3();
    intersectedNode.getWorldPosition(vector);
    vector.project(camera);

    const x = (vector.x *  .5 + .5) * renderer.domElement.clientWidth;
    const y = (vector.y * -.5 + .5) * renderer.domElement.clientHeight;

    moveSensorLabel(hoveredSensorNameDiv, x, y);
    renameSensorLabel(hoveredSensorNameDiv, intersectedNode.name);
  } else {
    hoveredSensorNameDiv.style.visibility = 'hidden';
  }
}

/**
 * Reposition sensor labels when the camera changes.
 * If a sensor does not have a label yet, create it.
 * @param {*} sensors - map of sensor uuids with their corresponding 3D node
 * @param {*} camera 
 * @param {*} renderer 
 */
function repositionLabelsOnCameraChange(sensors, camera, renderer) {
  sensors.forEach((node, uuid) => {
    const vector = new THREE.Vector3();
    node.getWorldPosition(vector);
    vector.project(camera);

    const x = (vector.x *  .5 + .5) * renderer.domElement.clientWidth;
    const y = (vector.y * -.5 + .5) * renderer.domElement.clientHeight;

    let labelContainer = document.getElementById("sensorName-" + uuid);
    if (!labelContainer) {
        labelContainer = createSensorLabel(uuid);
    }
    moveSensorLabel(labelContainer, x, y);
    renameSensorLabel(labelContainer, node.name);
  });
}

/**
 * Highlight the links associated with a specific sensor node.
 * @param {*} sensorNode 
 * @param {*} links 
 * @param {*} backgroundColor 3D scene background color in hex format
 */
function highlightSensorLinks(sensorNode, links, backgroundColor) {
    const associatedLinks = links.filter((linkMesh) => linkMesh.link.node1 === sensorNode || linkMesh.link.node2 === sensorNode);
    for (const linkMesh of associatedLinks) {
        let color = hexToHsl(backgroundColor).l < 50 ? new THREE.Color(1,1,1) : new THREE.Color(0,0,0);
        linkMesh.mesh.material = new THREE.LineBasicMaterial({
            color,
            opacity: 1,
            transparent: false
        });
    }
}

export { 
  removeSensorLabel, 
  repositionLabelsOnCameraChange, 
  updateHoveredSensorLabel,
  highlightSensorLinks,
};