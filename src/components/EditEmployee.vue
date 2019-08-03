<template>
    <div id="edit-employee"  class="container pt-5">
        <div class="card">
            <div class="card-header">
                <h4>Edit Game</h4>
            </div>
            <div class="card-body">
                <form @submit.prevent="updateEmployee" class="col s12">
                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text">Game ID</span>
                        </div>
                        <input type="text" disabled v-model="employee_id" required class="form-control">
                    </div>
                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text">Name</span>
                        </div>
                        <input type="text" v-model="name" required class="form-control">
                    </div>
                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text">Owner</span>
                        </div>
                        <input type="text" v-model="dept" required class="form-control">
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
</template>

<script>
import {db} from './firebaseInit'
export default {
    name: 'edit-employee',
    data () {
        return {
            employee_id: null,
            name: null,
            dept: null,
            position: null
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
        updateEmployee () {
            if(confirm('Sure?')) {
                db.collection('employees')
                .where('employee_id', '==', this.$route.params.employee_id)
                .get().then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        doc.ref.update({
                            employee_id: this.employee_id,
                            name: this.name,
                            dept: this.dept,
                        })
                        .then(() => {
                            this.$router.push({name: 'view-employee', params: {employee_id: this.employee_id}})
                        })
                        
                    })
                })
            }
        }
    }
}
</script>