import * as THREE from "three";
import { Matrix3, Vector3 } from "three";
import { guiParams } from '../setup_gui';

//This point is to translate the origin where the coordinates of the link are computed
// since all links align with the plan of (0,0,0) and the position of the two nodes, we alter the position of the nodes 
// in order to make the links face where we want

const centerPoint = new Vector3(0,-25,0);

function getSplinePoints(link){
    centerPoint.set(0, -guiParams.linkAlignmentTarget, 0);

    const pointA = {controlPoint: link.node1.position.clone()};
    const pointB = {controlPoint: link.node2.position.clone()};
    pointA.controlPoint.addScaledVector(centerPoint, -1);
    pointB.controlPoint.addScaledVector(centerPoint, -1);

    const linkToGlobalMatrix = getLinkToGlobalMatrix(pointA.controlPoint, pointB.controlPoint);
    const globalToLinkMatrix = linkToGlobalMatrix.clone().invert();

    const linkBasisA = pointA.controlPoint.clone();
    linkBasisA.applyMatrix3(globalToLinkMatrix);

    const linkBasisB = pointB.controlPoint.clone();
    linkBasisB.applyMatrix3(globalToLinkMatrix);

    const l = new Vector3(
        (linkBasisA.x + linkBasisB.x)/2, 
        (linkBasisA.y + linkBasisB.y)/2, 
        (linkBasisA.z + linkBasisB.z)/2
    ).length();

    const pointC = computePointC(linkBasisA, linkBasisB, linkToGlobalMatrix, l);

    const quaternionA = new THREE.Quaternion();
    quaternionA.setFromAxisAngle( 
        new Vector3(0,0,1), 
        Math.PI + Math.PI * ( guiParams.linkSensorAngles )
    );

    const quaternionB = new THREE.Quaternion();
    quaternionB.setFromAxisAngle( 
        new Vector3(0,0,-1), 
        Math.PI + Math.PI  * ( guiParams.linkSensorAngles ) 
    );

    pointA.handleRight = new THREE.Vector3(linkBasisA.x * guiParams.linkSensorHandleDistances,0,0)
        .applyQuaternion( quaternionA )
        .add( linkBasisA )
        .applyMatrix3(linkToGlobalMatrix);
    pointB.handleLeft  = new THREE.Vector3(linkBasisB.x * guiParams.linkSensorHandleDistances,0,0)
        .applyQuaternion( quaternionB )
        .add( linkBasisB )
        .applyMatrix3(linkToGlobalMatrix);

    pointA.controlPoint.add(centerPoint);
    pointA.handleRight.add(centerPoint);
    pointC.handleLeft.add(centerPoint);
    pointC.controlPoint.add(centerPoint);
    pointC.handleRight.add(centerPoint);
    pointB.handleLeft.add(centerPoint);
    pointB.controlPoint.add(centerPoint);

    const splineLeft = new THREE.CubicBezierCurve3(
        pointA.controlPoint, 
        pointA.handleRight, 
        pointC.handleLeft, 
        pointC.controlPoint
    );
    const splineRight = new THREE.CubicBezierCurve3(
        pointC.controlPoint, 
        pointC.handleRight, 
        pointB.handleLeft, 
        pointB.controlPoint
    );
    const curvePath = new THREE.CurvePath();
    curvePath.add(splineLeft);
    curvePath.add(splineRight);
    return curvePath;
}

//This function is to get the rotation to be in the link plan
//It makes it easier to write 3d operations in such a plan
function getLinkToGlobalMatrix(A, B){
    const i = B.clone().addScaledVector( A, -1 ).normalize();
    const j = A.clone().add( B ).normalize();
    const k = i.clone().cross( j );

    const m = new Matrix3();
    m.set(i.x, j.x, k.x,
        i.y, j.y, k.y,
        i.z, j.z, k.z);
    return m;
}

function computePointC(linkBasisA, linkBasisB, linkToGlobalMatrix, l){
    const linkBasisControlPointC = new THREE.Vector3(
        0,
        linkBasisA.distanceTo(linkBasisB) * guiParams.linkHeight + l,
        0
    );
    const leftHandleRotation = new THREE.Quaternion();
    leftHandleRotation.setFromAxisAngle(new Vector3(0,0,+1), Math.PI * guiParams.linkTopPointAngle );
    const rightHandleRotation = new THREE.Quaternion();
    rightHandleRotation.setFromAxisAngle(new Vector3(0,0,-1), Math.PI * guiParams.linkTopPointAngle );
    return {
        controlPoint: linkBasisControlPointC.clone()
            .applyMatrix3(linkToGlobalMatrix),
        handleLeft: linkBasisControlPointC.clone()
            .add( new Vector3(linkBasisA.x * guiParams.linkTopPointHandleDistances, 0, 0) )
            .applyQuaternion(leftHandleRotation)
            .applyMatrix3(linkToGlobalMatrix),
        handleRight: linkBasisControlPointC.clone()
            .add( new Vector3(linkBasisB.x * guiParams.linkTopPointHandleDistances, 0, 0) )
            .applyQuaternion(rightHandleRotation)
            .applyMatrix3(linkToGlobalMatrix)
    };
}

export { getSplinePoints, 
    centerPoint }