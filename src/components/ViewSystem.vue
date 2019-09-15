<template>
    <div id="view-system">
        <div id="textBox" v-html="mdContent"></div> 
    </div>
</template>

<script>
import {db} from './firebaseInit'

//importing the markdown file as a string
import footext from 'raw-loader!./blog/foo.md'

//initializing thee markdown interpreter
var md = require('markdown-it')({
    breaks:       true, 
});
//rendering the markdown as html
var result = md.render(footext);



export default {
    name: 'view-system',
    data (to) {
        return {
            system_id: null,
            title: null,
            body: null,
            mdContent: null,
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
                    this.mdContent = doc.data().body;
                })
            })
        },
        deleteEmployee () {
            if(confirm('Sure?')) {
                db.collection('employees')
                .where('employee_id', '==', this.$route.params.employee_id)
                .get().then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        doc.ref.delete()
                        this.$router.push('/')
                    })
                })
            }
        },
        doNothing() {
            console.log("to be implemented")
        },
        anchorManualUpdate: function(){
            this.anchorManual = this.tempAnchorList()
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
        
    }
}
</script>

<style>
#textBox {
    text-align: justify;
    text-justify: inter-word;
}
</style>