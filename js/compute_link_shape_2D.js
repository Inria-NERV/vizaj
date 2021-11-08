import * as THREE from "three";
import { Matrix3, Vector3 } from "three";
import { maxSensorDistance } from './draw_sensors';
import { guiParams } from './setup_gui';

function getSplinePoints2D(link, L){
    const pointA = {controlPoint: link.node1.position};
    const pointB = {controlPoint: link.node2.position};
    const normalisedDistance = linkBasisA.distanceTo(linkBasisB) / maxSensorDistance;
    const l = new Vector3((linkBasisA.x + linkBasisB.x)/2, (linkBasisA.y + linkBasisB.y)/2, (linkBasisA.z + linkBasisB.z)/2).distanceTo(new Vector3(0,0,0));
    const pointC = computePointC(linkBasisA, linkBasisB, linkToGlobalMatrix, l, L, normalisedDistance);
    pointA.handleRight = new THREE.Vector3(linkBasisA.x * guiParams.linkSensorHandleDistances,0,0).applyMatrix3(linkToGlobalMatrix);
    pointB.handleLeft  = new THREE.Vector3(linkBasisB.x * guiParams.linkSensorHandleDistances,0,0).applyMatrix3(linkToGlobalMatrix);
    const splineLeft = new THREE.CubicBezierCurve3(pointA.controlPoint, pointA.handleRight, pointC.handleLeft, pointC.controlPoint);
    const splineRight = new THREE.CubicBezierCurve3(pointC.controlPoint, pointC.handleRight, pointB.handleLeft, pointB.controlPoint);
    const curvePath = new THREE.CurvePath();
    curvePath.add(splineLeft);
    curvePath.add(splineRight);
    return curvePath;
}


function computePointC2D(linkBasisA, linkBasisB, linkToGlobalMatrix, l, L, flattenedNormalisedDistance){
    const controlPointC = new THREE.Vector3(
        0,
        linkBasisA.distanceTo(linkBasisB) * guiParams.linkHeight + l,//flattenedNormalisedDistance * L / 2 + l,
        0
    );
    const leftHandleRotation = new THREE.Quaternion();
    leftHandleRotation.setFromAxisAngle(new Vector3(0,0,+1), Math.PI * guiParams.linkTopPointAngle );
    const rightHandleRotation = new THREE.Quaternion();
    rightHandleRotation.setFromAxisAngle(new Vector3(0,0,-1), Math.PI * guiParams.linkTopPointAngle );
    return {controlPoint: controlPointC.clone().applyMatrix3(linkToGlobalMatrix),
        handleLeft: controlPointC.clone()
            .add( new Vector3(linkBasisA.x * guiParams.linkTopPointHandleDistances, 0, 0) )
            .applyQuaternion(leftHandleRotation)
            .applyMatrix3(linkToGlobalMatrix),
        handleRight: controlPointC.clone()
            .add( new Vector3(linkBasisB.x * guiParams.linkTopPointHandleDistances, 0, 0) )
            .applyQuaternion(rightHandleRotation)
            .applyMatrix3(linkToGlobalMatrix),
        controlPointLinkBasis: controlPointC
    };
}



//export { getSplinePoints2D }