import { gui, controls,
    linkMeshList,
    csvConnMatrixInput,
    csvNodePositionsInput,
    csvNodeLabelsInput,
    jsonInput } from '../public/main';
import { redrawLinks, updateLinkOutline, updateVisibleLinks } from './link_builder/draw_links';
import{ linkLineGenerator, linkVolumeGenerator } from './link_builder/link_mesh_generator';
import { hideBrain, showBrain, updateBrainMeshVisibility } from './draw_cortex';
import { getSplinePointsScalp } from './link_builder/compute_link_shape';
import { getSplinePointsPlane } from './link_builder/compute_link_shape_2D';
import { setMneMontage } from './draw_sensors';
import { updateDegreeLinesVisibility, updateLinkVisibilityByLinkDegree } from './draw_degree_line';
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
    averageDegree: 1.,

    linkHeight: 0.75,
    linkTopPointHandleDistances: .5,
    linkSensorAngles: 3 / 8,
    linkSensorHandleDistances: 0.,
    linkTopPointAngle: 0.,

    linkGenerator: linkLineGenerator,

    makeLinkLineMesh: () => changeLinkMesh(linkLineGenerator),
    makeLinkVolumeMesh: () => changeLinkMesh(linkVolumeGenerator),
    linkThickness: 1.,

    splinePointsGeometry: 0,

    mneMontage: -1,

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

let getSplinePoints = getSplinePointsScalp;

const splinePointsGeometry = {
    'scalp': 0, 
    'flat': 1
};

function toggleMontageShape(){
    if (guiParams.splinePointsGeometry != 0){
        hideBrain();
        getSplinePoints = getSplinePointsPlane
    } else {
        showBrain();
        getSplinePoints = getSplinePointsScalp
    }
    premadeLinkGeometriesParam.defaultLinkGeometry();
    redrawLinks();
}

const montages = {'EGI_256': 0,
    'GSN-HydroCel-128': 1,
    'GSN-HydroCel-129': 2,
    'GSN-HydroCel-256': 3,
    'GSN-HydroCel-257': 4,
    'GSN-HydroCel-32': 5,
    'GSN-HydroCel-64_1.0': 6,
    'GSN-HydroCel-65_1.0': 7,
    'biosemi128': 8,
    'biosemi16': 9,
    'biosemi160': 10,
    'biosemi256': 11,
    'biosemi32': 12,
    'biosemi64': 13,
    'easycap-M1': 14,
    'easycap-M10': 15,
    'mgh60': 16,
    'mgh70': 17,
    'standard_1005': 18,
    'standard_1020': 19,
    'standard_alphabetic': 20,
    'standard_postfixed': 21,
    'standard_prefixed': 22,
    'standard_primed': 23};

const defaultMontageCoordinates = [
    require('../data/sensor_montages/EGI_256_coordinates.csv'),
    require('../data/sensor_montages/GSN-HydroCel-128_coordinates.csv'),
    require('../data/sensor_montages/GSN-HydroCel-129_coordinates.csv'),
    require('../data/sensor_montages/GSN-HydroCel-256_coordinates.csv'),
    require('../data/sensor_montages/GSN-HydroCel-257_coordinates.csv'),
    require('../data/sensor_montages/GSN-HydroCel-32_coordinates.csv'),
    require('../data/sensor_montages/GSN-HydroCel-64_1.0_coordinates.csv'),
    require('../data/sensor_montages/GSN-HydroCel-65_1.0_coordinates.csv'),
    require('../data/sensor_montages/biosemi128_coordinates.csv'),
    require('../data/sensor_montages/biosemi16_coordinates.csv'),
    require('../data/sensor_montages/biosemi160_coordinates.csv'),
    require('../data/sensor_montages/biosemi256_coordinates.csv'),
    require('../data/sensor_montages/biosemi32_coordinates.csv'),
    require('../data/sensor_montages/biosemi64_coordinates.csv'),
    require('../data/sensor_montages/easycap-M1_coordinates.csv'),
    require('../data/sensor_montages/easycap-M10_coordinates.csv'),
    require('../data/sensor_montages/mgh60_coordinates.csv'),
    require('../data/sensor_montages/mgh70_coordinates.csv'),
    require('../data/sensor_montages/standard_1005_coordinates.csv'),
    require('../data/sensor_montages/standard_1020_coordinates.csv'),
    require('../data/sensor_montages/standard_alphabetic_coordinates.csv'),
    require('../data/sensor_montages/standard_postfixed_coordinates.csv'),
    require('../data/sensor_montages/standard_prefixed_coordinates.csv'),
    require('../data/sensor_montages/standard_primed_coordinates.csv')];

