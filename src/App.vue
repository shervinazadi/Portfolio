<template>
    <div id="app">
        <div id="sideMenu">
            <Navbar />
        </div>
        <div id="mainBody">
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
    }
}
</script>

<style>
#sideMenu {
    position: fixed;
    top: 0px;
}
#mainBody {
    padding-left: 150px;
    padding-right: 50px;
    padding-top: 50px;
}
</style>