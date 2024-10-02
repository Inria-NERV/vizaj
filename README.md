Vizaj - A free online interactive software for visualizing spatial networks
=====

<img src="https://user-images.githubusercontent.com/81815333/193279909-d910edb2-e3c5-4875-b3f0-09d374a7dbb2.png" width="200" />

Vizaj is based on Three.js and the sofwtare is licensed under the terms of the BSD-3-Clause license.

This tool aims to be a 3d visualization tool for networks with fixed node position. It it provided with a GUI which helps customizing the nodes, links background, support item, camera and any extra informations.

The camera can be rotated by drag and drop. Right-click drag and drop translates the camera. Scrolling zooms and unzooms.

The online app can be accessed here: https://bci-net.github.io/vizaj/

# Citation

When citing Vizaj or using it for obtaining results and figures for publications, please also cite the journal article reference: 

> Rolland T, De Vico Fallani F (2023) Vizaj—A free online interactive software for visualizing spatial networks. PLoS ONE 18(3): e0282181. https://doi.org/10.1371/journal.pone.0282181

# Load data

Each node provided on the data generates a sphere that represents it. Each node needs to have a location and a strength. The strength is displayed in the color of the links, and can be used to filter the links we wish to display. The user specifies as input the graph density he wants. This density corresponds to the proportion of strongest links displayed.


The data can be loaded manually or read from a Websocket.

## Load data manually

Two file formats can be used to load data manually: .csv and .json (see BCI-NET/vizaj/data for some examples).

### .csv files

When loading using .csv files, the user needs to provide a node position file, a connectivity matrix file, and an optional label file.
The separator used by default is a comma ‘,’. 

The node position .csv file has a row per node, with x, y and z coordinates separated by commas. 
Each row of the label file is linked to its corresponding node. The entire row is parsed as the label of the node. The label can then be displayed on the scene. Note that the label file is entirely optional. Note that the coordinates should be loaded first, then the nodes will be computed and drawn, and only then the labels and connectivity matrix.

The connectivity matrix is a symmetric matrix. For each row i and column j of the lower triangle of the matrix, the algorithm draws a link of strength the value of the cell [i,j]. Given the example below, Vizaj would draw a network of three nodes and three links.

Example : 
position.csv
```
0,1,0
1.5,2,0
2.0,0,0
```

label.csv
```
label1
label2
label3
```

connectivity_matrix.csv:
```
0,.5,.8
.5,0,.2
.8,.2,0
```

### .json files

When working with .json files, a single file is necessary. It should include a *graph* item, which should have 2 element called *nodes* and *edges*.
The *nodes* item is a list which contains one item per node with elements : 
* *id*: the id of the node. It is required as it is the unique id used to know which are the end points of the links drawn.
* *label*: it is optional, it is the label of the node rendered when hovering over the node.
* *position*: contains *x*, *y* and *z*, the coordinates of the node. Those are mandatory and should be parsable as double.

The *edges* is a list which contains one item per link with elements : 
* *source* : the node id of the first end point.
* *target* : the node id of the second end point.
* *strength*v: the strength of the link. It should be parsable as double. Note that this field is required to have a value. In the case of graphs with links with no strength, one workaround is to specify the same strength for all links e.g. 1.

Note that the source and target ids of the edges should match the ids of the nodes. There can be some nodes with no links attached to it, but all edges need to have the two endpoints among the nodes.

Example: 
In this example below, 2 nodes are drawn with labels associated, and one link is drawn between them.
```
{
    "graph":{
        "nodes":[
            {
                "id": "id1",
                "label": "label1",
                "position":{
                    "x": 10,
                    "y": 0,
                    "z": -8
                }
            },
            {
                "id": "id2",
                "label": "label2",
                "position":{
                    "x": 10,
                    "y": 0,
                    "z": 8
                }
            }
        ],
        "edges":[
            {
                "source":"id1",
                "target":"id2",
                "strength":  1
            }
        ]
    }
}
```

## Read from a Websocket

The connectivity matrix can be read from a Websocket (see "Development" section to configure the Websocket). If data is streamed through the Websocket, the data is displayed in real time.


# GUI overview
In this section, we propose to explain the usage of each menu and button of the GUI.

<img width="247" alt="Capture d’écran 2022-07-05 à 11 59 39" src="https://user-images.githubusercontent.com/81815333/177303203-037ff82b-1953-4698-a2ab-77847ab42c2e.png">

Below is reviewed each section and buttons ofthe GUI : 

* *Camera* : 
The camera can be animated to rotate around the network displayed.
    * *Rotate* : trigger the rotation of the camera.
    * *Rotation speed* : change the rotation speed of the camera. If the rotate button is not checked, it has no effect.

* *Background* :
    * *Color* : set the color of the background. The color is encoded in hexadecimal code.
    * *Reset* : reset the background color to \#111133


* *Filtering* :
Set the value of connection density we wish to display. Only the highest values of strength are displayed.
    * *Density* : density of the network. This value is equal to 2l * n(n-1) with l the number of links, and n the number of nodes.
    * *ECO* : set the density equal to the ECO value of the graph (see : https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1005305 ).

