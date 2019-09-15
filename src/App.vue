<template>
    <div id="app">
        <div :id="navbarID">
            <Navbar />
        </div>
        <div :id="bodyID">
            <router-view />
        </div>
    </div>
</template>

<script>
import Navbar from './components/Navbar'
export default {
    name: 'App',
    components: {
        Navbar
    },
    data() {
        return {
            window: {
                width: 0,
                height: 0
            },
            bodyID: null,
            navbarID: null,
        }
    },
    created() {
        //open the listener for the window size
        window.addEventListener('resize', this.handleResize)
        this.handleResize();
    },
    destroyed() {
        //close the listener for the window size
        window.removeEventListener('resize', this.handleResize)
    },
    methods: {
        handleResize() {
            //change the size
            this.window.width = window.innerWidth;
            this.window.height = window.innerHeight;
            //chenge the css styling base on the size
            if (window.innerWidth > 540) {
                this.bodyID = 'deskBody'
                this.navbarID = 'sideMenu'
            } else {
                this.bodyID = 'mobilBody'
                this.navbarID = 'topMenu'
            }
        },
    }
}
</script>

<style>
#topMenu {
    position: relative;
    top: 0px;
}
#sideMenu {
    position: fixed;
    top: 0px;
}
#deskBody {
    padding-left: 150px;
    padding-right: 50px;
    padding-top: 50px;
    max-width: 700px;
}
#mobilBody {
    padding-left: 25px;
    padding-right: 25px;
    padding-top: 50px;
}body {
  background-image: linear-gradient(-90deg, rgba(33, 33, 33), rgb(43, 43, 43));
  color: aliceblue;
}
</style>