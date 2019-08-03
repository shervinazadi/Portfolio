
<template>
    <div id="rtplayboard">
                <svg :width="WIDTH()" :height="HEIGHT()" v-bind:viewBox="viewBox()">
                    <circle :cx="(-1.5-(numi-2)/2)*(nrad+space)*2" :cy="(0.5-numj/2)*(nrad + space)*2" :r="nrad*2" fill="blue" stroke="#999" v-on:click="addAnchor(0)"/>
                    <circle :cx="(-1.5-(numi-2)/2)*(nrad+space)*2" :cy="(2.5-numj/2)*(nrad + space)*2" :r="nrad*2" fill="red" stroke="#999" v-on:click="addAnchor(1)"/> 
                    <circle :cx="(-1.5-(numi-2)/2)*(nrad+space)*2" :cy="(4.5-numj/2)*(nrad + space)*2" :r="nrad*2" fill="#333" stroke="#999" v-on:click="deleteAnchor()"/>
                    <template v-for="p in grid">
                                <circle :key="p.id"
                                    :cx="(p.x-(numi-2)/2)*(nrad + space)*2"
                                    :cy="(p.y-numj/2)*(nrad + space)*2"
                                    :r="nrad"
                                    fill="#ddd"
                                    :stroke="setHexColor(p.v)"
                                    stroke-width="2"
                                    v-on:click="handleClickPoint(p)"/>
                    </template>
                    
                    <template v-for="a in anchorManual">
                        <circle :key="-a.Data.id"
                                :cx="(a.Data.x-(numi-2)/2)*(nrad + space)*2"
                                :cy="(a.Data.y-numj/2)*(nrad + space)*2"
                                :r="(nrad-2)"
                                :fill="setHexColor(a.Data.v)"
                                v-on:click="handleClickAnchor(a.Data)"/>
                    </template>
                </svg>  
                

    </div>
</template>

<script>
import tinycolor2 from 'tinycolor2'
import * as d3 from 'd3'
import _ from 'lodash'


import {db,rtdb} from './firebaseInit'
let anchorsRef = rtdb.ref('anchors');