const defaultMontageLabels = [
    require('../data/sensor_montages/EGI_256_labels.csv'),
    require('../data/sensor_montages/GSN-HydroCel-128_labels.csv'),
    require('../data/sensor_montages/GSN-HydroCel-129_labels.csv'),
    require('../data/sensor_montages/GSN-HydroCel-256_labels.csv'),
    require('../data/sensor_montages/GSN-HydroCel-257_labels.csv'),
    require('../data/sensor_montages/GSN-HydroCel-32_labels.csv'),
    require('../data/sensor_montages/GSN-HydroCel-64_1.0_labels.csv'),
    require('../data/sensor_montages/GSN-HydroCel-65_1.0_labels.csv'),
    require('../data/sensor_montages/biosemi128_labels.csv'),
    require('../data/sensor_montages/biosemi16_labels.csv'),
    require('../data/sensor_montages/biosemi160_labels.csv'),
    require('../data/sensor_montages/biosemi256_labels.csv'),
    require('../data/sensor_montages/biosemi32_labels.csv'),
    require('../data/sensor_montages/biosemi64_labels.csv'),
    require('../data/sensor_montages/easycap-M1_labels.csv'),
    require('../data/sensor_montages/easycap-M10_labels.csv'),
    require('../data/sensor_montages/mgh60_labels.csv'),
    require('../data/sensor_montages/mgh70_labels.csv'),
    require('../data/sensor_montages/standard_1005_labels.csv'),
    require('../data/sensor_montages/standard_1020_labels.csv'),
    require('../data/sensor_montages/standard_alphabetic_labels.csv'),
    require('../data/sensor_montages/standard_postfixed_labels.csv'),
    require('../data/sensor_montages/standard_prefixed_labels.csv'),
    require('../data/sensor_montages/standard_primed_labels.csv')];


function setupGui() {
    const cameraFolder = gui.addFolder('Camera');
    cameraFolder.add(guiParams, 'autoRotateCamera').onChange( () => {controls.autoRotate = guiParams.autoRotateCamera} );
    cameraFolder.add(guiParams, 'autoRotateSpeed', 0, 35 ).onChange( (value) => {controls.autoRotateSpeed = value} );

    const linksToDisplayFolder = gui.addFolder('Connection density');
    linksToDisplayFolder.add(guiParams, 'maxStrengthToDisplay', 0., 1.)
        .name('Density')
        .onChange (() => updateVisibleLinks())
        .listen();
    gui.add(guiParams, 'showBrain').onChange(updateBrainMeshVisibility);

    const linkGeometry = gui.addFolder('linkGeometry');
    linkGeometry.add(guiParams, 'linkHeight', 0, 2).onChange(updateLinkOutline).listen();
    linkGeometry.add(guiParams, 'linkTopPointHandleDistances', 0, 1).onChange(updateLinkOutline).listen();
    linkGeometry.add(guiParams, 'linkSensorAngles', 0, 1).onChange(updateLinkOutline).listen();
    linkGeometry.add(guiParams, 'linkSensorHandleDistances', 0, 1).onChange(updateLinkOutline).listen();
    //This one below is messy
    //linkGeometry.add(guiParams, 'linkTopPointAngle', -2, 2).onChange(redrawLinks).listen();

    const premadeLinkGeometries = gui.addFolder('premadeLinkGeometries');
    premadeLinkGeometries.add(premadeLinkGeometriesParam, 'defaultLinkGeometry').name('Default');
    premadeLinkGeometries.add(premadeLinkGeometriesParam, 'bellLinkGeometry').name('Bell');
    premadeLinkGeometries.add(premadeLinkGeometriesParam, 'triangleLinkGeometry').name('Triangle');
    premadeLinkGeometries.add(premadeLinkGeometriesParam, 'roundedSquareLinkGeometry').name('Rounded square');
    premadeLinkGeometries.add(premadeLinkGeometriesParam, 'peakLinkGeometry').name('Peak');

    const linkVolume = gui.addFolder('linkVolume');
    linkVolume.add(guiParams, 'makeLinkLineMesh').name('Line');
    linkVolume.add(guiParams, 'makeLinkVolumeMesh').name('Volume');
    linkVolume.add(guiParams, 'linkThickness', 0, 4).onChange(redrawLinks);

    const degreeLineFolder = gui.addFolder('Node degree');
    //degreeLineFolder.add(guiParams, 'averageDegree', 0).onChange(updateLinkVisibilityByLinkDegree).listen().name('Average degree');
    degreeLineFolder.add(guiParams, 'showDegreeLines').onChange(updateDegreeLinesVisibility).name('Show degree line');

    const fileLoadFolder = gui.addFolder('Load files');
    fileLoadFolder.add(guiParams, 'splinePointsGeometry')
        .options(splinePointsGeometry).onChange(toggleMontageShape)
        .name('Geometry');
    const csvLoadFolder = fileLoadFolder.addFolder('CSV files');
    csvLoadFolder.add(guiParams, 'loadMontageCsvFile').name('Load coords');
    csvLoadFolder.add(guiParams, 'loadMontageLabelsCsvFile').name('Load labels');
    csvLoadFolder.add(guiParams, 'loadConnectivityMatrixCsvFile').name('Conn matrix');
    fileLoadFolder.add(guiParams, 'loadJson').name('Json files');
    fileLoadFolder.add(guiParams, 'mneMontage').options(montages).onChange(setMneMontage).name('Mne montage').listen();

    const exportFileFolder = gui.addFolder('Export as file');
    exportFileFolder.add(guiParams, 'export2dImage').name('Export 2D bmp');
    exportFileFolder.add(guiParams, 'export3Dgltf').name('Export 3D gltf');

}

export {
    guiParams,
    setupGui,
    defaultMontageCoordinates,
    defaultMontageLabels,
    getSplinePoints
}
