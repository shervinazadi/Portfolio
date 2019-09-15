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
        window.addEventListener('resize', this.handleResize)
        this.handleResize();
    },
    destroyed() {
        window.removeEventListener('resize', this.handleResize)
    },
    methods: {
        handleResize() {
            this.window.width = window.innerWidth;
            this.window.height = window.innerHeight;
            console.log(this.window.width)
            if (window.innerWidth > 540) {
                this.bodyID = 'deskBody'
                this.navbarID = 'sideMenu'
            } else {
                this.bodyID = 'mobilBody'
                this.navbarID = 'topMenu'
            }
            console.log(this.bodyID)
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
}
#mobilBody {
    padding-left: 50px;
    padding-right: 50px;
    padding-top: 50px;
}
</style>