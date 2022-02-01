import * as THREE from "three";
import { scene } from '../public/main';

function deleteMesh(mesh, _scene=scene){
    disposeMesh(mesh);
    _scene.remove(mesh);
}

function disposeMesh(mesh){
    mesh.geometry.dispose();
    mesh.material.dispose();
}

export { 
    deleteMesh,
    disposeMesh
}