<template>
     <div id="new-employee"  class="container pt-5">
        <div class="card">
            <div class="card-header">
                <h4>Edit Player</h4>
            </div>
            <div class="card-body">
                <form @submit.prevent="saveEmployee" class="col s12">
                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text">Player ID</span>
                        </div>
                        <input type="text" v-model="employee_id" required class="form-control">
                    </div>
                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text">Name</span>
                        </div>
                        <input type="text" v-model="name" required class="form-control">
                    </div>
                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text">Role</span>
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
    name: 'new-employee',
    data () {
        return {
            employee_id: null,
            name: null,
            dept: null,
        }
    },
    methods: {
        saveEmployee () {
            db.collection('employees').add({
            employee_id: this.employee_id,
            name: this.name,
            dept: this.dept,
            position: this.position               
            })
            .then(docRef => {
                this.$router.push('/')
            })
            .catch(error => console.log(err))
        }
    }
}
</script>