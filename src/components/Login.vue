<template>
    <div class="container pt-5">
        <div class="card">
                        <div class="card-header">
                            <h3>Login</h3>
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
                                <buttun v-on:click="login" class="btn btn-outline-primary">Sign In</buttun>
                                <buttun v-on:click="register" class="btn btn-outline-success">Sign Up</buttun>
                            </form>
                        </div>
        </div>
    </div>
</template>

<script>
import firebase from 'firebase'
export default {
    name: 'login',
    data: function () {
        return {
            email: '',
            password: ''
        }
    },
    methods: {
        login: function(e) {
            firebase.auth().signInWithEmailAndPassword(this.email, this.password)
                .then(user => {
                    //alert(`you are logged in`)
                    //this.$router.go({path: this.$router.path})
                    window.location.reload(true)
                    this.$router.push('/')
                    
                    
                },
                err => {
                    alert(err.message)
                })
            e.preventDefault();
            
        },
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
