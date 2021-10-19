
import * as THREE from "three";
 
export async function loadData(url, dataName, parseRowMethod=(x) => x, onLoadCallback = defaultOnLoadCallBack){
    const loader = new THREE.FileLoader();
    var dataOut = [];
    await new Promise((resolve, reject) => 
        loader.load( url,
            function (data){
                dataOut = onLoadCallback(data, parseRowMethod);
                resolve();
            },
            function (xhr) {console.log( ('Loading '+dataName+' : ' + xhr.loaded / xhr.total * 100) + '% loaded' )},
            function(err)  {console.error(err)}
        )
    );
    return dataOut;
}

function defaultOnLoadCallBack(data, parseRowMethod)
{
    const dataOut = [];
    for (let row of data.split('\n')){
        dataOut.push(parseRowMethod(row));
    }
    return dataOut;
}

export function parseCsv3dCoordinatesRow(row) { 
    const splitted_row = row.split(",").map((x) => parseFloat(x));
    return [splitted_row[1], splitted_row[2], splitted_row[0]];
}