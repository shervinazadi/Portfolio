<template>
    <div id="view-system">
        <div v-if="isLoaded">
            <component :is="mdViewer" />
        </div>
    </div>
</template>

<script>
import {db} from './firebaseInit'
import Vue from 'vue'

//initializing thee markdown interpreter
var md = require('markdown-it')({
    breaks:true,
});

////markdown custom component settings
var inlineCounter  = -1;
md.use(require('markdown-it-container'), 'inline', {
    validate: function(params) {      
        return params.trim().match(/^inline\s+(.*)$/);
    },
    render: function (tokens, idx) {
        if (tokens[idx].nesting === 1) {
        var m = tokens[idx].info.trim().match(/^inline\s+(.*)$/);

        // opening tag
        var ss0 = '<span id="mdInline" @click="evalFunc';
        var ss1 = "('";
        var ss2 = "',";
        var ss3 = ")";
        var ss4 = '">{{ this.inlineList[';
        var ss5 = '] }}';
        inlineCounter++;
        
        var CounterStr = inlineCounter.toString();
        return ss0 + ss1 + md.utils.escapeHtml(m[1]) + ss2 + CounterStr + ss3 + ss4 + CounterStr + ss5;

        }if (tokens[idx].nesting === 2) {
        var m = tokens[idx].info;
        // middle tag
        return '' //m
        
        }if (tokens[idx].nesting === -1) {
        // closing tag
        return "</span>";
        }
    }
});


export default {
    name: 'view-system',
    data () {
        return {
            system_id: null,
            title: null,
            body: 'loading...',
            inlineList: [],
        }
    },
    beforeRouteEnter (to, from, next) {
        db.collection('systems')
        .where('system_id', '==', to.params.system_id)
        .get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                next(vm => {
                    vm.system_id = doc.data().system_id 
                    vm.body = doc.data().body 
                    vm.title = doc.data().title
                })
            })
        })  
    },
    computed: {
        mdRendered() {
            var ren = md.render(this.body);
            //console.log(ren)
            ren = ren.replace(/<br>/g, '<br><br>'); 
            return ren;
        },
        isLoaded() {
            if (this.body === 'loading...') return false
            else return true
        },
        mdViewer: function() {
            var selfParent = this;
            return {
                template: 
                        `<div id="markdown-viewer" class="markdown-viewer">
                            <div id="textBox">
                                ${this.mdRendered}
                            </div>
                        </div>`,
                data () {
                    return {
                        system_id: null,
                        title: null,
                        body: selfParent.body,
                        inlineList: this.initList(selfParent.body)//selfParent.inlineList,
                    }
                },
                methods: {
                    initList: function(body) {
                        var count = (body.match(/:::/g) || []).length;
                        var lclInlineList = [];
                        var i;
                        var collapsed  =  '[+]';
                        for (i=0; i<count; i++) lclInlineList.push(collapsed) 
                        return lclInlineList
                    },
                    evalFunc: function(str,id) {
            
                        if (this.inlineList[id] === '[+]') {
                            var newHidden = str;
                            this.expand(newHidden,id);
                        } else {
                            var newHidden = '[+]';
                            this.collapse(newHidden,id);
                        } 
                    },
                    expand: function(newHidden,id){ 
                        //matter of safety
                        var self = this
                        //saving the  satatus quo
                        var tempHidden = this.inlineList[id];
                        //initializing the counter
                        var counter = 0;
                        //interval loop
                        this.intervalid1 = setInterval(() => {
                            //adding charachters one by one
                            tempHidden  = self.splice(tempHidden,counter+1,counter==0,newHidden[counter]);
                            //updating the data list
                            Vue.set(this.inlineList, id, tempHidden)
                            //counter
                            counter++;
                            // break the loop
                            if (counter > newHidden.length-1) clearInterval(self.intervalid1)
                        }, 1000 / 120);
                    },
                    collapse: function(newHidden,id){ 
                        //matter of safety
                        var self = this
                        //saving the  satatus quo
                        var tempHidden = this.inlineList[id];
                        //initializing the counter
                        var counter = tempHidden.length;
                        //interval loop
                        this.intervalid1 = setInterval(() => {
                            //removing charachters one by one
                            tempHidden  = self.splice(tempHidden,2,1,'');
                            //updating the data list
                            Vue.set(this.inlineList, id, tempHidden)
                            //counter
                            counter--;
                            // break the loop
                            if (counter < 5) {
                                //add the plus sign
                                tempHidden  = self.splice(tempHidden,1,2,'+');
                                Vue.set(this.inlineList, id, tempHidden)
                                clearInterval(self.intervalid1)
                                }
                        }, 1000 / 180);
                    },
                    splice: function(initString, idx, rem, newString) {
                        //(initial string, the index to insert the str, the number of char to remove, the new string)
                        return initString.slice(0, idx) + newString + initString.slice(idx + Math.abs(rem),initString.length);
                    },
                }
            }
        }
    },
    created: function() {
        this.fetchData()
    },
    watch: {
        '$route': 'fetchData'
    },
    methods: {
        fetchData () {
            db.collection('systems')
            .where('system_id', '==', this.$route.params.system_id)
            .get().then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    
                    this.system_id = doc.data().system_id 
                    this.title = doc.data().title 
                    this.body = doc.data().body 
                })
            })
        },
    }
}
</script>

<style>
#textBox {
    text-align: justify;
    text-justify: none;
    max-width: 520px;
}
hr { display: block; height: 1px;
    border: 0; border-top: 1px solid #ccc;
    margin: 1em 0; padding: 0; 
}
p {
display: inline;
}
#mdInline {
    color: rgb(255, 255, 255);
    cursor: pointer;
}
</style>