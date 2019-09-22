
<template>
    <div class="tree-menu" id="vert-menu">
        <div id="side-by-side-sign" :style="indent" @click='toggleChildren'>{{ sign }}</div>
        <!-- <div id="side-by-side" :style="indent" >{{ system_id }}</div> -->
        <router-link id="side-by-side" :style="indent" v-bind:to="{name: 'view-system', params: {system_id: system_id}}">{{ system_id }}</router-link>

        <div v-if="showChildren">
            <tree-menu
            v-for="node in nodes"
            :key="node.system_id"
            :nodes="node.nodes"
            :system_id="node.system_id"
            :depth="depth + 1">
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
                return { transform: `translate(${this.depth * -3}px)` }
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
#side-by-side-sign {
    display: inline-block;
    width: 10px;
    font-weight: 800;
    font-family: Helvetica Neue, monospace;
    cursor: pointer;
}
#side-by-side {
    display: inline-block;
    width: 15px;
    font-weight: 400;
  	font-family: Helvetica Neue, monospace;
    cursor: pointer;
    
}
/* unvisited link */
#side-by-side:link {
  color: rgb(210, 210, 210);
  text-decoration: none;
}
/* visited link */
#side-by-side:visited {
  color: rgb(210, 210, 210);
  text-decoration: none;
}
/* mouse over link */
#side-by-side:hover {
  color: rgb(210, 210, 210);
  text-decoration: none;
}
/* selected link */
#side-by-side:active {
  color: rgb(210, 210, 210);
  text-decoration: none;
}
#vert-menu {
    position: relative;
    left: 12px;
    top: 7px;
    font-weight: 400;
  	font-family: Helvetica Neue, monospace;
    
}
</style>
