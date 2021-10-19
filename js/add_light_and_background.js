import {scene} from '../public/main';
import * as THREE from 'three';

export function addLightAndBackground() {
    scene.background = new THREE.Color(0x111133);
    scene.add(new THREE.AmbientLight(0x222222));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(1000, 1000, 1000);
    scene.add(dirLight);
  
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1);
    dirLight1.position.set(-1000, 1000, -1000);
    scene.add(dirLight1);
  
    const bottomLight = new THREE.DirectionalLight(0xffffff, 0.6);
    bottomLight.position.set(0, -1000, 0);
    scene.add(bottomLight);
  }