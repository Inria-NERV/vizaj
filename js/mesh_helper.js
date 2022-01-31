import * as THREE from "three";
import { scene } from '../public/main';

function deleteMesh(mesh){
    disposeMesh(mesh);
    scene.remove(mesh);
}

function disposeMesh(mesh){
    mesh.geometry.dispose();
    mesh.material.dispose();
}

export { 
    deleteMesh,
    disposeMesh
}