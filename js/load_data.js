
import * as THREE from "three";
 
export async function loadData(url, dataName, onLoadCallback = defaultOnLoadCallback){
    const loader = new THREE.FileLoader();
    var dataOut = [];
    await new Promise((resolve, reject) => 
        loader.load( url,
            function (data){
                dataOut = onLoadCallback(data);
                resolve();
            },
            function (xhr) {console.log( 'Loading '+dataName+' : ' + xhr.loaded / xhr.total * 100 + '% loaded' )},
            function(err)  {
                console.error(err);
                reject();
            }
        )
    );
    return dataOut;
}

function onloadCallback(data, parseRowMethod){
    const dataOut = [];
    for (let row of data.split('\n').filter(x => x !== null && x !== '')){
        dataOut.push(parseRowMethod(row));
    }
    return dataOut;
}

export function defaultOnLoadCallback(data) {return onloadCallback(data, (x)=>x); }

export function csv3dCoordinatesOnLoadCallBack(data) {
    return onloadCallback(data, parseCsv3dCoordinatesRow);
}

function jsonOnloadCallback(data){
    return JSON.parse(data);
}

export function parseCsv3dCoordinatesRow(row) { 
    const splitted_row = row.split(",").map((x) => parseFloat(x));
    return [splitted_row[1], splitted_row[2], splitted_row[0]];
}

export function parseRowCortexTri(row) {
    const splitted_row = row.split(",");
    return [parseInt(splitted_row[0]), parseInt(splitted_row[1]), parseInt(splitted_row[2])];
}

export function loadJsonData(url){
    return loadData(url, 'json file', jsonOnloadCallback);
}

