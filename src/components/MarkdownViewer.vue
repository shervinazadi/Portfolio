<script>
export default {
    name: 'markdown-viewer',
    template: 
            `<div id="markdown-viewer" class="markdown-viewer">
                <div id="textBox">
                    ${this.mdRendered}
                </div>
            </div>`,
    data () {
        return {
            system_id: null,
            title: null,
            body: '::: ::: ::: ::: ::: :::',
            inlineList: [],
        }
    },
    created: function() {
        //this.fetchData()
        //find the occurance number
        var count = (this.body.match(/:::/g) || []).length;
        //initialize the list
        console.log("here")
        this.initList(count/2)
    },
    methods: {
        initList: function(count) {
            var i;
            var collapsed  =  '[+] ';
            console.log(count)
            for (i=0; i<count; i++) {
                this.inlineList.push(collapsed) 
                
            }
                
        },
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
        splice: function(initString, idx, rem, newString) {
            //(initial string, the index to insert the str, the number of char to remove, the new string)
            return initString.slice(0, idx) + newString + initString.slice(idx + Math.abs(rem),initString.length);
        },
    }
}
</script>
