
<template>
    <div id="threed">

    </div>
</template>

<!-----------------------------SCRIPT-------------------------------->

<script>
import {db,rtdb} from './firebaseInit'
let anchorsRef = rtdb.ref('anchors');

import * as THREE from 'three'

export default {
    name: 'threed',
    data() {
        return {
            //analysis variables
            tolerance: 0.1,
            intervalid1:'',
            anchorManual: [],
            //visualization variables
            camera: null,
            scene: null,
            renderer: null,
            meshes: []
        }
    },
    mounted() {
        this.recalc()
        this.init();
        this.tempAnchorList();
        this.setAnalysisGrid(this.tolerance);
        this.constructMeshes();
        this.addMeshesToScene();
        this.animate();
    },
    beforeDestroy () {
       clearInterval(this.intervalid1)
    },
    methods: {
        init: function() {
            let container = document.getElementById('threed')

            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color( 0xffffff);

            this.camera = new THREE.PerspectiveCamera(  
                40,                                     //fov — Camera frustum vertical field of view.
                this.WIDTH()/this.HEIGHT(),   //aspect — Camera frustum aspect ratio.
                1,                                      //near — Camera frustum near plane.
                1000                                    //far — Camera frustum far plane.
            );

            this.camera.position = {x:4,y:4,z:10};
            let zero = new THREE.Vector3(0,0,0);
            this.camera.lookAt(zero);

            this.renderer = new THREE.WebGLRenderer();
            this.renderer.setSize(this.WIDTH(),this.HEIGHT());
            container.appendChild(this.renderer.domElement);

            window.addEventListener('resize', this.onWindowResize, false);
        },
        constructMeshes: function() {
            this.makeBox(2,2,2);
            this.makeCube(2.005);
            //this.makePlane(3);
        },
        addMeshesToScene: function() {
            for (var i=0; i<this.meshes.length; i++) {
                this.scene.add(this.meshes[i]);
            }
        },
        animate: function() {
            requestAnimationFrame(this.animate);
            this.meshes[0].rotation.y += 0.005;
            this.meshes[1].rotation.y += 0.005;
            this.renderer.render(this.scene, this.camera);
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
            return (window.innerWidth)*2
        },
        HEIGHT: function() {
            return (window.innerHeight-62)*2
        },
        onWindowResize: function() {
            
            this.camera.aspect = this.WIDTH() / this.HEIGHT();
            console.log(this.WIDTH(), this.HEIGHT())
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(this.WIDTH(), this.HEIGHT());
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
        anchorManualUpdate: function(){
            this.anchorManual = this.tempAnchorList();
        },
        recalc: function(){  
            this.intervalid1 = setInterval(() => {
                this.anchorManualUpdate()
                this.setAnalysisGrid(this.tol) 
            }, 100);
        },
        setAnalysisGrid: function(tol) {
            //getting the updated anchor position
            var tAnchors = this.anchorManual;
            //finding the bounding box
            if (tAnchors.length > 0) {
                var xmin,xmax = tAnchors[0].Data.x;
                var ymin,ymax = tAnchors[0].Data.y;
                for( var i=0; i<tAnchors.length; i++) {
                    if (tAnchors[i].Data.x > xmax) xmax = tAnchors[i].Data.x;
                    if (tAnchors[i].Data.x < xmin) xmin = tAnchors[i].Data.x;
                    if (tAnchors[i].Data.y > ymax) ymax = tAnchors[i].Data.y;
                    if (tAnchors[i].Data.y < ymin) ymin = tAnchors[i].Data.y;
                }
                console.loh("i got here")
                console.log(xmin,xmax,ymin,ymax);
            }
        }
    },
     
}
</script>


<style scoped>
#threed {
    transform: scale(0.5);
    transform-origin: top left;
    position: absolute;
    top: 1;
    left: 0
}
</style>