<template>
     <div id="new-employee" class="row">
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
        <div class="container pt-5 col-sm-6" id="textBox" v-html="mdContent"></div>
    </div>
</template>

<script>
import {db} from './firebaseInit'
//initializing thee markdown interpreter
var md = require('markdown-it')({
    breaks:true,
});


export default {
    name: 'new-employee',
    data () {
        return {
            system_id: null,
            title: null,
            parent: null,
            body: "type",
        }
    },
    computed: {
        mdContent() {
            var mdRenndered = md.render(this.body);
            mdRenndered = mdRenndered.replace(/<br>/g, '<br><br>'); 
            return mdRenndered
        },
        textHeight() {
            if (this.body === "type"){
                return 1
            } else {
            var textHeight = document.getElementById("mdEditor").scrollHeight
            textHeight -= 12
            return Math.ceil(textHeight/24)
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
</style>