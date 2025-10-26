import * as THREE from 'three';
import { gui, controls,
    csvConnMatrixInput,
    csvNodePositionsInput,
    csvNodeLabelsInput,
    jsonInput } from '../public/main';
import { updateAllSensorRadius,
    updateAllSensorMaterial } from './draw_sensors';
import { redrawLinks, updateLinkOutline, updateVisibleLinks, updateAllLinkMaterial, ecoFiltering } from './link_builder/draw_links';
import{ linkLineGenerator, linkVolumeGenerator } from './link_builder/link_mesh_generator';
import { updateBrainMeshVisibility, 
    updateExtraItemMaterial,
    updateExtraItemMesh,
    translateModeTransformControls,
    rotateModeTransformControls,
    scaleModeTransformControls,
    resetPositionExtraItemMesh,
    disableTransformControls,
    undoTransformControls } from './draw_cortex';
import { redrawDegreeLines, updateAllDegreeLineLength, updateAllDegreeLineMaterial, updateAllDegreeLineVisibility } from './draw_degree_line';
import { export2DImage, export3Dgltf, isExporting2DImage } from './export_image';
import { updateBackgroundColor, resetBackgroundColor } from './add_light_and_background';
import { ColorMapCanvas } from './link_builder/color_map_sprite';
import { showLogs, hideLogs } from "../js/logs_helper";
import { rescaleColors } from './link_builder/draw_links';

const guiParams = {
    loadConnectivityMatrixCsvFile: () => csvConnMatrixInput.click(),
    loadMontageCsvFile: () => {csvNodePositionsInput.click();},
    loadMontageLabelsCsvFile: () => {csvNodeLabelsInput.click();},
    loadJson: () => {jsonInput.click()},

    autoRotateCamera: false,
    autoRotateSpeed: 2.0,
    linkDensity: .2,

    backgroundColor: '#111133',
    resetBackgroundColor: resetBackgroundColor,

    showExtraItem: false,
    colorExtraItem: '#ffc0cb',
    resetExtraItemColor: () =>{
        guiParams.colorExtraItem = '#ffc0cb';
        updateExtraItemMaterial();
    },
    extraItemMeshShape: 'brain',
    translateModeTransformControls: translateModeTransformControls,
    rotateModeTransformControls: rotateModeTransformControls,
    scaleModeTransformControls: scaleModeTransformControls,
    resetExtraItemPosition: resetPositionExtraItemMesh,
    closeTransformControls: disableTransformControls,
    undoTransformControls: undoTransformControls,

    showDegreeLines: false,
    degreeLineRadius: 1,
    degreeLineLength: 1,
    degreeLineColor: '#9999ff',
    degreeLineOpacity: .6,
    degreeLineReset: () => {
        guiParams.showDegreeLines = true;
        guiParams.degreeLineRadius = 1;
        guiParams.degreeLineLength = 1;
        guiParams.degreeLineColor = '#9999ff';
        guiParams.degreeLineOpacity = .6;
        redrawDegreeLines();
    },

    linkHeight: 0.75,
    linkTopPointHandleDistances: .5,
    linkSensorAngles: .375,
    linkSensorHandleDistances: 0.1,
    linkTopPointAngle: 0.,
    linkThickness: 0.,
    linkOpacity: 1.,
    linkColorMap: 'rainbow',

    showColorMap: true,

    sensorRadiusFactor: 1.,
    sensorOpacity: 1.,
    sensorColor: "#aaaaaa",
    sensorReset: () => {
        guiParams.sensorRadiusFactor = 1;
        guiParams.sensorOpacity = 1;
        guiParams.sensorColor = "#aaaaaa";
        updateAllSensorRadius();
        updateAllSensorMaterial();
    },

    linkGenerator: linkLineGenerator,
    linkAlignmentTarget: 0,

    ecoFiltering: ecoFiltering,

    linkGeometry: 'Default',

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
    minimumLinkAligmnentTarget: ()=> {
        guiParams.linkAlignmentTarget = -1000000;
        redrawLinks();
        redrawDegreeLines();
    },

    makeLinkLineMesh: () => {
        guiParams.linkThickness = 0;
        changeLinkMesh(linkLineGenerator)},

    makeLinkVolumeMesh: () => {
        if (guiParams.linkThickness == 0){
            guiParams.linkThickness = 1;
        }
        changeLinkMesh(linkVolumeGenerator)},

    splinePointsGeometry: 0,

    export2dImage: () => {
        if (!isExporting2DImage){
            export2DImage();
        }
    },
    export3Dgltf: () => export3Dgltf(),

    showLogs: showLogs,
    hideLogs: hideLogs
    
  };

