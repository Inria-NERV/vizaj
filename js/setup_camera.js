import * as THREE from 'three';
import { scene, camera,
    uiScene, uiCamera,
    controls, renderer, LINK_LAYER} from '../public/main.js';
import { guiParams } from './setup_gui';

function setupCamera(){
    controls.autoRotate = guiParams.rotateCamera;
    controls.enableDamping = true;
    controls.dampingFactor = .15;

    camera.position.z = 400;
    camera.position.y = 20;

    camera.layers.enable(LINK_LAYER);
    controls.target = new THREE.Vector3(0,camera.position.y,0);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    uiCamera.position.set(0.85, 0, 1);
}

function updateRotateCamera(){
    controls.autoRotate = guiParams.rotateCamera;
}

export {
    setupCamera,
    updateRotateCamera
}