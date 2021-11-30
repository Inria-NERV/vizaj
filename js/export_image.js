import { renderer, scene } from "../public/main";
import { GLTFExporter } from '../node_modules/three/examples/jsm/exporters/GLTFExporter.js';

const strMime = 'image/bmp';

function export3Dgltf(){
    exportGLTF(scene);
}

function exportGLTF( scene ) {
    const gltfExporter = new GLTFExporter();
    const options = {};
    gltfExporter.parse(
        scene,
        function( gltf ){
            const output = JSON.stringify( gltf, null, 2 );
            const blob = new Blob( [ output ], { type: 'text/plain' } );
            const blobData = URL.createObjectURL( blob );
            console.log(blobData);
            saveFile( blobData, 'scene.gltf' );
        },
        function(error){ 
            console.log(error);
        },
        options
    );

}

function export2DImage(){
    try {
        const imgData = renderer.domElement.toDataURL(strMime);
        saveFile(imgData, "scene.bmp");
    } catch (e){
        console.log(e);
        return;
    }
}


function saveFile(strData, filename) {
    var link = document.createElement('a');
    if (typeof link.download === 'string') {
        document.body.appendChild(link); //Firefox requires the link to be in the body
        link.download = filename;
        link.href = strData;
        link.click();
        document.body.removeChild(link); //remove the link when done
    } else {
        location.replace(uri);
    }
}

export {
    export2DImage,
    export3Dgltf
}