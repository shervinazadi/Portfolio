<template>
    <div id="view-employee" class="container pt-5">
        <div class="card">
            <div class="card-header">
                <h4>{{name}}</h4>
            </div>
            <ul class="list-group list-group-flush">
                <li class="list-group-item">Game ID : {{employee_id}}</li>
                <li class="list-group-item">Owner : {{dept}}</li>
                <router-link class="list-group-item btn btn-outline-primary" to="/rtplay">Playboard</router-link>
                <router-link class="list-group-item btn btn-outline-warning" to="/rtthreed">3D (under construction)</router-link>
            </ul>
        </div>
        <hr>
        <div class="card">
            <ul class="list-group list-group-flush">
                <router-link to="/" class="list-group-item btn btn-outline-dark">Back</router-link>
                <router-link v-bind:to="{name: 'edit-employee', params: {employee_id: employee_id}}" class="list-group-item btn btn-outline-primary">Edit Information</router-link>
                <button @click="doNothing" class="list-group-item btn btn-outline-danger">Delete (to be implemented)</button>
            </ul>

            <div class="fixed-action-btn">
                <router-link v-bind:to="{name: 'edit-employee', params: {employee_id: employee_id}}" class="btn-floating btn-larg red">
                    <i class="fa fa-pencil"></i>
                </router-link>
            </div>
        </div>
    </div>
</template>

<script>
import {db} from './firebaseInit'

export default {
    name: 'view-employee',
    data () {
        return {
            employee_id: null,
            name: null,
            dept: null,
        }
    },
    beforeRouteEnter (to, from, next) {
        db.collection('employees')
        .where('employee_id', '==', to.params.employee_id)
        .get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                next(vm => {
                    vm.employee_id = doc.data().employee_id 
                    vm.name = doc.data().name 
                    vm.dept = doc.data().dept
                })
            })
        })
    },
    watch: {
        '$route': 'fetchData'
    },
    methods: {
        fetchData () {
            db.collection('employees')
            .where('employee_id', '==', this.$route.params.employee_id)
            .get().then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    this.employee_id = doc.data().employee_id 
                    this.name = doc.data().name 
                    this.dept = doc.data().dept 
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