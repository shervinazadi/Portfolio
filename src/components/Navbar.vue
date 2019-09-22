<template>
    <div>
        <tree-menu :system_id="localTree.system_id" :nodes="localTree.nodes" :depth="0"></tree-menu>
    </div>
</template>

<script>
import firebase from 'firebase'
import TreeMenu from './TreeMenu.vue'
import {db} from './firebaseInit'

export default {
    name: 'navbar',
    components: {
        TreeMenu
    },
    data() {
        return {
            isLoggedIn: false,
            currentUser: false,
            localTree: {
                system_id: 'assemblage',
                nodes:[]
            },
        }
    },
    created() {
        if (firebase.auth().currentUser) {
            this.isLoggedIn = true
            this.currentUser = firebase.auth().currentUser.email
        }
        this.fetchPages(this.localTree)
    },
    methods: {
        logout: function() {
            firebase.auth().signOut().then(
                () => {
                    //this.$router.go({path: this.$router.path})
                    this.$router.push('/login')
                    window.location.reload(true)
                }
            )
        },
        //recursive function to find the order od pages
        fetchPages (parentNode) { 
            db.collection('systems')
            .where('parent', '==', parentNode.system_id)
            .get().then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    const childNode = { //creating the child node
                        'id': doc.id,
                        'system_id': doc.data().system_id,
                        'parent': doc.data().parent,
                        'title': doc.data().title,
                        'nodes' : []
                    }
                    this.fetchPages(childNode) //runing the function for the child node
                    parentNode.nodes.push(childNode) //pushing the node to the upper level nodes list
                })
            })
        },
    }
}
</script>


