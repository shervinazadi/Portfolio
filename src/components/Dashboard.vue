<template>
    <div id="dashboard" class="container pt-5">
        <div class="card">
            <ul class="list-group list-group-flush">
                <li class="list-group-item">Signed in as: {{currentUser}}</li>
                <button @click="logout" class="list-group-item btn btn-outline-danger">Sign Out</button>
            </ul>
        </div>
        <hr>
        <div class="card">
            <div class="card-header">
                <h4>Ongoing Games</h4>
            </div>
            <table class="table table-striped">
                <thead>
                    <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Name</th>
                    <th scope="col">Owner</th>
                    <th scope="col">Overview</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="employee in employees" v-bind:key="employee.id">
                        <th scope="row">{{employee.employee_id}}</th>
                        <td>{{employee.name}}</td>
                        <td>{{employee.dept}}</td>
                        <td><router-link v-bind:to="{name: 'view-employee', params: {employee_id: employee.employee_id}}" class="btn btn-outline-primary">view</router-link></td>
                    </tr>
                </tbody>
            </table>
            <ul class="list-group list-group-flush">
                <router-link to="/" class="list-group-item btn btn-outline-success">Add (to be implemented)</router-link>
            </ul>
                
        </div>

    </div>
</template>

<script>
import firebase from 'firebase'
import {db} from './firebaseInit'
export default {
    name: 'dashboard',
    data () {
        return {
            employees: [],
            isLoggedIn: false,
            currentUser: false
        }
    },
    created () {
        if (firebase.auth().currentUser) {
            this.isLoggedIn = true
            this.currentUser = firebase.auth().currentUser.email
        }
        db.collection('employees').orderBy('employee_id').get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const data = {
                    'id': doc.id,
                    'employee_id': doc.data().employee_id,
                    'name': doc.data().name,
                    'dept': doc.data().dept
                }
                this.employees.push(data)
            })
        })
        console.log(this.employees)
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
        }
    }
}
</script>