export default {
    name: 'rtplayboard',
    firebase: {
        anchors: anchorsRef
    },
    data () {
        return {
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
            startTime: 0,
            firstRound: 0,
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
    },
    destroyed() {
        window.removeEventListener('resize', this.handleResize)
    },
    beforeDestroy () {
       clearInterval(this.intervalid1)
    },
    mounted : function(){ 
        this.startTime = Date.now();
        //setting the grid based on the size of the window
        this.setGrid()
        //calculating the field
        this.anchorManualUpdate()
        this.calculateTheField()
        this.recalc()
    },
    methods: {
        anchorManualUpdate: function(){
            this.anchorManual = this.tempAnchorList()
        },
        recalc: function(){  
            this.intervalid1 = setInterval(() => {
                var anchorsLocal = this.anchorManual;
                this.anchorManualUpdate()
                var anchorsLocalNew = this.anchorManual;
                if(this.arraysEqual(anchorsLocal, anchorsLocalNew)) {
                } else {
                    this.calculateTheField() 
                }
                if(this.firstRound == 0) {
                    var nowTime = Date.now();
                    if (nowTime-this.startTime>1000) {
                        this.calculateTheField();
                        this.firstRound = 1;
                    }
                }
            }, 1000 / 30);
        },
        arraysEqual: function(a, b) {
            //checking if two arrays are equal
            if (a === b) return true;
            if (a == null || b == null) return false;
            if (a.length != b.length) return false;

            for (var i = 0; i < a.length; ++i) {
                if (a[i].Data.id !== b[i].Data.id) return false;
                if (a[i].Data.x !== b[i].Data.x) return false;
                if (a[i].Data.y !== b[i].Data.y) return false;
                if (a[i].Data.v !== b[i].Data.v) return false;
            }
            return true;
        },
        maxID() {
            var ii;
            var max = 1;
            var anchorsLocal = this.anchorManual; //temAnchorList removed from here     
            for (ii = 0; ii<anchorsLocal.length; ii++) {
                var a = anchorsLocal[ii].Data;
                if (max <= a.id) max = a.id + 1
            }
            return max
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
        addAnchor: function(value) {
            var newObj = {
                id: this.maxID(),
                x: 0,
                y: 0,
                v: value
            };
            anchorsRef.push(newObj);
            this.curAnchor = newObj.id;
            console.log("anchor " + this.curAnchor + " added")
        },
        deleteAnchor() {
            var find = 0;
            if (this.curAnchor != -1) {
                var anchorsLocal = this.anchorManual; //temAnchorList removed from here        
                for (var i=0; i<anchorsLocal.length; i++) {
                    var a = anchorsLocal[i].Data;
                    var aKey = anchorsLocal[i].Key;
                    if (this.curAnchor == a.id) {
                        anchorsRef.child(aKey).remove();
                        find = 1;
                    }
                }
                console.log("anchor " + this.curAnchor + " added")
                this.curAnchor = -1;
            } else {
                console.log("anchor " + String(this.curAnchor) + " does not exist anymore");
            }
            if (find==0 ) {
                console.log("anchor " + String(this.curAnchor) + " does not exist anymore");
            }
        },
        setHexColor: function(value) {
            var tinycolor = require("tinycolor2");
            var colorInstruction = "hsl(" + String(240+(120*value)) + ", 100%, 50%)";
            var hex = tinycolor(colorInstruction).toHexString();
            return hex
        },
        setHexColorPlusUpdates: function(value) {
            var tinycolor = require("tinycolor2");
            var colorInstruction = "hsl(" + String(240+(120*value)) + ", 100%, 50%)";
            this.calculateTheField()
            return tinycolor(colorInstruction).toHexString()
        },
        handleClickPoint: function(p) {
            var a, aKey;
            var find = 0;
            var anchorsLocal = this.anchorManual
            for (var i=0; i<anchorsLocal.length; i++) {
                var a = anchorsLocal[i].Data;
                var aKey = anchorsLocal[i].Key;
                if (this.curAnchor == anchorsLocal[i].Data.id) {
                    a = anchorsLocal[i].Data;
                    aKey = anchorsLocal[i].Key;
                    //checking if the anchor still exists
                    find = 1;
                    break
                }
            }
            if (find == 1) {
                a.x = p.x;
                a.y = p.y;
                //update on server
                anchorsRef.child(aKey).set(a);
                console.log("anchor " + String(a.id) + " moved");
                this.calculateTheField();
            } else {
                console.log("anchor " + String(this.curAnchor) + " does not exist anymore");
                this.curAnchor = -1;
            }
            
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
        fit: function(value, low1, high1, low2, high2) {
            if (value > high1) value = high1
            if (value < low1) value = low1
            return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
        },
        calculateTheField: function() {
            var anchorsLocal = this.anchorManual;
            var ClampOffset = .5;
            var pi;
            for (pi = 0; pi < this.grid.length; pi++) {
                var p = this.grid[pi];
                var beffect = 0;
                var reffect = 0;
                var ai;
                for (ai = 0; ai < anchorsLocal.length; ai++) {
                    var a = anchorsLocal[ai].Data;
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
                p.v = this.fit(ref, 0.5-ClampOffset, 0.5+ClampOffset, 0, 1);
            }
            this.calcCount += 1
            
        },
        WIDTH: function() {
            return (window.innerWidth)
        },
        HEIGHT: function() {
            return (window.innerHeight-62)
        },
        viewBox: function() {
            let str = (String(-this.WIDTH()/2)+' '+String(-this.HEIGHT()/2)+' '+String(this.WIDTH())+' '+String(this.HEIGHT()))
            return str
        }
    }
}
</script>

<style>
#picture {
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    position: absolute;
}
path, circle {
  transition: all 500ms ease;
}
</style>