const premadeLinkGeometriesList = ['Default', 'Bell', 'Triangle', 'Circle', 'Circle2', 'Rounded square', 'Peak', 'Straight'];
function updateDefaultLinkGeometry(){
    switch (guiParams.linkGeometry){
        case 'Default':
            guiParams.linkHeight = 0.75;
            guiParams.linkTopPointHandleDistances = 0.5;
            guiParams.linkSensorAngles = 0.375;
            guiParams.linkSensorHandleDistances = 0.;
            break;
        case 'Bell':
            guiParams.linkHeight = 0.75;
            guiParams.linkTopPointHandleDistances = 0.5;
            guiParams.linkSensorAngles = 0.;
            guiParams.linkSensorHandleDistances = .5;
            break;
        case 'Triangle':
            guiParams.linkHeight = 0.75;
            guiParams.linkTopPointHandleDistances = 0;
            guiParams.linkSensorAngles = 0.;
            guiParams.linkSensorHandleDistances = 0.;
            break;
        case 'Circle':
            guiParams.linkHeight = 0.5;
            guiParams.linkTopPointHandleDistances = 0.5;
            guiParams.linkSensorAngles = 0.5;
            guiParams.linkSensorHandleDistances = .5;
            break;
        case 'Circle2':
            guiParams.linkHeight = 0.9;
            guiParams.linkTopPointHandleDistances = 1.;
            guiParams.linkSensorAngles = 0.8;
            guiParams.linkSensorHandleDistances = 1.;
            break;
        case 'Rounded square':
            guiParams.linkHeight = 0.5;
            guiParams.linkTopPointHandleDistances = 1.;
            guiParams.linkSensorAngles = 0.5;
            guiParams.linkSensorHandleDistances = 1.;
            break;
        case 'Peak':
            guiParams.linkHeight = 0.75;
            guiParams.linkTopPointHandleDistances = 0;
            guiParams.linkSensorAngles = 0.;
            guiParams.linkSensorHandleDistances = 1.;
            break;
        case 'Straight':
            guiParams.linkHeight = 0;
            guiParams.linkTopPointHandleDistances = 0;
            guiParams.linkSensorAngles = 0.;
            guiParams.linkSensorHandleDistances = 0.;
            break;
    }
    updateLinkOutline();
}

function changeLinkMesh(linkGenerator){
    guiParams.linkGenerator = linkGenerator;
    redrawLinks();
}

function linkThicknessUpdate() {
    if (guiParams.linkThickness > 0. && guiParams.linkGenerator != linkVolumeGenerator){
        changeLinkMesh(linkVolumeGenerator);
    }
    else if (guiParams.linkThickness == 0.){
        changeLinkMesh(linkLineGenerator);
    }
    redrawLinks();
}

const guiControllers = {};

