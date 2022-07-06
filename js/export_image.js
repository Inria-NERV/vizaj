import { renderer, scene, onWindowResize, camera, uiScene, uiCamera, linkMeshList } from "../public/main";
import { GLTFExporter } from '../node_modules/three/examples/jsm/exporters/GLTFExporter.js';
import { ColorMapSprite } from './link_builder/color_map_sprite';
import { colorMapCanvas } from "./link_builder/draw_links";
import { guiParams } from "./setup_gui";

const strMime = 'image/tif';

let isExporting2DImage = false;

function export3Dgltf(){
    exportSceneToGLTF(scene);
}

async function exportSceneToGLTF( scene ) {
    const gltfExporter = new GLTFExporter();
    const options = {
        onlyVisible: true,
    };
    gltfExporter.parse(
        scene,
        function( gltf ){
            const output = JSON.stringify( gltf, null, 2 );
            const blob = new Blob( [ output ], { type: 'text/plain' } );
            const blobData = URL.createObjectURL( blob );
            saveFile( blobData, 'scene.gltf' );
        },
        function(error){ 
            console.log(error);
        },
        options
    );
}

async function export2DImage(){
    try {
        isExporting2DImage = true;
        let colorMapSprite;
        window.removeEventListener("resize", onWindowResize);
        await new Promise((resolve, reject)=> {
            if (linkMeshList && linkMeshList.length > 0 && guiParams.showColorMap) {
                colorMapSprite = new ColorMapSprite();
                colorMapSprite.draw();
            }
            renderer.setSize(3000, 3000 * window.innerHeight / window.innerWidth, false);
            renderer.render(scene, camera);
            renderer.render(uiScene, uiCamera);
            setTimeout(()=>{resolve()}, .1);
        });
        const imgData = renderer.domElement.toDataURL(strMime);
        saveFile(imgData, "network.tif");
        if (colorMapSprite){
            colorMapSprite.clear();
        }
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        window.addEventListener("resize", onWindowResize);
        isExporting2DImage = false;
    } catch (e){
        console.log(e);
        return;
    }
}

function saveFile(strData, filename) {
    var link = document.createElement('a');
    document.body.appendChild(link); //Firefox requires the link to be in the body
    link.download = filename;
    link.href = strData;
    link.click();
    document.body.removeChild(link);
}

export {
    export2DImage,
    export3Dgltf,
    isExporting2DImage
}