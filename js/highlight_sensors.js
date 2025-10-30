import * as THREE from "three";

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
 * @param {*} nodeStateMap 
 * @param {*} camera 
 * @param {*} renderer 
 */
function repositionLabelsOnCameraChange(nodeStateMap, camera, renderer) {
  nodeStateMap.forEach((state, node) => {
    if (state === 'highlighted') {
    const vector = new THREE.Vector3();
    node.getWorldPosition(vector);
    vector.project(camera);

    const x = (vector.x *  .5 + .5) * renderer.domElement.clientWidth;
    const y = (vector.y * -.5 + .5) * renderer.domElement.clientHeight;

    let labelContainer = document.getElementById("sensorName-" + node.uuid);
    if (!labelContainer) {
        labelContainer = createSensorLabel(node.uuid);
    }
    moveSensorLabel(labelContainer, x, y);
    renameSensorLabel(labelContainer, node.name);
  }});
}

export { 
  removeSensorLabel, 
  repositionLabelsOnCameraChange, 
  updateHoveredSensorLabel,
};