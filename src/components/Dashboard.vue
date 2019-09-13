<template>
    <div id="dashboard"> <!-- class="container pt-5">
        <div class="card">
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
        </div> -->
        <div v-html="mdContent"></div>
    </div>

</template>

<script>
import firebase from 'firebase'
import {db} from './firebaseInit'
import foo from 'frontmatter-markdown-loader!./blog/foo.md'
export default {
    name: 'dashboard',
    data () {
        return {
            employees: [],
            isLoggedIn: false,
            currentUser: false,
            mdContent: null,
        }
    },
    created () {
        if (firebase.auth().currentUser) {
            this.isLoggedIn = true
            this.currentUser = firebase.auth().currentUser.email
            this.mdContent = foo.html;
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
