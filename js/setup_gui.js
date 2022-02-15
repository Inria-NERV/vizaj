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
import { redrawLinks, colorMapSprite, updateLinkOutline, updateVisibleLinks, updateAllLinkMaterial, ecoFiltering } from './link_builder/draw_links';
import{ linkLineGenerator, linkVolumeGenerator } from './link_builder/link_mesh_generator';
import { updateBrainMeshVisibility, 
    updateExtraItemMaterial,
    updateExtraItemMesh,
    translateModeTransformControls,
    rotateModeTransformControls,
    scaleModeTransformControls,
    resetPositionExtraItemMesh } from './draw_cortex';
import { redrawDegreeLines, updateAllDegreeLineLength, updateAllDegreeLineMaterial, updateAllDegreeLineVisibility } from './draw_degree_line';
import { export2DImage, export3Dgltf, isExporting2DImage } from './export_image';
import { updateBackgroundColor, resetBackgroundColor } from './add_light_and_background';

const guiParams = {
    loadConnectivityMatrixCsvFile: () => csvConnMatrixInput.click(),
    loadMontageCsvFile: () => {csvNodePositionsInput.click();},
    loadMontageLabelsCsvFile: () => {csvNodeLabelsInput.click();},
    loadJson: () => {jsonInput.click()},

    autoRotateCamera: false,
    autoRotateSpeed: 2.0,
    maxStrengthToDisplay: .2,

    backgroundColor: '#111133',
    resetBackgroundColor: resetBackgroundColor,

    showExtraItem: true,
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
    linkAlignmentTarget: 30,

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
    
  };

const premadeLinkGeometriesList = ['Default', 'Bell', 'Triangle', 'Circle', 'Circle2', 'Rounded square', 'Peak', 'Flat'];
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
        case 'Flat':
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

function setupGui() {
    const cameraFolder = gui.addFolder('Camera');
    cameraFolder.add(guiParams, 'autoRotateCamera').onChange( () => {controls.autoRotate = guiParams.autoRotateCamera} )
        .name('Rotate');
    cameraFolder.add(guiParams, 'autoRotateSpeed', 0, 35 ).onChange( (value) => {controls.autoRotateSpeed = value} )
        .name('Rotation speed');

    const backgroundFolder = gui.addFolder('Background');
    backgroundFolder.addColor(guiParams, 'backgroundColor').onChange(updateBackgroundColor).name('color').listen();
    backgroundFolder.add(guiParams, 'resetBackgroundColor').name('reset color');

    const linksToDisplayFolder = gui.addFolder('Filtering');
    linksToDisplayFolder.add(guiParams, 'maxStrengthToDisplay', 0., 1.)
        .name('Density')
        .onChange (() => updateVisibleLinks())
        .listen();
    linksToDisplayFolder.add(guiParams, 'ecoFiltering').name('ECO');

    const extraItemFolder = gui.addFolder('Extra item');
    extraItemFolder.add(guiParams, 'showExtraItem').onChange(updateBrainMeshVisibility).name('Show');
    extraItemFolder.addColor(guiParams, 'colorExtraItem').name('Color').onChange(updateExtraItemMaterial).listen();
    extraItemFolder.add(guiParams, 'resetExtraItemColor').name('Reset color');
    extraItemFolder.add(guiParams, 'extraItemMeshShape',
        ['brain', 'sphere', 'cube'])
        .name('Shape').onChange(updateExtraItemMesh);
    const moveExtraItemFolder = extraItemFolder.addFolder('Move extra item');
    moveExtraItemFolder.add(guiParams, 'translateModeTransformControls').name('Translate');
    moveExtraItemFolder.add(guiParams, 'rotateModeTransformControls').name('Rotate');
    moveExtraItemFolder.add(guiParams, 'scaleModeTransformControls').name('Scale');
    moveExtraItemFolder.add(guiParams, 'resetExtraItemPosition').name('Reset');

    const sensorFolder = gui.addFolder('Nodes');
    sensorFolder.add(guiParams, 'sensorRadiusFactor', 0., 1.).onChange(updateAllSensorRadius).listen().name('Radius');
    sensorFolder.add(guiParams, 'sensorOpacity', 0., 1.).onChange(updateAllSensorMaterial).listen().name('Opacity');
    sensorFolder.addColor(guiParams, 'sensorColor').onChange(updateAllSensorMaterial).listen().name('Color');
    sensorFolder.add(guiParams, 'sensorReset').name('Reset');

    const linkFolder = gui.addFolder('Link');
    const linkGeometryFolder = linkFolder.addFolder('Geometry');
    linkGeometryFolder.add(guiParams, 'linkHeight', 0, 2).onChange(updateLinkOutline).listen().name('Height');
    linkGeometryFolder.add(guiParams, 'linkTopPointHandleDistances', 0, 1).onChange(updateLinkOutline).listen().name('Top point handle distance');
    linkGeometryFolder.add(guiParams, 'linkSensorAngles', 0, 1).onChange(updateLinkOutline).listen().name('Sensor angle');
    linkGeometryFolder.add(guiParams, 'linkSensorHandleDistances', 0, 1).onChange(updateLinkOutline).listen().name('Sensor handle distance');
    //we purposedly don't allow change of top point angle

    const colorMapFolder = linkFolder.addFolder('Color map');
    colorMapFolder.add(guiParams, 'linkColorMap', ['rainbow', 'cooltowarm', 'blackbody', 'grayscale']).onChange(updateAllLinkMaterial).name('Color map');
    colorMapFolder.add(guiParams, 'showColorMap').onChange(() => {colorMapSprite.show(guiParams.showColorMap)}).name('Show color bar');

    linkGeometryFolder.add(guiParams, 'linkGeometry', premadeLinkGeometriesList).onChange(updateDefaultLinkGeometry).name('Geometry');

    const linkAlignmentTarget = linkFolder.addFolder('Link alignment target');
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
    linkAlignmentTarget.add(guiParams, 'minimumLinkAligmnentTarget')
        .name('Minimum');  

    const linkVolumeFolder = linkFolder.addFolder('Link radius');
    linkVolumeFolder.add(guiParams, 'makeLinkLineMesh').name('Line');
    linkVolumeFolder.add(guiParams, 'makeLinkVolumeMesh').name('Volume');
    linkVolumeFolder.add(guiParams, 'linkThickness', 0, 4).onChange(linkThicknessUpdate).listen().name('Link radius');

    linkFolder.add(guiParams, 'linkOpacity', 0., 1.).onChange(updateAllLinkMaterial).listen().name('Opacity');

    const degreeLineFolder = gui.addFolder('Degree lines');
    degreeLineFolder.add(guiParams, 'showDegreeLines').onChange(updateAllDegreeLineVisibility).name('Show degree line').listen();
    degreeLineFolder.add(guiParams, 'degreeLineRadius', 0., 1.).onChange(redrawDegreeLines).name('Radius').listen();
    degreeLineFolder.add(guiParams, 'degreeLineLength', 0., 1.).onChange(updateAllDegreeLineLength).name('Length').listen();
    degreeLineFolder.add(guiParams, 'degreeLineOpacity', 0., 1.).onChange(updateAllDegreeLineMaterial).listen().name('Opacity');
    degreeLineFolder.addColor(guiParams, 'degreeLineColor').onChange(updateAllDegreeLineMaterial).listen().name('Color');
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

}

export {
    guiParams,
    setupGui
}
