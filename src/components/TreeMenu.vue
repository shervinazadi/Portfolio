
<template>
    <div class="tree-menu" id="vert-menu">
        <div id="side-by-side" :style="indent_sign" @click="toggleChildren">{{ sign }}</div>
        <div id="side-by-side" :style="indent" >{{ label }}</div>

        <div v-if="showChildren">
            <tree-menu
            v-for="node in nodes"
            :key="node.label"
            :nodes="node.nodes"
            :label="node.label"
            :depth="depth + 1"
            >
            </tree-menu>
        </div>
    </div>
</template>
<script>
    export default {
        props: [ 'label', 'nodes', 'depth' ],
        data() {
        return {
            showChildren: false,
            sign: "+"
            }
        },
        name: 'tree-menu',
        computed: {
        indent() {
            return { transform: `translate(${this.depth * 25}px)` }
        },
        indent_sign() {
            return { transform: `translate(${this.depth * 20}px)` }
        }
        },
        methods: {
        toggleChildren() {
            this.showChildren = !this.showChildren;
            if (this.sign == "+") this.sign = "-";
            else this.sign = "+"
        }
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
    left: 30px;
    top: 30px;
    font-weight: 500;
  	font-family: Helvetica Neue;
}
</style>
