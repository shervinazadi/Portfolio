<template>
    <div>
        <nav class="navbar navbar-expand-lg navbar-light bg-white">
            <router-link to="/" class="navbar-brand" >Playscapes</router-link>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo02" aria-controls="navbarTogglerDemo02" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarTogglerDemo02">
                <ul class="navbar-nav ml-auto mt-2 mt-lg-0">
                    <li class="nav-item" v-if="isLoggedIn"><router-link class="nav-link" to="/rtplay">RT Playboard</router-link></li>
                    <li class="nav-item" v-if="isLoggedIn"><router-link class="nav-link" to="/rtthreed">RT 3D</router-link></li>
                    <li class="nav-item" v-if="isLoggedIn"><router-link class="nav-link" to="/">{{currentUser}}</router-link></li>
                    <li class="nav-item" v-if="!isLoggedIn"><router-link class="nav-link" to="/login">Login</router-link></li>
                    <li class="nav-item" v-if="!isLoggedIn"><router-link class="nav-link" to="/register">Register</router-link></li>
                    <li class="nav-item" v-if="isLoggedIn"><button v-on:click="logout" class="btn btn-outline-dark my-2 my-sm-0">Logout</button></li>
                </ul>
            </div>
        </nav>
    </div>
</template>

<script>
import firebase from 'firebase'
export default {
    name: 'navbar',
    data() {
        return {
            isLoggedIn: false,
            currentUser: false
        }
    },
    created() {
        if (firebase.auth().currentUser) {
            this.isLoggedIn = true
            this.currentUser = firebase.auth().currentUser.email
        }
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