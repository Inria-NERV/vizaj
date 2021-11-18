import * as THREE from "three";
import { Matrix3, Vector3 } from "three";
import { maxSensorDistance } from '../draw_sensors';
import { guiParams } from '../setup_gui';


function getSplinePointsPlane(link){
    const pointA = link.node1.position;
    const pointB = link.node2.position;
    const pointC = new THREE.Vector3(
        (pointA.x + pointB.x)/2,
        (pointA.distanceTo(pointB)) * guiParams.linkHeight,
        (pointA.z + pointB.z)/2
    );
    const curve = new THREE.QuadraticBezierCurve3(pointA, pointC, pointB);
    const curvePath = new THREE.CurvePath();
    curvePath.add(curve);
    return curvePath;
}

// function getSplinePointsPlane(link, L){
//     const pointA = {controlPoint: link.node1.position};
//     const pointB = {controlPoint: link.node2.position};
//     const pointC = computePointCPlane(pointA.controlPoint, pointB.controlPoint);
//     pointA.handleRight = new THREE.Vector3(pointA.controlPoint.x * guiParams.linkSensorHandleDistances,0,0);
//     pointB.handleLeft  = new THREE.Vector3(pointB.controlPoint.x * guiParams.linkSensorHandleDistances,0,0);
//     const splineLeft = new THREE.CubicBezierCurve3(pointA.controlPoint, pointA.handleRight, pointC.handleLeft, pointC.controlPoint);
//     const splineRight = new THREE.CubicBezierCurve3(pointC.controlPoint, pointC.handleRight, pointB.handleLeft, pointB.controlPoint);
//     const curvePath = new THREE.CurvePath();
//     curvePath.add(splineLeft);
//     curvePath.add(splineRight);
//     return curvePath;
// }

// function computePointCPlane(pointA, pointB){
//     const controlPointC = new THREE.Vector3(
//         (pointA.x + pointB.x)/2,
//         pointA.distanceTo(pointB) * guiParams.linkHeight,
//         (pointA.z + pointB.z)/2
//     );
//     const leftHandleRotation = new THREE.Quaternion();
//     leftHandleRotation.setFromAxisAngle(new Vector3(0,+1,0), Math.PI * guiParams.linkTopPointAngle );
//     const rightHandleRotation = new THREE.Quaternion();
//     rightHandleRotation.setFromAxisAngle(new Vector3(0,-1,0), Math.PI * guiParams.linkTopPointAngle );
//     return {controlPoint: controlPointC.clone(),
//         handleLeft: controlPointC.clone()
//             .add( new Vector3(pointA.x * guiParams.linkTopPointHandleDistances, 0, 0) ),
//         handleRight: controlPointC.clone()
//             .add( new Vector3(pointB.x * guiParams.linkTopPointHandleDistances, 0, 0) ),
//         controlPointLinkBasis: controlPointC
//     };
// }

export { getSplinePointsPlane }