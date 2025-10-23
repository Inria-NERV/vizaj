import * as THREE from "three";
import { updateBackgroundColor } from "./add_light_and_background.js";
import { updateBrainMeshVisibility, updateExtraItemMaterial } from "./draw_cortex.js";
import { redrawDegreeLines, updateAllDegreeLineLength, updateAllDegreeLineVisibility } from "./draw_degree_line.js";
import { updateAllSensorMaterial, updateAllSensorRadius } from "./draw_sensors.js";
import { redrawLinks, updateAllLinkMaterial, updateLinkOutline, updateVisibleLinks } from "./link_builder/draw_links";
import { guiParams } from './setup_gui.js';
import { camera, gui, linkMeshList, controls, scene } from '../public/main.js';

/**
 * Handles file input change event and imports parameters from selected file.
 * @param {Event} event
 */
const handleConfigInputChange = (event) => {
  const file = event.target.files[0];
  if (!file) {
    alert('No file selected.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target.result);
      Object.assign(guiParams, json);
      updateGuiControls();
      updateVisualSettings();
      updateSettingsFromConfig();
    } catch (error) {
      alert('Invalid JSON format. Please select a valid configuration file.');
      console.error('JSON parse error:', error);
    }
  };
  reader.readAsText(file);
};

/**
 * Updates all GUI controls to reflect the current parameters.
 */
const updateGuiControls = () => {
  gui.__controllers.forEach(controller => controller.updateDisplay());
  Object.values(gui.__folders).forEach(folder => {
    folder.__controllers.forEach(controller => controller.updateDisplay());
  });
};

/**
 * Updates visual settings based on current parameters.
 */
const updateVisualSettings = () => {
  camera.autoRotate = guiParams.autoRotateCamera;
  camera.autoRotateSpeed = guiParams.autoRotateSpeed;
  scene.background = new THREE.Color(guiParams.backgroundColor);
  updateLinkVisibility(guiParams.linkDensity);
};

/**
 * Updates link visibility based on density parameter.
 * @param {number} density
 */
const updateLinkVisibility = (density) => {
  linkMeshList.forEach(link => {
    link.visible = Math.random() < density;
  });
};

/**
 * Updates all settings and redraws visuals from config.
 */
const updateSettingsFromConfig = () => {
  controls.autoRotate = guiParams.autoRotateCamera;
  controls.autoRotateSpeed = guiParams.autoRotateSpeed;
  controls.update();

  updateBackgroundColor();
  updateBrainMeshVisibility();
  updateExtraItemMaterial();
  updateVisibleLinks();
  updateAllLinkMaterial();
  updateLinkOutline();
  updateAllSensorRadius();
  updateAllSensorMaterial();
  updateAllDegreeLineVisibility();
  updateAllDegreeLineLength();
  redrawLinks();
  redrawDegreeLines();
};

export { handleConfigInputChange };
