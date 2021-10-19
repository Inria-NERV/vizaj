import { gui, controls } from '../public/main';
import { generateLinkLineMesh, generateLinkVolumeMesh, redrawLinks, updateVisibleLinks } from './draw_links';
import { updateBrainMeshVisibility } from './draw_cortex';

const guiParams = {
    loadFile: () => document.getElementById('fileInput').click(),

    autoRotateCamera: false,
    autoRotateSpeed: 2.0,
    minStrengthToDisplay: 0.,
    maxStrengthToDisplay: .2,
    showBrain: true,

    linkHeight: 0.5,
    linkTopPointHandleDistances: .25,
    linkSensorAngles: 3 / 8,
    linkSensorHandleDistances: 1,
    linkTopPointAngle: 0,

    defaultLinkGeometry: () => {
        guiParams.linkHeight = 0.75;
        guiParams.linkTopPointHandleDistances = 0.5;
        guiParams.linkSensorAngles = 3 / 8;
        guiParams.linkSensorHandleDistances = 0.;
        redrawLinks();
    },
    bellLinkGeometry: () => {
        guiParams.linkHeight = 0.75;
        guiParams.linkTopPointHandleDistances = 0.5;
        guiParams.linkSensorAngles = 0.;
        guiParams.linkSensorHandleDistances = .5;
        redrawLinks();
    },
    triangleLinkGeometry: () => {
        guiParams.linkHeight = 0.75;
        guiParams.linkTopPointHandleDistances = 0;
        guiParams.linkSensorAngles = 0.;
        guiParams.linkSensorHandleDistances = 0.;
        redrawLinks();
    },
    roundedSquareLinkGeometry: () => {
        guiParams.linkHeight = 0.5;
        guiParams.linkTopPointHandleDistances = 1.;
        guiParams.linkSensorAngles = 0.5;
        guiParams.linkSensorHandleDistances = 1.;
        redrawLinks();
    },
    peakLinkGeometry: () => {
        guiParams.linkHeight = 0.75;
        guiParams.linkTopPointHandleDistances = 0;
        guiParams.linkSensorAngles = 0.;
        guiParams.linkSensorHandleDistances = 1.;
        redrawLinks();
    },

    generateLinkMesh: generateLinkLineMesh,
    makeLinkLineMesh: () => changeLinkMesh(generateLinkLineMesh),
    makeLinkVolumeMesh: () => changeLinkMesh(generateLinkVolumeMesh),
    linkThickness: 1.
    
  };

function changeLinkMesh(generateLinkMethod){
    guiParams.generateLinkMesh = generateLinkMethod;
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
    linkGeometry.add(guiParams, 'linkHeight', 0, 2).onChange(redrawLinks).listen();
    linkGeometry.add(guiParams, 'linkTopPointHandleDistances', 0, 1).onChange(redrawLinks).listen();
    linkGeometry.add(guiParams, 'linkSensorAngles', 0, 1).onChange(redrawLinks).listen();
    linkGeometry.add(guiParams, 'linkSensorHandleDistances', 0, 1).onChange(redrawLinks).listen();
    //This one below is messy
    //linkGeometry.add(guiParams, 'linkTopPointAngle', -2, 2).onChange(redrawLinks).listen();

    const premadeLinkGeometries = gui.addFolder('premadeLinkGeometries');
    premadeLinkGeometries.add(guiParams, 'defaultLinkGeometry').name('Default');
    premadeLinkGeometries.add(guiParams, 'bellLinkGeometry').name('Bell');
    premadeLinkGeometries.add(guiParams, 'triangleLinkGeometry').name('Triangle');
    premadeLinkGeometries.add(guiParams, 'roundedSquareLinkGeometry').name('Rounded square');
    premadeLinkGeometries.add(guiParams, 'peakLinkGeometry').name('Peak');

    const linkVolume = gui.addFolder('linkVolume');
    linkVolume.add(guiParams, 'makeLinkLineMesh').name('Line');
    linkVolume.add(guiParams, 'makeLinkVolumeMesh').name('Volume');
    linkVolume.add(guiParams, 'linkThickness', 0, 4).onChange(redrawLinks);

    gui.add(guiParams, 'loadFile').name('Load CSV file');
}

export {
    guiParams,
    setupGui
}
