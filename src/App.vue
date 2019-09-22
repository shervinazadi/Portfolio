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
    padding-left: 200px;
    padding-right: 50px;
    padding-top: 50px;
    padding-bottom: 100px;
    /* max-width: 1000px; */
}
#mobilBody {
    padding-left: 25px;
    padding-right: 25px;
    padding-top: 50px;
    padding-bottom: 50px;
}
body {
    background-image: linear-gradient(90deg, rgb(36, 36, 36), rgb(43, 43, 43));
    color: rgb(214, 214, 214);
    background-attachment: fixed;
    font-family: Helvetica Neue, monospace;
    letter-spacing: 0.5px;
    /*font-family: Helvetica Neue, monospace; */
    /*font-family: "Courier New", Courier, "Lucida Sans Typewriter", "Lucida Typewriter", monospace;*/
}
/* unvisited link */
a:link {
  color: rgb(93, 160, 234);
  text-decoration: underline;
}
/* visited link */
a:visited {
  color: rgb(93, 160, 234);
  text-decoration: underline;
}
/* mouse over link */
a:hover {
  color: rgb(128, 179, 235);
  text-decoration: underline;
}
/* selected link */
a:active {
  color: rgb(93, 160, 234);
  text-decoration: underline;
}
p {
    
}
</style>