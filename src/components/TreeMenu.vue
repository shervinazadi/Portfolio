
<template>
    <div class="tree-menu" id="vert-menu">
        <div id="side-by-side" :style="indent" @click="toggleChildren">{{ sign }}</div>
        <div id="side-by-side" :style="indent" >{{ system_id }}</div>

        <div v-if="showChildren">
            <tree-menu
            v-for="node in nodes"
            :key="node.system_id"
            :nodes="node.nodes"
            :system_id="node.system_id"
            :depth="depth + 1"
            >
            </tree-menu>
        </div>
    </div>
</template>

<script>
    export default {
        props: [ 'system_id', 'nodes', 'depth'],
        name: 'tree-menu',
        data() {
            return {
                showChildren: this.calcShowChild(),
            }
        },
        computed: {
        indent() {
            return { transform: `translate(${this.depth * 10}px)` }
        },

        sign() {
            if (!this.showChildren) return "+";
            else return "-";
        },
        },
        methods: {
        toggleChildren() {
            this.showChildren = !this.showChildren;
        },
        calcShowChild() {
            if (this.depth == 0) return true;
            else return false;
        },
        }
    }
</script>

<style>
#side-by-side {
    display: inline-block;
    width: 10px;
    font-weight: 500;
  	font-family: Helvetica Neue;
}
#vert-menu > #side-by-side{
    position: relative;
    left: 12px;
    top: 7px;
    font-weight: 400;
  	font-family: Helvetica Neue;
}
</style>
