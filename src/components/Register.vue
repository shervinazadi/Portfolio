<template>
    <div class="pt-5">
        <div class="card text-black bg-light mb-3">
                        <div class="card-header">
                            <h3>Register</h3>
                        </div>
                        <div class="card-body">
                            <form>
                                <div class="input-group mb-3">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text">Email</span>
                                    </div>
                                    <input type="email" id="email" v-model="email" required class="form-control">
                                </div>
                                <div class="input-group mb-3">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text">Password</span>
                                    </div>
                                    <input type="password" id="password" v-model="password" required class="form-control">
                                </div>
                                <buttun v-on:click="register" class="btn btn-outline-success">Register</buttun>
                            </form>
                        </div>
        </div>
    </div>
</template>

<script>
import firebase from 'firebase'
export default {
    name: 'register',
    data: function () {
        return {
            email: '',
            password: ''
        }
    },
    methods: {
        register: function(e) {
            firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
                .then(user => {
                    alert(`Account Created`)
                    //this.$router.go({path: this.$router.path})
                    window.location.reload(true)
                    this.$router.push('/')
                    
                },
                err => {
                    alert(err.message)
                })
            e.preventDefault();
            
        }
    }
}
</script>
