<template>
    <div id="view-system">
        <!-- <div id="textBox" v-html="mdContent"></div>
        <div id="textBox" v-html="mdTest"></div>  -->
        <span @click="testFunc('lalaala')">fgfg</span>
        <span @click="testFunc('hey im hidden')"><p>here</p></span>
    </div>
</template>

<script>
import {db} from './firebaseInit'

//importing the markdown file as a string
import footext from 'raw-loader!./blog/foo.md'

//initializing thee markdown interpreter
var md = require('markdown-it')({
    breaks: true, 
});

var text = footext

//rendering the markdown as html
//var result = md.render(footext);

////test area

var md = require('markdown-it')();

md.use(require('markdown-it-container'), 'inline', {

  validate: function(params) {
    return params.trim().match(/^inline\s+(.*)$/);
  },

  render: function (tokens, idx) {
    var m = tokens[idx].info.trim().match(/^inline\s+(.*)$/);

    if (tokens[idx].nesting === 1) {
      // opening tag
      var s0 = '<span @click="testFunc';
      var s1 = "('";
      var s2 = "')";
      var s3 = '">';
      return s0 + s1 + md.utils.escapeHtml(m[1]) + s2 + s3;

    } else {
      // closing tag
      return "</span>";
    }
  }
});

console.log(md.render('::: inline hey im hidden\n here \n:::\n'));

/////


export default {
    name: 'view-system',
    data (to) {
        return {
            system_id: null,
            title: null,
            body: null,
            mdContent: null,
            mdTest: null,
            counter: 0,
            intervalid1:'',
            textBody: '',
        }
    },
     beforeRouteEnter (to, from, next) {
        db.collection('systems')
        .where('system_id', '==', to.params.system_id)
        .get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                next(vm => {
                    vm.system_id = doc.data().system_id 
                    vm.body = doc.data().body 
                    vm.title = doc.data().title
                })
            })
        })
        
    },
    created: function() {
        this.fetchData()
        //this.recalc()
        this.mdTest = md.render('::: inline hey im hidden\nhere2\n:::\n')
        console.log(this.mdTest)
    },
    watch: {
        '$route': 'fetchData'
    },
    methods: {
        testFunc: function(str) {
            console.log('im here' + str)
        },
        inact: function(c) {
            //this.textBody = this.splice(textest, 100, 0, 'H ')
            this.textBody = text.slice(0,c)
        },
        splice: function(init, idx, rem, str) {
            return init.slice(0, idx) + str + init.slice(idx + Math.abs(rem));
        },
        fetchData () {
            db.collection('systems')
            .where('system_id', '==', this.$route.params.system_id)
            .get().then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    this.system_id = doc.data().system_id 
                    this.title = doc.data().title 
                    this.body = doc.data().body 
                    this.mdContent = doc.data().body;
                })
            })
        },
        recalc: function(){  
            var test = 'hello'
            this.textBody = text;
            var counter = 0;
            this.intervalid1 = setInterval(() => {
                //counter
                counter += 1;
                this.inact(counter)
                this.mdTest = md.render(this.textBody);
                // break the loop
                if (counter > text.length) clearInterval(this.intervalid1)
            }, 1000 / 100);
        },
        
    }
}
</script>

<style>
#textBox {
    text-align: justify;
    text-justify: inter-word;
    max-width: 700px;
}
hr { display: block; height: 1px;
    border: 0; border-top: 1px solid #ccc;
    margin: 1em 0; padding: 0; }
</style>