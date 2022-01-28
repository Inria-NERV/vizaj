import * as THREE from 'three';
import { gui, controls,
    csvConnMatrixInput,
    csvNodePositionsInput,
    csvNodeLabelsInput,
    jsonInput, 
    linkMeshList,
    sensorMeshList} from '../public/main';
import { updateAllSensorRadius,
    updateAllSensorMaterial } from './draw_sensors';
import { redrawLinks, updateLinkOutline, updateVisibleLinks } from './link_builder/draw_links';
import{ linkLineGenerator, linkVolumeGenerator } from './link_builder/link_mesh_generator';
import { updateBrainMeshVisibility } from './draw_cortex';
import { redrawDegreeLines, updateAllDegreeLines, updateDegreeLinesVisibility } from './draw_degree_line';
import { export2DImage, export3Dgltf } from './export_image';

const guiParams = {
    loadConnectivityMatrixCsvFile: () => csvConnMatrixInput.click(),
    loadMontageCsvFile: () => {csvNodePositionsInput.click();},
    loadMontageLabelsCsvFile: () => {csvNodeLabelsInput.click();},
    loadJson: () => {jsonInput.click()},

    autoRotateCamera: false,
    autoRotateSpeed: 2.0,
    maxStrengthToDisplay: .2,
    showBrain: true,

    showDegreeLines: true,
    degreeLineRadius: 1,
    degreeLineLength: 1,

    linkHeight: 0.75,
    linkTopPointHandleDistances: .5,
    linkSensorAngles: 3 / 8,
    linkSensorHandleDistances: 0.,
    linkTopPointAngle: 0.,

    sensorRadiusFactor: 1.,
    sensorOpacity: 1.,
    sensorColor: "#aaaaaa",
    resetSensors: () => {
        guiParams.sensorRadiusFactor = 1;
        guiParams.sensorOpacity = 1;
        guiParams.sensorColor = "#aaaaaa";
        updateAllSensorRadius();
        updateAllSensorMaterial();
    },

    linkGenerator: linkLineGenerator,
    linkAlignmentTarget: 30,

    ecoFiltering: () => {
    // According to Eco filtering, one optimal way of filtering the links is to set node degree = 3
    // in other words : number of links = number of nodes * 3 / 2
        guiParams.maxStrengthToDisplay = 3 / 2 * sensorMeshList.length / linkMeshList.length;
        updateVisibleLinks();
    },

    resetLinkAlignmentTarget: ()=>{
        guiParams.linkAlignmentTarget = 30;
        redrawLinks();
        redrawDegreeLines();
    },
    maximumLinkAligmnentTarget: ()=> {
        guiParams.linkAlignmentTarget = 1000000;
        redrawLinks();
        redrawDegreeLines();
    },

    makeLinkLineMesh: () => changeLinkMesh(linkLineGenerator),
    makeLinkVolumeMesh: () => changeLinkMesh(linkVolumeGenerator),
    linkThickness: 1.,

    splinePointsGeometry: 0,

    export2dImage: () => export2DImage(),
    export3Dgltf: () => export3Dgltf(),
    
  };

const premadeLinkGeometriesParam = {
    defaultLinkGeometry: () => {
        guiParams.linkHeight = 0.75;
        guiParams.linkTopPointHandleDistances = 0.5;
        guiParams.linkSensorAngles = 3 / 8;
        guiParams.linkSensorHandleDistances = 0.;
        updateLinkOutline();
    },
    bellLinkGeometry: () => {
        guiParams.linkHeight = 0.75;
        guiParams.linkTopPointHandleDistances = 0.5;
        guiParams.linkSensorAngles = 0.;
        guiParams.linkSensorHandleDistances = .5;
        updateLinkOutline();
    },
    triangleLinkGeometry: () => {
        guiParams.linkHeight = 0.75;
        guiParams.linkTopPointHandleDistances = 0;
        guiParams.linkSensorAngles = 0.;
        guiParams.linkSensorHandleDistances = 0.;
        updateLinkOutline();
    },
    roundedSquareLinkGeometry: () => {
        guiParams.linkHeight = 0.5;
        guiParams.linkTopPointHandleDistances = 1.;
        guiParams.linkSensorAngles = 0.5;
        guiParams.linkSensorHandleDistances = 1.;
        updateLinkOutline();
    },
    peakLinkGeometry: () => {
        guiParams.linkHeight = 0.75;
        guiParams.linkTopPointHandleDistances = 0;
        guiParams.linkSensorAngles = 0.;
        guiParams.linkSensorHandleDistances = 1.;
        updateLinkOutline();
    }
}

function changeLinkMesh(linkGenerator){
    guiParams.linkGenerator = linkGenerator;
    redrawLinks();
}

