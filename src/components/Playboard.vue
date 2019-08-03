
<template>
    <div id="playboard" class="pt-5">
                <svg id="picture" viewBox="-250 -250 500 500">
                    <circle :cx="(-1.5-numi/2)*(nrad+space)*2" :cy="(0.5-numj/2)*(nrad + space)*2" :r="nrad*2" fill="blue" stroke="#999" v-on:click="addAnchor(0)"/>
                    <circle :cx="(-1.5-numi/2)*(nrad+space)*2" :cy="(2.5-numj/2)*(nrad + space)*2" :r="nrad*2" fill="red" stroke="#999" v-on:click="addAnchor(1)"/> 
                    <circle :cx="(-1.5-numi/2)*(nrad+space)*2" :cy="(4.5-numj/2)*(nrad + space)*2" :r="nrad*2" fill="#333" stroke="#999" v-on:click="deleteAnchor()"/>
                    <template v-for="p in grid">
                                <circle :key="p.id"
                                    :cx="(p.x-numi/2)*(nrad + space)*2"
                                    :cy="(p.y-numj/2)*(nrad + space)*2"
                                    :r="nrad"
                                    fill="#ddd"
                                    :stroke="p.c"
                                    stroke-width="1.4"
                                    v-on:click="handleClickPoint(p)"/>
                    </template>
                    
                    <template v-for="a in anchors">
                                <circle :key="-a.id"
                                    :cx="(a.x-numi/2)*(nrad + space)*2"
                                    :cy="(a.y-numj/2)*(nrad + space)*2"
                                    :r="(nrad-2)"
                                    :fill="a.c"
                                    v-on:click="handleClickAnchor(a)"/>
                    </template>
                </svg>     

    </div>
</template>

