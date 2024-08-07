
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
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

export async function loadGltfModel(url, dataName='', onLoadCallback = (gltf) => {return gltf.scene.children[0].geometry;}){
  const loader = new GLTFLoader();
  let geometry;
  await new Promise((resolve, reject) =>
      loader.load(url,
          function ( gltf ) {
              geometry = onLoadCallback(gltf);
              resolve();
          },
          function ( xhr ) {
              console.log( 'Loading ' + dataName + ' : ' + ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
          },
          function ( error ) {
              console.log( error );
              reject();
          }
      )
  );
  return geometry;
}

function onloadCallback(data, parseRowMethod){
    const dataOut = [];
    let rows = data.split('\n');
    const lastRow = rows.pop();
    for (let row of rows){
        dataOut.push(parseRowMethod(row));
    }
    if (lastRow){
      dataOut.push(parseRowMethod(lastRow));
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
    return splitted_row.map((x) => parseFloat(x));
}

export function parseRowCortexTri(row) {
    const splitted_row = row.split(",");
    return [parseInt(splitted_row[0]), parseInt(splitted_row[1]), parseInt(splitted_row[2])];
}

export function loadJsonData(url){
    return loadData(url, 'json file', jsonOnloadCallback);
}

export function jsonLoadingNodeCheckForError(key, value,i, sensorIdMap){
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
    else if (isNaN(value.id)){
      e = new TypeError("id missing for node " + i.toString());
    }
    else if (sensorIdMap.get(value.id)){
      e = new TypeError("duplicate node id " + value.id.toString());
    }
  
    if (e){
      if (value.label){
        e.message = e.message + " (" + value.label + ")";
      }
      throw e;
    }
    return;
  }

export function jsonLoadingEdgeCheckForError(key, value,i, nodeCount, sensorIdMap){
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
  else if (isNaN(sensorIdMap.get(value.source.toString()))){
    e = new TypeError("Source node id not existing (\"" + value.source.toString() +"\") for edge " + i.toString());
  }
  else if (isNaN(sensorIdMap.get(value.target.toString()))){
    e = new TypeError("Target node not existing (\"" + value.target.toString() +"\") for edge " + i.toString());
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
        throw new TypeError("Row "+ i + " has " + row.length + ' values , should be 3. (N.B. : separator is \',\' character).');
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

export function csvSensorLabelsCheckForError(data){

}

export function csvConnectivityMatrixCheckForError(matrix) {
  if (matrix.length !== sensorMeshList.length) {
      throw new TypeError(`Number of rows (${matrix.length}) differs from count of sensors (${sensorMeshList.length})`);
  }
  matrix.forEach((row, i) => {
      if (row.length !== sensorMeshList.length) {
          throw new TypeError(`Row ${i} has ${row.length} values, expected ${sensorMeshList.length}`);
      }
  });
}
