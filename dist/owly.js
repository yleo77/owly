(function(){function a(a){this._listeners={},this.id="owly_"+(h++).toString(36),a=a||{},this.cache="boolean"===b(a.cache)?a.cache:!0}var b=function(a){return Object.prototype.toString.call(a).slice(8,-1).toLowerCase()},c=function(a,b){a&&!b&&(b=a,a={});for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c]);return a},d=function(a,c){if(b(a)!==c)throw new Error((a||"undefined").toString()+" ISNOT a "+c)},e=function(a){a=a.split(".");var b=a.length;return a.forEach(function(c,d){if("*"===a[d]){var e="([^.]+?)";0===d?e="^"+e:d===b-1&&(e+="$"),a[d]=e}}),new RegExp(a.join("\\."))},f=function(a){this._listeners[a]={calls:[],execed:0,args:null}},g=function(a,b){a.handle.apply(a.context||this,b),a.execed++},h=1,i={};c(a.prototype,{subscribe:function(a,b,e){if(d(b,"function"),d(a,"string"),e=c({name:a,handle:b,execed:0,times:1/0},e||{}),e.context=e.context||this,this._listeners[a]||f.call(this,a),this._listeners[a].calls.push(e),e.cache||"undefined"==typeof e.cache&&this.cache){var h,j=!1;if(this._listeners[a].execed>0)j=!0,h=this._listeners[a].args;else for(var k in i[this.id]){var l=i[this.id][k];l.reg.test(a)&&(j=!0,h=l.args)}j&&(this._listeners[a].execed++,g.call(this,e,h),e.execed>=e.times&&this.unsubscribe(a,b))}return this},publish:function(a){d(a,"string");var b,c=[].slice.call(arguments,1);if(/(\.?)\*(\.|$)/.test(a)){var h=e(a);i[this.id]=i[this.id]||{},i[this.id][a]||(i[this.id][a]={reg:h,args:c}),b=Object.keys(this._listeners).filter(function(a){return h.test(a)})}else this._listeners[a]||f.call(this,a),b=[a];var j;return b.forEach(function(a){this._listeners[a].execed++,this._listeners[a].args=c,j=this._listeners[a].calls.slice(0),this._listeners[a].calls.forEach(function(a,b){g.call(this,a,c),a.execed>=a.times&&j.splice(b,1)}),this._listeners[a].calls=j.slice(0)}.bind(this)),this},unsubscribe:function(a,b){return a?b?(d(a,"string"),this._listeners[a].calls.every(function(c,d){return this._listeners[a].calls[d].handle===b?(this._listeners[a].calls.splice(d,1),!1):void 0}.bind(this))):(this._listeners[a]=null,delete this._listeners[a]):this._listeners={},this},all:function(a,b,c){return d(a,"array"),d(b,"function"),c=c||{},a.length?(b=function(c,d){return function(e){return b._[e]=[].slice.call(arguments,1),--c>=1?void 0:d.apply(this,a.map(function(a){return b._[a]}))}}(a.length,b),b._={},a.forEach(function(a){this.one(a,function(){b.apply(c.context||this,[a].concat([].slice.call(arguments)))},c)}.bind(this)),this):this},one:function(a,b,c){return c=c||{},c.times=1,this.subscribe(a,b,c)}}),this.Owly=a,this.owly=new a({cache:!0})}).call(this);