
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

export function jsonLoadingNodeCheckForError(key, value,i, fileName){
    let e;
    if (value.position == null){
      e = new TypeError("Couldn't load file " + fileName + " : position missing for node " + i.toString());
    }
    else if (value.position.x == null){
      e = new TypeError("Couldn't load file " + fileName + " : position coordinate x missing for node " + i.toString());
    }
    else if (value.position.y == null){
      e = new TypeError("Couldn't load file " + fileName + " : position coordinate y missing for node " + i.toString());
    }
    else if (value.position.z == null){
      e = new TypeError("Couldn't load file " + fileName + " : position coordinate z missing for node " + i.toString());
    }
  
  
    if (e){
      if (value.label){
        e.message = e.message + " (" + value.label + ")";
      }
      throw e;
    }
    return;
  }

