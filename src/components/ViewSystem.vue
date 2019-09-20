
<script>
import {db} from './firebaseInit'
import Vue from 'vue'
//importing the markdown file as a string
import footext from 'raw-loader!./blog/foo.md'
var MDtext = footext

//initializing thee markdown interpreter
var md = require('markdown-it')({
    breaks:true,
});

////test area

var inlineCounter  = -1;
md.use(require('markdown-it-container'), 'inline', {

  validate: function(params) {
      
    return params.trim().match(/^inline\s+(.*)$/);
  },

  render: function (tokens, idx) {
    if (tokens[idx].nesting === 1) {
      var m = tokens[idx].info.trim().match(/^inline\s+(.*)$/);
      // opening tag
      
      var ss0 = '<span id="mdInline" @click="evalFunc';
      var ss1 = "('";
      var ss2 = "',"
      var ss3 = ")";
      var ss4 = '">{{ inlineList[';
      var ss5 =  '] }}';
      inlineCounter++;
      
      var CounterStr = inlineCounter.toString()
      return ss0 + ss1 + md.utils.escapeHtml(m[1]) + ss2 + CounterStr + ss3 + ss4 + CounterStr + ss5;
    }if (tokens[idx].nesting === 2) {
      var m = tokens[idx].info;
      // middle tag

      return '' //m
    }if (tokens[idx].nesting === -1) {
      // closing tag
      return "</span>";
    }
  }
});

/////

//rendering the markdown before hand
var mdRenndered = md.render(MDtext);
mdRenndered = mdRenndered.replace(/<br>/g, '<br><br>'); 




export default {
    name: 'view-system',
    template: 
        `<div id="view-system">
            <!-- <div id="textBox" v-html="mdContent"></div> -->
            <div id="textBox">`
                +mdRenndered+
            `</div>
        </div>`,
    data () {
        return {
            system_id: null,
            title: null,
            body: null,
            mdContent: null,
            intervalid1:'',
            inlineList: [],
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
        var i;
        var collapsed  =  '[+] ';
        for (i=0; i<inlineCounter+1; i++){
            this.inlineList.push(collapsed)
        }
    },
    watch: {
        '$route': 'fetchData'
    },
    methods: {
        evalFunc: function(str,id) {
            
            if (this.inlineList[id] === '[+] ') {
                //Vue.set(this.inlineList, id, newHidden)
                var newHidden = ' '+ str + ' ';
                this.expand(newHidden,id);
            } else {
                //Vue.set(this.inlineList, id, '[+] ')
                var newHidden = '[+] ';
                this.collapse(newHidden,id);
            } 
        },
        splice: function(initString, idx, rem, newString) {
            //(initial string, the index to insert the str, the number of char to remove, the new string)
            return initString.slice(0, idx) + newString + initString.slice(idx + Math.abs(rem),initString.length);
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
        expand: function(newHidden,id){ 
            //matter of safety
            var self = this
            //saving the  satatus quo
            var tempHidden = this.inlineList[id];
            //initializing the counter
            var counter = 0;
            //interval loop
            this.intervalid1 = setInterval(() => {
                //adding charachters one by one
                tempHidden  = self.splice(tempHidden,counter+1,counter==0,newHidden[counter]);
                //updating the data list
                Vue.set(this.inlineList, id, tempHidden)
                //counter
                counter++;
                // break the loop
                if (counter > newHidden.length-1) clearInterval(self.intervalid1)
            }, 1000 / 120);
        },
        collapse: function(newHidden,id){ 
            //matter of safety
            var self = this
            //saving the  satatus quo
            var tempHidden = this.inlineList[id];
            //initializing the counter
            var counter = tempHidden.length;
            //interval loop
            this.intervalid1 = setInterval(() => {
                //removing charachters one by one
                tempHidden  = self.splice(tempHidden,2,1,'');
                //updating the data list
                Vue.set(this.inlineList, id, tempHidden)
                //counter
                counter--;
                // break the loop
                if (counter < 6) {
                    //add the plus sign
                    tempHidden  = self.splice(tempHidden,1,2,'+');
                    Vue.set(this.inlineList, id, tempHidden)
                    clearInterval(self.intervalid1)
                    }
            }, 1000 / 180);
        },
    }
}
</script>

<style>
#textBox {
    text-align: justify;
    text-justify: auto;
    max-width: 700px;
}
hr { display: block; height: 1px;
    border: 0; border-top: 1px solid #ccc;
    margin: 1em 0; padding: 0; 
}
p {
display: inline;
}
#mdInline {
    color: rgb(134, 134, 134);
    cursor: pointer;
}
</style>