function setupGui() {
    const cameraFolder = gui.addFolder('Camera');
    cameraFolder.add(guiParams, 'autoRotateCamera').onChange( () => {controls.autoRotate = guiParams.autoRotateCamera} );
    cameraFolder.add(guiParams, 'autoRotateSpeed', 0, 35 ).onChange( (value) => {controls.autoRotateSpeed = value} );

    const linksToDisplayFolder = gui.addFolder('Filtering');
    linksToDisplayFolder.add(guiParams, 'maxStrengthToDisplay', 0., 1.)
        .name('Density')
        .onChange (() => updateVisibleLinks())
        .listen();
    linksToDisplayFolder.add(guiParams, 'ecoFiltering').name('ECO');
    gui.add(guiParams, 'showBrain').onChange(updateBrainMeshVisibility);

    const sensorFolder = gui.addFolder('Nodes');
    sensorFolder.add(guiParams, 'sensorRadiusFactor', 0., 1.).onChange(updateAllSensorRadius).listen().name('Radius');
    sensorFolder.add(guiParams, 'sensorOpacity', 0., 1.).onChange(updateAllSensorMaterial).listen().name('Opacity');
    sensorFolder.addColor(guiParams, 'sensorColor').onChange(updateAllSensorMaterial).listen().name('Color');
    sensorFolder.add(guiParams, 'resetSensors').name('Reset');

    const linkGeometry = gui.addFolder('Link');
    linkGeometry.add(guiParams, 'linkHeight', 0, 2).onChange(updateLinkOutline).listen().name('Height');
    linkGeometry.add(guiParams, 'linkTopPointHandleDistances', 0, 1).onChange(updateLinkOutline).listen().name('Top point handle distance');
    linkGeometry.add(guiParams, 'linkSensorAngles', 0, 1).onChange(updateLinkOutline).listen().name('Sensor angle');
    linkGeometry.add(guiParams, 'linkSensorHandleDistances', 0, 1).onChange(updateLinkOutline).listen().name('Sensor handle distance');
    //we purposedly don't allow change of top point angle

    const premadeLinkGeometries = gui.addFolder('premadeLinkGeometries');
    premadeLinkGeometries.add(premadeLinkGeometriesParam, 'defaultLinkGeometry').name('Default');
    premadeLinkGeometries.add(premadeLinkGeometriesParam, 'bellLinkGeometry').name('Bell');
    premadeLinkGeometries.add(premadeLinkGeometriesParam, 'triangleLinkGeometry').name('Triangle');
    premadeLinkGeometries.add(premadeLinkGeometriesParam, 'roundedSquareLinkGeometry').name('Rounded square');
    premadeLinkGeometries.add(premadeLinkGeometriesParam, 'peakLinkGeometry').name('Peak');

    const linkAlignmentTarget = linkGeometry.addFolder('Link alignment target');
    linkAlignmentTarget.add(guiParams, 'linkAlignmentTarget')
        .onChange(() => {
            redrawLinks();
            redrawDegreeLines();
        })
        .name('Link alignment')
        .listen();
    linkAlignmentTarget.add(guiParams, 'resetLinkAlignmentTarget')
        .name('Reset');
    linkAlignmentTarget.add(guiParams, 'maximumLinkAligmnentTarget')
        .name('Maximum');  

    const linkVolume = linkGeometry.addFolder('Volume');
    linkVolume.add(guiParams, 'makeLinkLineMesh').name('Line');
    linkVolume.add(guiParams, 'makeLinkVolumeMesh').name('Volume');
    linkVolume.add(guiParams, 'linkThickness', 0, 4).onChange(redrawLinks);

    const degreeLineFolder = gui.addFolder('Degree lines');
    degreeLineFolder.add(guiParams, 'showDegreeLines').onChange(updateDegreeLinesVisibility).name('Show degree line');
    degreeLineFolder.add(guiParams, 'degreeLineRadius', 0., 1.).onChange(redrawDegreeLines).name('Radius');
    degreeLineFolder.add(guiParams, 'degreeLineLength', 0., 1.).onChange(updateAllDegreeLines).name('Length');

    const fileLoadFolder = gui.addFolder('Load files');
    const csvLoadFolder = fileLoadFolder.addFolder('CSV');
    csvLoadFolder.add(guiParams, 'loadMontageCsvFile').name('Coordinates');
    csvLoadFolder.add(guiParams, 'loadMontageLabelsCsvFile').name('Labels');
    csvLoadFolder.add(guiParams, 'loadConnectivityMatrixCsvFile').name('Matrix');
    fileLoadFolder.add(guiParams, 'loadJson').name('Json');

    const exportFileFolder = gui.addFolder('Export');
    exportFileFolder.add(guiParams, 'export2dImage').name('Picture (.tif)');
    exportFileFolder.add(guiParams, 'export3Dgltf').name('Object (.gltf)');

}

export {
    guiParams,
    setupGui
}
