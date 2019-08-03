
<template>
    <div id="rtthreed">

    </div>
</template>

<script>
import tinycolor2 from 'tinycolor2'
import * as d3 from 'd3'
import _ from 'lodash'
import * as THREE from 'three'
/*
const OrbitControls = require('three-orbitcontrols')
*/
import OrbitControlModule from "three-orbit-controls";
const OrbitControls = OrbitControlModule( THREE );

import {db,rtdb} from './firebaseInit'
let anchorsRef = rtdb.ref('anchors');

export default {
    name: 'rtthreed',
    firebase: {
        anchors: anchorsRef
    },
    data () {
        return {
            //analysis variables
            employees: [],
            nrad:   13,
            space:  1.6,
            color:  '#aaa',
            ratio : 34,
            nindex:  0,
            curAnchor: -1,
            calcCount: 0,
            intervalid1:'',
            grid: [],
            anchorManual: [],
            window: {
                width: 0,
                height: 0
            },
            tolerance: 0.71,
            rotation: 0,
            extrusionHeight: 1,
            startTime: 0,
            firstRound: 0,
            //visualization variables
            camera: null,
            control: null,
            scene: null,
            renderer: null,
            meshes: []
        }
    },
    computed: {
        numi() {
            return (this.window.width-50)/this.ratio
        },  
        numj()  {
            return (this.window.height-50)/this.ratio
        }
    },
    created () {
        //getting the size of the window
        window.addEventListener('resize', this.handleResize)
        this.handleResize();
    },
    destroyed() {
        window.removeEventListener('resize', this.handleResize)
    },
    beforeDestroy () {
       clearInterval(this.intervalid1)
    },
    mounted : function() {
        this.startTime = Date.now();
        console.log(OrbitControls)
        this.init();
        this.constructMeshes();
        this.addMeshesToScene();
        this.initialRender();
        console.log("start")
        this.recalc()
    },
    methods: {
        init: function() {
            let container = document.getElementById('rtthreed')

            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color( 0xffffff);

			var ambientLight = new THREE.AmbientLight( 0xffffff );
            this.scene.add( ambientLight );
            /*
            this.camera = new THREE.PerspectiveCamera(  
                40,                                     //fov — Camera frustum vertical field of view.
                this.WIDTH()/this.HEIGHT(),   //aspect — Camera frustum aspect ratio.
                .1,                                      //near — Camera frustum near plane.
                50                                    //far — Camera frustum far plane.
            );
            */
            this.camera = new THREE.OrthographicCamera(
                this.WIDTH()  / -80,
                this.WIDTH()  / 80,
                this.HEIGHT() / 80, 
                this.HEIGHT() / -80,
                0.01,                                      //near — Camera frustum near plane.
                50                                    //far — Camera frustum far plane.
            );
            this.camera.position.set(16,20,16);
            let zero = new THREE.Vector3(4,0,4);
            this.camera.lookAt(zero);

            this.renderer = new THREE.WebGLRenderer();
            this.renderer.setSize(this.WIDTH(),this.HEIGHT());
            this.renderer.setPixelRatio( window.devicePixelRatio );
            container.appendChild(this.renderer.domElement);

            
            this.controls = new OrbitControls( this.camera);
            // to disable zoom
            this.controls.enableZoom = true;
            // to disable rotation
            this.controls.enableRotate = false;
            // slow down the pan, default is 1
            this.controls.autoRotate = false;
            this.controls.autoRotateSpeed = .5;
            this.controls.panSpeed = .5
            this.controls.rotateSpeed = .7
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 1;

            
            // vertical angle control
            this.controls.minPolarAngle = -Math.PI*4/9;
            this.controls.maxPolarAngle = Math.PI*4/9;
            this.controls.update();
            

            window.addEventListener('resize', this.onWindowResize, false);
        },
        constructMeshes: function() {
            this.drawThresholds(this.tolerance);
            this.setField(this.tolerance);
        },
        addMeshesToScene: function() {
            for (var i=0; i<this.meshes.length; i++) {
                this.scene.add(this.meshes[i]);
            }
        },
        initialRender: function() {
            this.renderer.render(this.scene, this.camera);
        },
        recalc: function(){  
            this.intervalid1 = setInterval(() => {
                //saving old data
                var anchorsLocal = this.anchorManual;
                //updating data
                this.anchorManualUpdate()
                //saving new data
                var anchorsLocalNew = this.anchorManual;
                //checking if the data is changed or not
                if(this.arraysEqual(anchorsLocal, anchorsLocalNew)) {
                    console.log("no change")
                } else {    
                    console.log("updating")         
                    this.toUpdate();
                }
                if(this.firstRound == 0) {
                    var nowTime = Date.now();
                    if (nowTime-this.startTime>1000) {
                        this.toUpdate();
                        this.firstRound = 1;
                    }
                }
                //update rotation
                this.controls.update();
                //render
                this.renderer.render(this.scene, this.camera);
            }, 1000 / 30);
        },
        toUpdate: function() {
            //selecting the old grid
            var selectedObject = this.scene.getObjectByName("toberefreshed");
            //removing the old grid
            this.scene.remove( selectedObject );
            //selecting the old thresh
            var selectedObject1 = this.scene.getObjectByName("toberefreshed1");
            //removing the old thresh
            this.scene.remove( selectedObject1 );
            //drawing the new thresh
            this.drawThresholds(this.tolerance/12);
            //adding the new thresh
            this.scene.add(this.meshes[this.meshes.length-1]);
            //drawing the new grid
            this.setField(this.tolerance);
            //adding the new grid
            this.scene.add(this.meshes[this.meshes.length-1]);

        },
        arraysEqual: function(a, b) {
            //checking if two arrays are equal
            if (a === b) return true;
            if (a == null || b == null) return false;
            if (a.length != b.length) {

                return false;
            }
            for (var i = 0; i < a.length; ++i) {
                if (a[i].Data.id !== b[i].Data.id) return false;
                if (a[i].Data.x !== b[i].Data.x) return false;
                if (a[i].Data.y !== b[i].Data.y) return false;
                if (a[i].Data.v !== b[i].Data.v) return false;
            }
            return true;
        },
        WIDTH: function() {
            return (window.innerWidth)
        },
        HEIGHT: function() {
            return (window.innerHeight-62)
        },
        onWindowResize: function() {
            
            this.camera.aspect = this.WIDTH() / this.HEIGHT();
            console.log(this.WIDTH(), this.HEIGHT())
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(this.WIDTH(), this.HEIGHT());
        },
        anchorManualUpdate: function(){
            this.anchorManual = this.tempAnchorList()
        },
        fit: function(value, low1, high1, low2, high2) {
            //clamping
            if (value > high1) value = high1
            if (value < low1) value = low1
            return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
        },
        drawThresholds: function(tol) {
            //getting the updated anchor position
            var anchorsLocal = this.anchorManual;
            //finding the bounding box
            var xmin = 0;
            var xmax = 0;
            var ymin = 0;
            var ymax = 0;
            if (anchorsLocal.length > 0) {
                xmin = anchorsLocal[0].Data.x;
                xmax = anchorsLocal[0].Data.x;
                ymin = anchorsLocal[0].Data.y;
                ymax = anchorsLocal[0].Data.y;
                for( var i=0; i<anchorsLocal.length; i++) {
                    if (anchorsLocal[i].Data.x > xmax) xmax = anchorsLocal[i].Data.x;
                    if (anchorsLocal[i].Data.x < xmin) xmin = anchorsLocal[i].Data.x;
                    if (anchorsLocal[i].Data.y > ymax) ymax = anchorsLocal[i].Data.y;
                    if (anchorsLocal[i].Data.y < ymin) ymin = anchorsLocal[i].Data.y;
                }
                xmin -= 2;
                ymin -= 2;
                xmax += 2;
                ymax += 2;
            }

            //creating the base grid
            var xdif = (xmax - xmin)/tol;
            var ydif = (ymax - ymin)/tol;

            //initializing geometry
            var geometry = new THREE.BufferGeometry();
            var positionsLocal = [];
			var k = 1;
            var pvs = [];

            for (var i=0; i<xdif; i++){
                for (var j=0; j<ydif; j++){
                    var px = i*tol;
                    var py = j*tol;
                    var pv = this.evalIntensity(px, py, anchorsLocal);

                    // X forward testing
                    var pv_xf = this.evalIntensity(px+tol, py, anchorsLocal);
                    if ((pv - 0.5)*(pv_xf - 0.5)<=0) {
                        var threshPos = pv<pv_xf ? this.fit(0.5, pv, pv_xf, 0, 1) : this.fit(0.5, pv_xf, pv, 1, 0)
                        var new_px = px + threshPos*tol;
                        var new_py = py;

                        positionsLocal.push( 
                            new_px + xmin,
                            0,
                            new_py + ymin
                        );
                        positionsLocal.push( 
                            new_px + xmin,
                            this.extrusionHeight,
                            new_py + ymin
                        );
                        k++;
                    }

                    // Y forward testing
                    var pv_yf = this.evalIntensity(px, py+tol, anchorsLocal);
                    if ((pv - 0.5)*(pv_yf - 0.5)<=0) {
                        var threshPos = pv<pv_yf ? this.fit(0.5, pv, pv_yf, 0, 1) : this.fit(0.5, pv_yf, pv, 1, 0)
                        var new_py = py + threshPos*tol;
                        var new_px = px;

                        positionsLocal.push( 
                            new_px + xmin,
                            0,
                            new_py + ymin
                        );
                        positionsLocal.push( 
                            new_px + xmin,
                            this.extrusionHeight,
                            new_py + ymin
                        );
                        k++;
                    }
                }
            }
            var positions = new Float32Array(k*3*2);
            for (var i=0; i<k*3*2; i++) positions[i] = positionsLocal[i];
            
            geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
            /*
            //geometry.computeBoundingBox();
            var pointSize = 0.1;
			var material = new THREE.PointsMaterial( { size: pointSize, vertexColors: THREE.VertexColors } );
            var mesh = new THREE.Points( geometry, material );
            */
			var mesh = new THREE.LineSegments( geometry, new THREE.LineBasicMaterial( { color: 0x000000} ) );
            //mesh.computeLineDistances();
            
            mesh.name = "toberefreshed";
            this.meshes.push(mesh)
        },
        evalIntensity: function(px, py, anchorsLocal) {
            var ClampOffset = .5;
            var beffect = 0;
            var reffect = 0;
            var ai;
            for (ai = 0; ai < anchorsLocal.length; ai++) {
                var a = anchorsLocal[ai].Data;
                var dx2 = Math.pow((a.x - px),2);
                var dy2 = Math.pow((a.y - py),2);
                var dist = Math.pow((dx2+dy2),0.5);
                if (dist == 0) {
                    beffect = 0.000001;
                    reffect = a.v;
                    break;
                        }
                var effect = Math.pow(dist,-3);
                        
                reffect += a.v * effect;
                beffect += (1 - a.v) * effect;
            }
            var ref = reffect / (reffect+beffect);
            var pv = this.fit(ref, 0.5-ClampOffset, 0.5+ClampOffset, 0, 1);
            return pv
        },
        setField: function(tol) {
            //getting the updated anchor position
            var anchorsLocal = this.anchorManual;
            //finding the bounding box
            var xmin = 0;
            var xmax = 0;
            var ymin = 0;
            var ymax = 0;
            if (anchorsLocal.length > 0) {
                xmin = anchorsLocal[0].Data.x;
                xmax = anchorsLocal[0].Data.x;
                ymin = anchorsLocal[0].Data.y;
                ymax = anchorsLocal[0].Data.y;
                for( var i=0; i<anchorsLocal.length; i++) {
                    if (anchorsLocal[i].Data.x > xmax) xmax = anchorsLocal[i].Data.x;
                    if (anchorsLocal[i].Data.x < xmin) xmin = anchorsLocal[i].Data.x;
                    if (anchorsLocal[i].Data.y > ymax) ymax = anchorsLocal[i].Data.y;
                    if (anchorsLocal[i].Data.y < ymin) ymin = anchorsLocal[i].Data.y;
                }
                xmin -= 2;
                ymin -= 2;
                xmax += 2;
                ymax += 2;
            }

            //creating the base grid
            var xdif = Math.ceil((xmax - xmin)/tol);
            var ydif = Math.ceil((ymax - ymin)/tol);

            var geometry = new THREE.BufferGeometry();
            var color = new THREE.Color( 1, 0, 0 );
            var numPoints = (xdif) * (ydif);
            var positions = new Float32Array( numPoints * 3 );
            var colors = new Float32Array( numPoints * 3 );
            var indices = [];
			var k = 0;
            
            var ClampOffset = .5;
            for (var i=0; i<xdif; i++){
                for (var j=0; j<ydif; j++){
                    var px = i*tol;
                    var py = j*tol;
                    var beffect = 0;
                    var reffect = 0;
                    var ai;
                    for (ai = 0; ai < anchorsLocal.length; ai++) {
                        var a = anchorsLocal[ai].Data;
                        var dx2 = Math.pow((a.x - px),2);
                        var dy2 = Math.pow((a.y - py),2);
                        var dist = Math.pow((dx2+dy2),0.5);
                        if (dist == 0) {
                            beffect = 0.000001;
                            reffect = a.v;
                            break;
                        }
                        var effect = Math.pow(dist,-3);
                        
                        reffect += a.v * effect;
                        beffect += (1 - a.v) * effect;
                    }
                    var ref = reffect / (reffect+beffect);
                    var pv = this.fit(ref, 0.5-ClampOffset, 0.5+ClampOffset, 0, 1);

					positions[ 3 * k ] = px + xmin;
					positions[ 3 * k + 1 ] = 0;
                    positions[ 3 * k + 2 ] = py + ymin;
                    
                    var localColor = pv>0.5 ? 1 : 0;
					colors[ 3 * k ] = pv;
					colors[ 3 * k + 1 ] = 0;
					colors[ 3 * k + 2 ] = 1-pv;
					k++;
                }
            }

            for ( var i = 0; i < xdif -1 ; i ++ ) {
				for ( var j = 0; j < ydif-1; j ++ ) {
					var a = i * ( ydif ) + ( j + 1 );
					var b = i * ( ydif ) + j;
					var c = ( i + 1 ) * ( ydif ) + j;
                    var d = ( i + 1 ) * ( ydif ) + ( j + 1 );
                    // generate two faces (triangles) per iteration
                    /*
					indices.push( a, b, d ); // face one
                    indices.push( b, c, d ); // face two
                    */
					indices.push( a, b, d ); // face one
                    indices.push( b, c, d ); // face two
                    console.log(xdif,ydif)
				}
            }
            console.log(k)
            geometry.setIndex(indices);
			geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
			geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
            //geometry.computeBoundingBox();

            var pointSize = 0.06;
            var material = new THREE.PointsMaterial( { size: pointSize, vertexColors: THREE.VertexColors } );
            var material2 = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
			var material3 = new THREE.MeshPhongMaterial( {
				specular: 0x111111, shininess: 250,
				side: THREE.DoubleSide, vertexColors: THREE.VertexColors
			} );
            var mesh = new THREE.Mesh( geometry, material3 );
            mesh.name = "toberefreshed1";
            mesh.material.transparent = true;
            mesh.material.opacity = .6;
            this.meshes.push(mesh)
        },
        tempAnchorList: function() {
            var temp = []
            anchorsRef.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    var child = {
                        Key : childSnapshot.key,
                        Data : childSnapshot.val()
                    }  
                temp.push(child)
                })
            })
            return temp
        },
        handleResize() {
            this.window.width = window.innerWidth;
            this.window.height = window.innerHeight;
        },
        viewBox: function() {
            let str = (String(-this.WIDTH()/2)+' '+String(-this.HEIGHT()/2)+' '+String(this.WIDTH())+' '+String(this.HEIGHT()))
            return str
        }
    }
}
</script>

<style scoped>
#rtthreed {
    transform: scale(1);
    transform-origin: top left;
    position: absolute;
    top: 1;
    left: 0
}
</style>
