import {scene} from '../public/main';
import * as THREE from 'three';
import { guiParams } from './setup_gui';
import { hexAToRGBA, hexToHsl } from './color_helper';
import { ColorMapCanvas } from './link_builder/color_map_sprite';

export function addLightAndBackground() {
  updateBackgroundColor();
  scene.add(new THREE.AmbientLight(0x222222));
  const dirLight = new THREE.DirectionalLight(0xffffff, .85);
  dirLight.position.set(1000, 1000, 1000);
  scene.add(dirLight);

  const dirLight1 = new THREE.DirectionalLight(0xffffff, .85);
  dirLight1.position.set(-1000, 1000, -1000);
  scene.add(dirLight1);

  const bottomLight = new THREE.DirectionalLight(0xffffff, 0.6);
  bottomLight.position.set(0, -1000, 0);
  scene.add(bottomLight);

  const sideLight = new THREE.DirectionalLight(0xffffff, .3);
  sideLight.position.set(1000,0,0);
  scene.add(sideLight);

  const sideLight1 = new THREE.DirectionalLight(0xffffff, .3);
  sideLight1.position.set(-1000,0,0);
  scene.add(sideLight1);
}

export function updateBackgroundColor(){
  ColorMapCanvas.adaptTextColor(guiParams.backgroundColor);
  scene.background = new THREE.Color(guiParams.backgroundColor);
}

export function resetBackgroundColor(){
  guiParams.backgroundColor = '#111133';
  updateBackgroundColor();
}