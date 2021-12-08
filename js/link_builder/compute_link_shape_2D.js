import * as THREE from "three";
import { Matrix3, Vector3 } from "three";
import { maxSensorDistance,
    CENTER_POINT_OFFSET_X,
    CENTER_POINT_OFFSET_Y,
    CENTER_POINT_OFFSET_Z } from '../draw_sensors';
import { guiParams } from '../setup_gui';


function getSplinePointsPlane(link){
    const pointA = link.node1.position;
    const pointB = link.node2.position;
    const pointC = new THREE.Vector3(
        (pointA.x + pointB.x)/2,
        (pointA.distanceTo(pointB)) * guiParams.linkHeight,
        (pointA.z + pointB.z)/2)
        .add(new Vector3(
            CENTER_POINT_OFFSET_X,
            CENTER_POINT_OFFSET_Y,
            CENTER_POINT_OFFSET_Z));
    const curve = new THREE.QuadraticBezierCurve3(pointA, pointC, pointB);
    const curvePath = new THREE.CurvePath();
    curvePath.add(curve);
    return curvePath;
}

export { getSplinePointsPlane }