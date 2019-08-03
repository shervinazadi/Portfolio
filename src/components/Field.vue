
<template>
    <div id="field">

    </div>
</template>

<script>
import tinycolor2 from 'tinycolor2'
import * as d3 from 'd3'
import _ from 'lodash'
import * as THREE from 'three'

import {db,rtdb} from './firebaseInit'
let anchorsRef = rtdb.ref('anchors');

export default {
    name: 'field',
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
            tolerance: 0.15,
            rotation: 0,
            //visualization variables
            camera: null,
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
        this.anchorManualUpdate()

    },
    destroyed() {
        window.removeEventListener('resize', this.handleResize)
    },
    beforeDestroy () {
       clearInterval(this.intervalid1)
    },
    mounted : function(){

        this.init();
        
        this.constructMeshes();
        this.addMeshesToScene();
        this.recalc()
        //this.animate();
    },
    methods: {
        init: function() {
            let container = document.getElementById('field')

            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color( 0xffffff);

            this.camera = new THREE.PerspectiveCamera(  
                40,                                     //fov — Camera frustum vertical field of view.
                this.WIDTH()/this.HEIGHT(),   //aspect — Camera frustum aspect ratio.
                1,                                      //near — Camera frustum near plane.
                1000                                    //far — Camera frustum far plane.
            );

            this.camera.position = {x:20,y:20,z:20};
            let zero = new THREE.Vector3(0,0,0);
            this.camera.lookAt(zero);

            this.renderer = new THREE.WebGLRenderer();
            this.renderer.setSize(this.WIDTH(),this.HEIGHT());
            this.renderer.setPixelRatio( window.devicePixelRatio );
            container.appendChild(this.renderer.domElement);

            window.addEventListener('resize', this.onWindowResize, false);
        },
        constructMeshes: function() {
            //this.makeBox(2,2,2);
            //this.makeCube(2.005);
            this.setField(this.tolerance);
            //this.makePlane(3);
        },
        addMeshesToScene: function() {
            for (var i=0; i<this.meshes.length; i++) {
                this.scene.add(this.meshes[i]);
            }
        },
        animate: function() {
            setTimeout(function() {console.log("imwaiting");}, 5000);
            requestAnimationFrame(this.animate);
            //rotating the box
            this.meshes[0].rotation.y += 0.005;
            this.meshes[1].rotation.y += 0.005;
            /*
            //selecting the grid
            var selectedObject = this.scene.getObjectByName("toberefreshed");
            //removing the oldgrid
            this.scene.remove( selectedObject );
            //drawing the new grid
            this.setField(this.tolerance);
            //adding the new grid
            this.scene.add(this.meshes[this.meshes.length-1]);
            */
            //render
            this.renderer.render(this.scene, this.camera);
        },
        recalc: function(){  
            this.intervalid1 = setInterval(() => {
                //updating the data
                this.anchorManualUpdate()
                //selecting the grid
                var selectedObject = this.scene.getObjectByName("toberefreshed");
                //removing the oldgrid
                this.scene.remove( selectedObject );
                //drawing the new grid
                this.setField(this.tolerance);
                //adding the new grid
                this.scene.add(this.meshes[this.meshes.length-1]);
                //render
                this.renderer.render(this.scene, this.camera);
            }, 100);
        },  
        makeBox: function(w, h, d) {
            let geometry = new THREE.BoxGeometry(w, h, d);
            let material = new THREE.LineBasicMaterial( {
                color: 0xffffff,
                linewidth: 1,
                linecap: 'round', //ignored by WebGLRenderer
                linejoin:  'round', //ignored by WebGLRenderer
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity:0.8,
            });

            let mesh = new THREE.Mesh(geometry, material);

            this.meshes.push(mesh)   
        },
        makePlane: function(size) {
            let geometry = new THREE.PlaneGeometry(size, size);
            let material = new THREE.MeshBasicMaterial({
                color: 0xcccccc,
                side: THREE.DoubleSide
            });

            let mesh = new THREE.Mesh(geometry, material);

            mesh.rotation.x = Math.PI/2;

            this.meshes.push(mesh)   
        },
        makeCube: function(size) {
            var geometryCube = this.cube(size);
			var lineSegments = new THREE.LineSegments( geometryCube, new THREE.LineBasicMaterial( { color: 0x000000, dashSize: .02, gapSize: .01 } ) );
            lineSegments.computeLineDistances();
            
            this.meshes.push(lineSegments)  
        },
		cube: function( size ) {
			var h = size * 0.5;
			var geometry = new THREE.BufferGeometry();
			var position = [];
			position.push(
					- h, - h, - h,
					- h, h, - h,
					- h, h, - h,
					h, h, - h,
					h, h, - h,
					h, - h, - h,
					h, - h, - h,
					- h, - h, - h,
					- h, - h, h,
					- h, h, h,
					- h, h, h,
					h, h, h,
					h, h, h,
					h, - h, h,
					h, - h, h,
					- h, - h, h,
					- h, - h, - h,
					- h, - h, h,
					- h, h, - h,
					- h, h, h,
					h, h, - h,
					h, h, h,
					h, - h, - h,
					h, - h, h
			);
			geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( position, 3 ) );
			return geometry;
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
            if (value > high1) value = high1
            if (value < low1) value = low1
            return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
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
            var xdif = (xmax - xmin)/tol;
            var ydif = (ymax - ymin)/tol;

            var geometry = new THREE.BufferGeometry();
            var color = new THREE.Color( 1, 0, 0 );
            var numPoints = xdif * ydif;
            var positions = new Float32Array( numPoints * 3 );
			var colors = new Float32Array( numPoints * 3 );
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

					positions[ 3 * k ] = px - xdif * 0.5 * tol;
					positions[ 3 * k + 1 ] = pv;
					positions[ 3 * k + 2 ] = py - ydif * 0.5 * tol;
					var intensity = ( py + 0.1 ) * 5;
					colors[ 3 * k ] = pv;
					colors[ 3 * k + 1 ] = 0;
					colors[ 3 * k + 2 ] = 1-pv;
					k++;
                }
            }
			geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
			geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
            //geometry.computeBoundingBox();

            var pointSize = 0.1;
			var material = new THREE.PointsMaterial( { size: pointSize, vertexColors: THREE.VertexColors } );
            var mesh = new THREE.Points( geometry, material );
            mesh.name = "toberefreshed";
            this.meshes.push(mesh)
            console.log("grid updated")
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
            console.log(str)
            return str
        }
    }
}
</script>

<style scoped>
#field {
    transform: scale(1);
    transform-origin: top left;
    position: absolute;
    top: 1;
    left: 0
}
</style>