* *Support* :
Manage the mesh that illustrates the network. 
    * *Show* : toggle visibility of the support mesh
    * *Color* : set the color of the mesh
    * *Reset color* : reset the color of the mesh to \#ffc0cb (pink).
    * *Shape* : change the mesh shape of the support item. Several options are provided: brain cortex, head scalp, inner skull surface, a sphere and a cube.
    * *Move support*: move and reshape the support item. Each button toggles a 3d helper.
        * *Translate* : toggle translation helper.
        * *Rotate* : toggle rotation helper.
        * *Scale* : toggle scale helper.
        * *Reset* : reset support mesh to its initial state.
        * *Close helper* : close any helper if it is active.
        * Undo* : undo last change.

* *Nodes*: 
Manage the radius, opacity and color of the links connecting the network.
    Radius* : change the radius of the nodes.
    * *Opacity* : change the opacity of the nodes.
    * *Color* : change the color of the nodes.
    * *Reset* : reset the radius, opacity and color of the nodes to their initial state.

* *Links* :
Manage the radius, opacity and color of the links that populate the network. For more information, check the paper (check the section *geometry of the links* ). The links are drawn and customized along values on the figures in the end of the document.
    * *Geometry* : Manage the link geometry as explained in part 3.1 .
        * *Height* : height of the link (distance h in figure).
        * *Top point handle distance* : influence of the handle on the top point, a higher value means a flatter link at its summit. A low value means a peak summit (This corresponds to the distance dU in the figure).
        * *Node angle* : this value times pi is the angle between the tangent axis to the link, and the link between the two nodes at the position of the node. (This corresponds to the value alpha in the figure).
        * *Node handle distance* : influence of the handle near the nodes (this value corresponds to the distance dS).
        * *Geometry* : this scrolling menu sets any of the the default geometries presented in the paper.
    * *Color map* : 
        * *Color map* : change the color map of the links. 4 maps are provided: rainbow, cool to warm, black body, and grey scale.
        * *Show color bar* : toggle visibility of the color bar.
    * *Link alignment target* : All links are facing a virtual point that evolves in a vertical axis. This menu provides configuration for its position, this point is the point C in the figures).
        * *Link alignment* : set the altitude of the virtual point C.
        * *Reset* : reset the link alignment to its initial state.
        * *Maximum* : set the alignment to a very large value. Each link faces up in a vertical plane. The maximum and minimum buttons are especially useful for plane networks.
        * *Minimum* : set the alignment to a very large negative value. Each link faces down in a vertical plane.
    * *Link radius* : change the radius of the links.
        * *Line* : set the link radius to 0.
        * *Volume* : set the link radius to 1.
        * *Link radius* : o	Link radius: change the link radius. If the link radius is equal to 0, the links become lines of a pixel of width. If this radius is greater than 0, the links become cylinder propagated along the line.
        * *Opacity : set the opacity of the links.

* *Degree lines* :
Manage the degree lines. Note that they align with the link alignment target in the links panel.
    * *Show degree lines* : toggle visibility of the degree lines. Those are not visible by default.
    * *Radius* : change the radius of the degree lines.
    * *Length* : change proportionally to the node degree the length of the degree lines.
    * *Opacity* : change the opacity of the degree lines.
    * *Color* : change the color of the degree lines.
    * *Reset* : reset the radius, length, opacity and the color of the degree lines.

* *Load files* : 
Load csv and json files to update the network. For details on the data format to load, see the chapter “Loading data”.
    * *CSV* : load csv files.
        * *Coordinates* : load coordinates of the nodes.
        * *Labels* : load labels associated to each node. This file is optional.
        * *Matrix* : load the connectivity matrix of the network.
    * *Json* : load .json file.

* *Export* : 
Export the scene as a picture or a 3d model.
    * *Picture* : download a .tif picture called network.tif of the scene. The resolution set for the picture is twice the size of the window.
    * *Object* : download a .gltf file called scene.gltf with all the information about the scene rendered. This type of file can easily be imported via blender for further use or rendering.

* *Logs* :
    * *Show* : show all logs of the current session.
    * *Hide* : hide all logs currently displayed.

# Figures
Those two figures support the explanation of the customization of values that define the links. For more information, see the paper.

<img width="980" alt="Capture d’écran 2022-07-05 à 16 27 48" src="https://user-images.githubusercontent.com/81815333/177351510-b049abed-5afe-475f-84e6-766b8d7918c4.png">

<img width="1006" alt="mediator" src="https://user-images.githubusercontent.com/81815333/177354384-a9823c83-c66d-48d6-b73f-6b5d7667ccd1.png">

# Development

## Installation

To install Vizaj on your machine, you need to clone the repository and install the dependencies. Vizaj is based on Three.js and the dependencies are managed by npm. To install the dependencies, run the following command in the root directory of the project:

```
npm install
```

## Run the software

To run Vizaj, you need to start a local server. You can use the following command to start a local server:

```
npm run start
```

Vizaj is then accessible at the following address: http://localhost:1234/

## OpenVibe integration

You can display in real time the data acquired by OpenVibe. To do so, you need to run a middleware that converts OpenVibe's TCP stream into a Websocket stream. You can use the following command to start the middleware:

```
npm run middleware
```

The middleware reads the data from OpenVibe on port 4001 and sends it to the Websocket server on port 8080. The Websocket server is then accessible at the following address: `ws://localhost:8080/`

## Build

To build Vizaj, you can use the following command:

```
npm run build
```

The build is then available in the `dist` directory.

## Deploy 

To deploy Vizaj, you can use the following command:

```
npm run deploy
```

The software is then deployed to the `gh-pages` branch of the repository.