function setupGui() {
    const cameraFolder = gui.addFolder('Camera');
    cameraFolder.add(guiParams, 'autoRotateCamera').onChange( () => {controls.autoRotate = guiParams.autoRotateCamera} )
        .name('Rotate');
    cameraFolder.add(guiParams, 'autoRotateSpeed', 0, 35 ).onChange( (value) => {controls.autoRotateSpeed = value} )
        .name('Rotation speed');

    const backgroundFolder = gui.addFolder('Background');
    backgroundFolder.addColor(guiParams, 'backgroundColor').onChange(updateBackgroundColor).name('Color').listen();
    backgroundFolder.add(guiParams, 'resetBackgroundColor').name('Reset color');

    const linksToDisplayFolder = gui.addFolder('Filtering');
    guiControllers.linkDensity = linksToDisplayFolder.add(guiParams, 'linkDensity', 0., 1.)
        .name('Density')
        .onChange (updateVisibleLinks)
        .step(.0001);
    linksToDisplayFolder.add(guiParams, 'ecoFiltering').name('ECO');
    linksToDisplayFolder.add({ rescale: rescaleColors }, 'rescale').name('Rescale');

    const extraItemFolder = gui.addFolder('Support');
    extraItemFolder.add(guiParams, 'showExtraItem').onChange(updateBrainMeshVisibility).name('Show').listen();
    extraItemFolder.addColor(guiParams, 'colorExtraItem').name('Color').onChange(updateExtraItemMaterial).listen();
    extraItemFolder.add(guiParams, 'resetExtraItemColor').name('Reset color');
    extraItemFolder.add(guiParams, 'extraItemMeshShape',
        ['brain', 'scalp', 'innerSkull', 'sphere', 'cube'])
        .name('Shape').onChange(updateExtraItemMesh);
    const moveExtraItemFolder = extraItemFolder.addFolder('Move support');
    moveExtraItemFolder.add(guiParams, 'translateModeTransformControls').name('Translate');
    moveExtraItemFolder.add(guiParams, 'rotateModeTransformControls').name('Rotate');
    moveExtraItemFolder.add(guiParams, 'scaleModeTransformControls').name('Scale');
    moveExtraItemFolder.add(guiParams, 'resetExtraItemPosition').name('Reset');
    moveExtraItemFolder.add(guiParams, 'closeTransformControls').name('Close helper');
    moveExtraItemFolder.add(guiParams, 'undoTransformControls').name('Undo');
    
    const sensorFolder = gui.addFolder('Nodes');
    guiControllers.sensorRadius = sensorFolder.add(guiParams, 'sensorRadiusFactor', 0., 2.)
        .onChange(updateAllSensorRadius)
        .name('Radius')
        .step(.01);
    guiControllers.sensorOpacity = sensorFolder.add(guiParams, 'sensorOpacity', 0., 1.).onChange(updateAllSensorMaterial).name('Opacity')
        .step(.01);
    sensorFolder.addColor(guiParams, 'sensorColor').onChange(updateAllSensorMaterial).name('Color')
        .listen();
    sensorFolder.add(guiParams, 'sensorReset').name('Reset');
 
    const linkFolder = gui.addFolder('Links');
    const linkGeometryFolder = linkFolder.addFolder('Geometry');
    guiControllers.linkHeight = linkGeometryFolder.add(guiParams, 'linkHeight', 0, 2)
        .onChange(updateLinkOutline)
        .name('Height')
        .step(.01);
    guiControllers.linkTopPointHandleDistances = linkGeometryFolder.add(guiParams, 'linkTopPointHandleDistances', 0, 1)
        .onChange(updateLinkOutline)
        .name('Top point handle distance')
        .step(.01);
    guiControllers.linkSensorAngles = linkGeometryFolder.add(guiParams, 'linkSensorAngles', 0, 1)
        .onChange(updateLinkOutline)
        .name('Node angle')
        .step(.01);
    guiControllers.linkSensorHandleDistances = linkGeometryFolder.add(guiParams, 'linkSensorHandleDistances', 0, 1)
        .onChange(updateLinkOutline)
        .name('Node handle distance')
        .step(.01);
    //we purposedly don't allow change of top point angle

    linkGeometryFolder.add(guiParams, 'linkGeometry', premadeLinkGeometriesList).onChange(updateDefaultLinkGeometry).name('Geometry');


    const colorMapFolder = linkFolder.addFolder('Color map');
    colorMapFolder.add(guiParams, 'linkColorMap', ['rainbow', 'cooltowarm', 'blackbody', 'grayscale']).onChange(updateAllLinkMaterial).name('Color map');
    colorMapFolder.add(guiParams, 'showColorMap').onChange(() => {ColorMapCanvas.show(guiParams.showColorMap)}).name('Show color bar');

    const linkAlignmentTargetFolder = linkFolder.addFolder('Link alignment target');
    guiControllers.linkAlignmentTarget = linkAlignmentTargetFolder.add(guiParams, 'linkAlignmentTarget')
        .onChange(() => {
            redrawLinks();
            redrawDegreeLines();
        })
        .name('Link alignment')
        .step(1);
    linkAlignmentTargetFolder.add(guiParams, 'resetLinkAlignmentTarget')
        .name('Reset');
    linkAlignmentTargetFolder.add(guiParams, 'maximumLinkAligmnentTarget')
        .name('Maximum');  
    linkAlignmentTargetFolder.add(guiParams, 'minimumLinkAligmnentTarget')
        .name('Minimum');  

    const linkVolumeFolder = linkFolder.addFolder('Link radius');
    linkVolumeFolder.add(guiParams, 'makeLinkLineMesh').name('Line');
    linkVolumeFolder.add(guiParams, 'makeLinkVolumeMesh').name('Volume');
    guiControllers.linkThickness = linkVolumeFolder.add(guiParams, 'linkThickness', 0, 4)
        .onChange(linkThicknessUpdate)
        .name('Link radius')
        .step(.01);

    guiControllers.linkOpacity = linkFolder.add(guiParams, 'linkOpacity', 0., 1.)
        .onChange(updateAllLinkMaterial)
        .name('Opacity')
        .step(.01);

    const degreeLineFolder = gui.addFolder('Degree lines');
    degreeLineFolder.add(guiParams, 'showDegreeLines').onChange(updateAllDegreeLineVisibility).name('Show degree line')
        .listen();
    guiControllers.degreeLineRadius = degreeLineFolder.add(guiParams, 'degreeLineRadius', 0., 2.)
        .onChange(redrawDegreeLines)
        .name('Radius')
        .step(.01);
    guiControllers.degreeLineLength = degreeLineFolder.add(guiParams, 'degreeLineLength', 0., 4.)
        .onChange(updateAllDegreeLineLength)
        .name('Length')
        .step(.01);
    guiControllers.degreeLineOpacity = degreeLineFolder.add(guiParams, 'degreeLineOpacity', 0., 1.)
        .onChange(updateAllDegreeLineMaterial)
        .name('Opacity')
        .step(.01);
    degreeLineFolder.addColor(guiParams, 'degreeLineColor').onChange(updateAllDegreeLineMaterial).name('Color')
        .listen();
    degreeLineFolder.add(guiParams, 'degreeLineReset').name('Reset');

    const fileLoadFolder = gui.addFolder('Load files');
    const csvLoadFolder = fileLoadFolder.addFolder('CSV');
    csvLoadFolder.add(guiParams, 'loadMontageCsvFile').name('Coordinates');
    csvLoadFolder.add(guiParams, 'loadMontageLabelsCsvFile').name('Labels');
    csvLoadFolder.add(guiParams, 'loadConnectivityMatrixCsvFile').name('Matrix');
    fileLoadFolder.add(guiParams, 'loadJson').name('Json');

    const exportFileFolder = gui.addFolder('Export');
    exportFileFolder.add(guiParams, 'export2dImage').name('Picture (.tif)');
    exportFileFolder.add(guiParams, 'export3Dgltf').name('Object (.gltf)');

    const logsFolder = gui.addFolder('Logs');
    logsFolder.add(guiParams, 'showLogs').name("Show");
    logsFolder.add(guiParams, 'hideLogs').name("Hide");
}

export {
    guiParams,
    guiControllers,
    setupGui
}
