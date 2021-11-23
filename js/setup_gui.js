import { gui, controls } from '../public/main';
import { redrawLinks, updateLinkOutline, updateVisibleLinks, clearLinks, loadAndDrawLinks } from './link_builder/draw_links';
import{ linkLineGenerator, linkVolumeGenerator } from './link_builder/link_mesh_generator';
import { hideBrain, updateBrainMeshVisibility } from './draw_cortex';
import { getSplinePoints } from './link_builder/compute_link_shape';
import { getSplinePointsPlane } from './link_builder/compute_link_shape_2D';
import { clearAllSensors, loadAndDrawSensors } from './draw_sensors';
import { updateDegreeLinesVisibility, updateAllDegreeLines } from './draw_degree_line';

const guiParams = {
    loadFile: () => document.getElementById('fileInput').click(),

    autoRotateCamera: false,
    autoRotateSpeed: 2.0,
    minStrengthToDisplay: 0.,
    maxStrengthToDisplay: .2,
    showBrain: true,
    showDegreeLines: true,

    linkHeight: 0.75,
    linkTopPointHandleDistances: .5,
    linkSensorAngles: 3 / 8,
    linkSensorHandleDistances: 0.,
    linkTopPointAngle: 0.,

    linkGenerator: linkLineGenerator,

    makeLinkLineMesh: () => changeLinkMesh(linkLineGenerator),
    makeLinkVolumeMesh: () => changeLinkMesh(linkVolumeGenerator),
    linkThickness: 1.,

    getSplinePoints: getSplinePoints,

    link2dTest: () => { 
        clearAllSensors();
        clearLinks();
        hideBrain();
        guiParams.getSplinePoints = getSplinePointsPlane;

        const sensorLabelsUrl = require('../data/2d/sensor_labels.csv');
        const sensorCoordinatesUrl = require('../data/2d/sensor_coordinates.csv');
        const connectivityMatrixUrl = require('../data/2d/conn_matrix.csv');

        loadAndDrawSensors(sensorCoordinatesUrl, sensorLabelsUrl);
        loadAndDrawLinks(connectivityMatrixUrl);
    }
    
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
    },

  }

function changeLinkMesh(linkGenerator){
    guiParams.linkGenerator = linkGenerator;
    redrawLinks();
}

function setupGui() {
    const cameraFolder = gui.addFolder('Camera');
    cameraFolder.add(guiParams, 'autoRotateCamera').onChange( () => {controls.autoRotate = guiParams.autoRotateCamera} );
    cameraFolder.add(guiParams, 'autoRotateSpeed', 0, 35 ).onChange( (value) => {controls.autoRotateSpeed = value} );

    const linksToDisplayFolder = gui.addFolder('LinksToDisplay');
    linksToDisplayFolder.add(guiParams, 'maxStrengthToDisplay', 0., 1.).onChange (() => updateVisibleLinks(guiParams.minStrengthToDisplay, guiParams.maxStrengthToDisplay));
    linksToDisplayFolder.add(guiParams, 'minStrengthToDisplay', 0., 1.).onChange (() => updateVisibleLinks(guiParams.minStrengthToDisplay, guiParams.maxStrengthToDisplay));
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

    const degreeLineFolder = gui.addFolder('degree line');
    degreeLineFolder.add(guiParams, 'showDegreeLines').onChange(updateDegreeLinesVisibility).name('show');

    gui.add(guiParams, 'loadFile').name('Load CSV file');

    gui.add(guiParams, 'link2dTest').name('link2dTest');

}

export {
    guiParams,
    setupGui
}
