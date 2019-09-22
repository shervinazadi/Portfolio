<template>
     <div id="new-system" class="row">
        <div class="container pt-5 col-sm-5">
            <div class="card text-white bg-dark border-light mb-3" >
                <div class="card-header">
                    <h4>Edit System</h4>
                </div>
                <div class="card-body ">
                    <form @submit.prevent="saveSystem" class="col s12">
                        <div class="input-group mb-3">
                            <div class="input-group-prepend ">
                                <span class="input-group-text  bg-dark text-white">System ID</span>
                            </div>
                            <input type="text" v-model="system_id" required class="form-control  bg-dark text-white">
                        </div>
                        <div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text bg-dark text-white">Title</span>
                            </div>
                            <input type="text" v-model="title" required class="form-control bg-dark text-white">
                        </div>
                        <div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text bg-dark text-white">Parent</span>
                            </div>
                            <input type="text" v-model="parent" required class="form-control bg-dark text-white">
                        </div>
                        <div class="input-group mb-3">
                            <textarea v-model="body" class="form-control bg-dark text-white" id="mdEditor" :rows="textHeight" ref="mdEditor"></textarea>
                        </div>
                        <hr>
                        <div>
                            <button type="submit" class="btn btn-primary">Submit</button>
                            <router-link to="/" class="btn btn-outline-danger">Cancel</router-link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <!-- <div class="container pt-5 col-sm-6" id="textBox" v-html="mdContent"></div> -->
        <div class="container pt-5 col-sm-6" id="textBox">
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
    name: 'new-system',
    data () {
        return {
            system_id: null,
            title: null,
            parent: null,
            body: "type",
        }
    },
    computed: {
        mdRendered() {
            var ren = md.render(this.body);
            ren = ren.replace(/<br>/g, '<br><br>'); 
            return ren
        },
        textHeight() {
            if (this.body === "type"){
                return 5
            } else {
            var textHeight = document.getElementById("mdEditor").scrollHeight
            textHeight -= 12
            var rows = Math.ceil(textHeight/24)
            rows = rows > 5 ? rows : 5;
            return rows
            }
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
                        var collapsed  =  '[+] ';
                        for (i=0; i<count; i++) lclInlineList.push(collapsed) 
                        return lclInlineList
                    },
                    evalFunc: function(str,id) {
            
                        if (this.inlineList[id] === '[+] ') {
                            var newHidden = ' '+ str + ' ';
                            this.expand(newHidden,id);
                        } else {
                            var newHidden = '[+] ';
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
                            if (counter < 6) {
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
    methods: {
        saveSystem () {
            console.log("form recieved:")
            console.log(
                this.system_id,
                this.title,
                this.parent,
                this.body 
            )

            db.collection('systems').add({
            system_id: this.system_id,
            title: this.title,
            parent: this.parent,
            body: this.body              
            })
            .then(docRef => {
                this.$router.push('/')
            })
            .catch(error => console.log(err))
        }
    }
}
</script>

<style>
#FormBox {
    text-align: justify;
    text-justify: none;
    width: 520px;
}
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
img{
    width: 520px;
}
#mdInline {
    color: rgb(134, 134, 134);
    cursor: pointer;
}
</style>