<script>
import tinycolor2 from 'tinycolor2'
import * as d3 from 'd3'
import _ from 'lodash'
import {db} from './firebaseInit'
export default {
    name: 'playboard',
    data () {
        return {
            employees: [],
            nrad:   7,
            space:  1,
            color:  '#aaa',
            maxID: 0,
            ratio : 32,
            nindex:  0,
            curAnchor: -1,
            grid: [],
            anchors: [],
            window: {
                width: 0,
                height: 0
            }
        }
    },
    computed: {
        numi() {
            return this.window.width/this.ratio
        },  
        numj()  {
            return this.window.height/this.ratio
        }  
    },
    created () {
        //getting the size of the window
        window.addEventListener('resize', this.handleResize)
        this.handleResize();
        //setting the grid based on the size of the window
        this.setGrid()
        //getting the anchors
        //this.setAnchors()
        this.getAnchorLocationFromServer()
        //calculating the field
        this.calculateTheField()
        window.addEventListener('keydown', (e) => {
            if (e.key == 's') {
                this.addAnchor(0);
            }
            if (e.key == 'x') {
                this.addAnchor(1);
            }
            if (e.key == 'Backspace' || e.key == 'd') {
                this.deleteAnchor();
            }
        })
        /*db.collection('grid').get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                var tinycolor = require("tinycolor2");
                var colorInstruction = "hsl(" + String(240+(120*doc.data().v)) + ", 100%, 50%)";
                var hex = tinycolor(colorInstruction).toHexString();
                //var hex = tinycolor.fromRatio({ r: doc.data().rv, g: 0, b: doc.data().bv }).toHexString();
                const gridData = {
                    'id': doc.data().id,
                    'x': doc.data().x,
                    'y': doc.data().y,
                    'v': doc.data().v,
                    'c': hex
                }
                this.grid.push(gridData)
            })
        })
        db.collection('anchors').get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                var hex = this.setHexColor(doc.data().v);
                const anchorsData = {
                    'id': doc.data().id,
                    'x': doc.data().x,
                    'y': doc.data().y,
                    'v': doc.data().v,
                    'c': hex
                }
                this.anchors.push(anchorsData)
            })
        })*/
    },
    destroyed() {
        window.removeEventListener('resize', this.handleResize)
    },
    methods: {
        handleResize() {
            this.window.width = window.innerWidth;
            this.window.height = window.innerHeight;
        },
        addAnchor: function(value) {
            var newObj = {
            id: this.maxID,
            x: 0,
            y: 0,
            v: value
            };
            this.anchors.push(newObj);
            this.curAnchor = this.maxID;
            this.maxID += 1;
            //add to server
            this.addAnchorToServer(newObj);
            this.calculateTheField();
        },
        deleteAnchor() {
            if (this.curAnchor != -1) {
                var i;
                var tempAnchor = [];
                for (i=0; i<this.anchors.length; i++) {
                    var a = this.anchors[i];
                    if (this.curAnchor != a.id) {
                        tempAnchor.push(a);
                    } else {
                        //delete from server
                        this.deleteAnchorFromServer(a)
                        console.log("anchor " + String(a.id) + " deleted")
                    }
                }
                this.anchors = tempAnchor;
                this.curAnchor = -1;
                this.calculateTheField()
            }
        },
        getAnchorLocationFromServer: function() {
            db.collection('anchors').get().then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    var hex = this.setHexColor(doc.data().v);
                    if (doc.data().id > this.maxID) this.maxID = doc.data().id + 1;
                    const anchorsData = {
                        'id': doc.data().id,
                        'x': doc.data().x,
                        'y': doc.data().y,
                        'v': doc.data().v,
                        'c': hex
                    }
                    //push it to the local array
                    this.anchors.push(anchorsData)
                })
            })
        },
        addAnchorToServer: function(a) {
            db.collection('anchors').add(a)
        },
        updateAnchorLocationOnServer: function(a) {
            db.collection('anchors')
            .where('id', '==', a.id)
            .get().then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    doc.ref.update({
                        x: a.x,
                        y: a.y
                    })                    
                })
            })
        },
        deleteAnchorFromServer: function(a) {
            db.collection('anchors')
            .where('id', '==', a.id)
            .get().then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    doc.ref.delete()
                })
            })
        },
        setHexColor: function(value) {
            var tinycolor = require("tinycolor2");
            var colorInstruction = "hsl(" + String(240+(120*value)) + ", 100%, 50%)";
            return tinycolor(colorInstruction).toHexString();
        },
        handleClickPoint: function(p) {
            var a,i;
            for (i=0; i<this.anchors.length; i++) if (this.anchors[i].id == this.curAnchor) a = this.anchors[i]
            a.x = p.x;
            a.y = p.y;
            //update anchor location on server
            this.updateAnchorLocationOnServer(a);
            this.calculateTheField();
            console.log("anchor " + String(a.id) + " moved")
        },
        handleClickAnchor: function(a) {
            this.curAnchor = a.id;
            console.log("anchor " + String(a.id) + " selected")
        },
        setGrid () {
            var ii,jj;
            var id = 1;
            for (ii = 0; ii < this.numi; ii++) { 
                for (jj = 0; jj < this.numj; jj++) { 
                    id += 1;
                    var newObj = {
                    id: id,
                    x: ii,
                    y: jj,
                    v: 0.5,
                    };
                    this.grid.push(newObj);
                }
            }
        },
        setAnchors () {
            var ii;
            var id = 0;
            for (ii = 0; ii < 2; ii++) { 
                    var newObj = {
                    id: ii,
                    x: ii,
                    y: ii,
                    v: ii,
                    };
                    this.anchors.push(newObj);
                    //db.collection('grid').add(newObj)
            }
        },
        fit: function(value, low1, high1, low2, high2) {
            if (value > high1) value = high1
            if (value < low1) value = low1
            return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
        },
        calculateTheField() {
            var ClampOffset = 0.25;
            var pi;
            for (pi = 0; pi < this.grid.length; pi++) {
                var p = this.grid[pi];
                var beffect = 0;
                var reffect = 0;
                var ai;
                for (ai = 0; ai < this.anchors.length; ai++) {
                    var a = this.anchors[ai];
                    var dx2 = Math.pow((a.x - p.x),2);
                    var dy2 = Math.pow((a.y - p.y),2);
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
                //p.v = ref;
                p.v = this.fit(ref, 0.5-ClampOffset, 0.5+ClampOffset, 0, 1);
                //calculate hex collor
                p.c = this.setHexColor(p.v);
                //p.c = tinycolor.fromRatio({ r: p.rv, g: 0, b: p.bv }).toHexString();
                //update the data base
                /*
                db.collection('grid')
                .where('id', '==', p.id)
                .get().then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        doc.ref.update({
                            v: p.v
                        })                    
                    })
                })
                */
            }
            var ai;
            for (ai = 0; ai < this.anchors.length; ai++) {
                var a = this.anchors[ai];
                a.c = this.setHexColor(a.v);
            }
        }
    }
}
</script>

<style>
#picture {
  transform: translate(-50%, -50%);
  top: 52%;
  left: 50%;
  position: absolute;
  max-height:22cm;
  max-width:42cm;
  width: 100%;
  height: 100%;
}
path, circle {
  transition: all 500ms ease;
}
</style>
