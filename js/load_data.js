
import * as THREE from "three";
import { sensorMeshList } from "./draw_sensors";
 
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
    let splitted_row = row.split(",");
    splitted_row = splitted_row.map((x) => parseFloat(x));
    return [splitted_row[1], splitted_row[2], splitted_row[0]];
}

export function parseRowCortexTri(row) {
    const splitted_row = row.split(",");
    return [parseInt(splitted_row[0]), parseInt(splitted_row[1]), parseInt(splitted_row[2])];
}

export function loadJsonData(url){
    return loadData(url, 'json file', jsonOnloadCallback);
}

export function jsonLoadingNodeCheckForError(key, value,i){
    let e;
    if (value.position == null){
      e = new TypeError("Position missing for node " + i.toString());
    }
    else if (value.position.x == null){
      e = new TypeError("Position coordinate x missing for node " + i.toString());
    }
    else if (value.position.y == null){
      e = new TypeError("Position coordinate y missing for node " + i.toString());
    }
    else if (value.position.z == null){
      e = new TypeError("Position coordinate z missing for node " + i.toString());
    }
    else if(isNaN(value.position.x)){
      e = new TypeError("Node " + i.toString() + " has a NaN x coordinate (value = " + value.position.x + ")");
    }
    else if(isNaN(value.position.y)){
      e = new TypeError("Node " + i.toString() + " has a NaN y coordinate (value = " + value.position.y + ")");
    }
    else if(isNaN(value.position.z)){
      e = new TypeError("Node " + i.toString() + " has a NaN z coordinate (value = " + value.position.z + ")");
    }
  
    if (e){
      if (value.label){
        e.message = e.message + " (" + value.label + ")";
      }
      throw e;
    }
    return;
  }

export function jsonLoadingEdgeCheckForError(key, value,i, nodeCount){
  let e;
  if (value.source == null){
    e = new TypeError("Source missing for edge " + i.toString());
  }
  else if (value.target == null){
    e = new TypeError("Target missing for edge " + i.toString());
  }
  else if(isNaN(value.source)){
    e = new TypeError("Edge " + i.toString() + " has a NaN source (value = " + value.source + ")");
  }
  else if(isNaN(value.target)){
    e = new TypeError("Edge " + i.toString() + " has a NaN target (value = " + value.target + ")");
  }
  else if (value.source >= nodeCount){
    e = new TypeError("Source indice (" + value.source + ") is higher than number of nodes (" + nodeCount + ") for edge " + i.toString());
  }
  else if (value.target >= nodeCount){
    e = new TypeError("Target indice (" + value.target + ") is higher than number of nodes (" + nodeCount + ") for edge " + i.toString());
  }

  if (e){
    throw e;
  }
  return;
}

export function csvMontageLoadingCheckForError(data){
  let i = 0;
  for (let row of data){
    if (row.length != 3){
        throw new TypeError("Row "+ i + " has " + row.length + 'values , should be 3. (N.B. : separator is \',\' character).');
    }
    if (isNaN(row[0])){
        throw new TypeError("Can't convert value to integer. (row " + i +")");
    }
    if (isNaN(row[1])){
        throw new TypeError("Can't convert value to integer. (row " + i +")");
    }
    if (isNaN(row[2])){
        throw new TypeError("Can't convert value to integer. (row " + i +")");
    }
    i++;
}

  return;
}

export function csvSensorCoordinatesCheckForError(data){
  
}

export function csvConnectivityMatrixCheckForError(data){
  if (data.length != sensorMeshList.length){
    throw new TypeError("Number of rows of file (" + (data.length + 1) + ") differs from count of sensors (" + (sensorMeshList.length + 1) + ")")
  }
  let i = 0;
  for (let row of data){
    const values = row.split(',');
    if (values.length != sensorMeshList.length){
      throw new TypeError("Number of values of row " + i + " of file (" + (values.length + 1) + ") differs from count of sensors (" + (sensorMeshList.length + 1) + ")")
    }
    i++;
  }
}

