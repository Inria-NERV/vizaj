import { gui, controls,
    csvConnMatrixInput,
    csvNodePositionsInput,
    csvNodeLabelsInput,
    jsonInput } from '../public/main';
import { redrawLinks, updateLinkOutline, updateVisibleLinks } from './link_builder/draw_links';
import{ linkLineGenerator, linkVolumeGenerator } from './link_builder/link_mesh_generator';
import { updateBrainMeshVisibility } from './draw_cortex';
import { updateDegreeLinesVisibility } from './draw_degree_line';
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
    linkAlignmentTarget: 30,
    resetLinkAlignmentTarget: ()=>{
        guiParams.linkAlignmentTarget = 30;
        redrawLinks();
    },
    maximumLinkAligmnentTarget: ()=> {
        guiParams.linkAlignmentTarget = 1000000;
        redrawLinks();
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

    const linkAlignmentTarget = gui.addFolder('Link alignment target');
    linkAlignmentTarget.add(guiParams, 'linkAlignmentTarget')
        .onChange(redrawLinks)
        .name('Link alignment')
        .listen();
    linkAlignmentTarget.add(guiParams, 'resetLinkAlignmentTarget')
        .name('Reset');
    linkAlignmentTarget.add(guiParams, 'maximumLinkAligmnentTarget')
        .name('Maximum');  

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
    const csvLoadFolder = fileLoadFolder.addFolder('CSV files');
    csvLoadFolder.add(guiParams, 'loadMontageCsvFile').name('Load coords');
    csvLoadFolder.add(guiParams, 'loadMontageLabelsCsvFile').name('Load labels');
    csvLoadFolder.add(guiParams, 'loadConnectivityMatrixCsvFile').name('Conn matrix');
    fileLoadFolder.add(guiParams, 'loadJson').name('Json files');

    const exportFileFolder = gui.addFolder('Export as file');
    exportFileFolder.add(guiParams, 'export2dImage').name('Export 2D bmp');
    exportFileFolder.add(guiParams, 'export3Dgltf').name('Export 3D gltf');

}

export {
    guiParams,
    setupGui
}
