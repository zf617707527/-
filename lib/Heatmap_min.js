  1 /**
  2  * @fileoverview 百度地图的热力图功能,对外开放。
  3  * 主要基于http://www.patrick-wied.at/static/heatmapjs/index.html 修改而得
  4 
  5 
  6 /*==============================以下部分为heatmap.js的核心代码,只负责热力图的展现, 代码来自第三方====================================*/
  7 
  8 /*
  9  * heatmap.js 1.0 -    JavaScript Heatmap Library
 10  *
 11  * Copyright (c) 2011, Patrick Wied (http://www.patrick-wied.at)
 12  * Dual-licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 13  * and the Beerware (http://en.wikipedia.org/wiki/Beerware) license.
 14  */
 15 
 16 (function(w){
 17     // the heatmapFactory creates heatmap instances
 18     var heatmapFactory = (function(){
 19 
 20     // store object constructor
 21     // a heatmap contains a store
 22     // the store has to know about the heatmap in order to trigger heatmap updates when datapoints get added
 23     var store = function store(hmap){
 24 
 25         var _ = {
 26             // data is a two dimensional array
 27             // a datapoint gets saved as data[point-x-value][point-y-value]
 28             // the value at [point-x-value][point-y-value] is the occurrence of the datapoint
 29             data: [],
 30             // tight coupling of the heatmap object
 31             heatmap: hmap
 32         };
 33         // the max occurrence - the heatmaps radial gradient alpha transition is based on it
 34         this.max = 1;
 35 
 36         this.get = function(key){
 37             return _[key];
 38         };
 39         this.set = function(key, value){
 40             _[key] = value;
 41         };
 42     }
 43 
 44     store.prototype = {
 45         // function for adding datapoints to the store
 46         // datapoints are usually defined by x and y but could also contain a third parameter which represents the occurrence
 47         addDataPoint: function(x, y){
 48             if(x < 0 || y < 0)
 49                 return;
 50 
 51             var me = this,
 52                 heatmap = me.get("heatmap"),
 53                 data = me.get("data");
 54 
 55             if(!data[x])
 56                 data[x] = [];
 57 
 58             if(!data[x][y])
 59                 data[x][y] = 0;
 60 
 61             // if count parameter is set increment by count otherwise by 1
 62             data[x][y]+=(arguments.length<3)?1:arguments[2];
 63             
 64             me.set("data", data);
 65             // do we have a new maximum?
 66             if(me.max < data[x][y]){
 67                 // max changed, we need to redraw all existing(lower) datapoints
 68                 heatmap.get("actx").clearRect(0,0,heatmap.get("width"),heatmap.get("height"));
 69                 me.setDataSet({ max: data[x][y], data: data }, true);
 70                 return;
 71             }
 72             heatmap.drawAlpha(x, y, data[x][y], true);
 73         },
 74         setDataSet: function(obj, internal){
 75             var me = this,
 76                 heatmap = me.get("heatmap"),
 77                 data = [],
 78                 d = obj.data,
 79                 dlen = d.length;
 80             // clear the heatmap before the data set gets drawn
 81             heatmap.clear();
 82             this.max = obj.max;
 83             // if a legend is set, update it
 84             heatmap.get("legend") && heatmap.get("legend").update(obj.max);
 85             
 86             if(internal != null && internal){
 87                 for(var one in d){
 88                     // jump over undefined indexes
 89                     if(one === undefined)
 90                         continue;
 91                     for(var two in d[one]){
 92                         if(two === undefined)
 93                             continue;
 94                         // if both indexes are defined, push the values into the array
 95                         heatmap.drawAlpha(one, two, d[one][two], false);   
 96                     }
 97                 }
 98             }else{
 99                 while(dlen--){
100                     var point = d[dlen];
101                     heatmap.drawAlpha(point.x, point.y, point.count, false);
102                     if(!data[point.x])
103                         data[point.x] = [];
104 
105                     if(!data[point.x][point.y])
106                         data[point.x][point.y] = 0;
107 
108                     data[point.x][point.y] = point.count;
109                 }
110             }
111             heatmap.colorize();
112             this.set("data", d);
113         },
114         exportDataSet: function(){
115             var me = this,
116                 data = me.get("data"),
117                 exportData = [];
118 
119             for(var one in data){
120                 // jump over undefined indexes
121                 if(one === undefined)
122                     continue;
123                 for(var two in data[one]){
124                     if(two === undefined)
125                         continue;
126                     // if both indexes are defined, push the values into the array
127                     exportData.push({x: parseInt(one, 10), y: parseInt(two, 10), count: data[one][two]});
128                 }
129             }
130 
131             return { max: me.max, data: exportData };
132         },
133         generateRandomDataSet: function(points){
134             var heatmap = this.get("heatmap"),
135             w = heatmap.get("width"),
136             h = heatmap.get("height");
137             var randomset = {},
138             max = Math.floor(Math.random()*1000+1);
139             randomset.max = max;
140             var data = [];
141             while(points--){
142                 data.push({x: Math.floor(Math.random()*w+1), y: Math.floor(Math.random()*h+1), count: Math.floor(Math.random()*max+1)});
143             }
144             randomset.data = data;
145             this.setDataSet(randomset);
146         }
147     };
148 
149     var legend = function legend(config){
150         this.config = config;
151 
152         var _ = {
153             element: null,
154             labelsEl: null,
155             gradientCfg: null,
156             ctx: null
157         };
158         this.get = function(key){
159             return _[key];
160         };
161         this.set = function(key, value){
162             _[key] = value;
163         };
164         this.init();
165     };
166     legend.prototype = {
167         init: function(){
168             var me = this,
169                 config = me.config,
170                 title = config.title || "Legend",
171                 position = config.position,
172                 offset = config.offset || 10,
173                 gconfig = config.gradient,
174                 labelsEl = document.createElement("ul"),
175                 labelsHtml = "",
176                 grad, element, gradient, positionCss = "";
177  
178             me.processGradientObject();
179             
180             // Positioning
181 
182             // top or bottom
183             if(position.indexOf('t') > -1){
184                 positionCss += 'top:'+offset+'px;';
185             }else{
186                 positionCss += 'bottom:'+offset+'px;';
187             }
188 
189             // left or right
190             if(position.indexOf('l') > -1){
191                 positionCss += 'left:'+offset+'px;';
192             }else{
193                 positionCss += 'right:'+offset+'px;';
194             }
195 
196             element = document.createElement("div");
197             element.style.cssText = "border-radius:5px;position:absolute;"+positionCss+"font-family:Helvetica; width:256px;z-index:10000000000; background:rgba(255,255,255,1);padding:10px;border:1px solid black;margin:0;";
198             element.innerHTML = "<h3 style='padding:0;margin:0;text-align:center;font-size:16px;'>"+title+"</h3>";
199             // create gradient in canvas
200             labelsEl.style.cssText = "position:relative;font-size:12px;display:block;list-style:none;list-style-type:none;margin:0;height:15px;";
201             
202 
203             // create gradient element
204             gradient = document.createElement("div");
205             gradient.style.cssText = ["position:relative;display:block;width:256px;height:15px;border-bottom:1px solid black; background-image:url(",me.createGradientImage(),");"].join("");
206 
207             element.appendChild(labelsEl);
208             element.appendChild(gradient);
209             
210             me.set("element", element);
211             me.set("labelsEl", labelsEl);
212 
213             me.update(1);
214         },
215         processGradientObject: function(){
216             // create array and sort it
217             var me = this,
218                 gradientConfig = this.config.gradient,
219                 gradientArr = [];
220 
221             for(var key in gradientConfig){
222                 if(gradientConfig.hasOwnProperty(key)){
223                     gradientArr.push({ stop: key, value: gradientConfig[key] });
224                 }
225             }
226             gradientArr.sort(function(a, b){
227                 return (a.stop - b.stop);
228             });
229             gradientArr.unshift({ stop: 0, value: 'rgba(0,0,0,0)' });
230 
231             me.set("gradientArr", gradientArr);
232         },
233         createGradientImage: function(){
234             var me = this,
235                 gradArr = me.get("gradientArr"),
236                 length = gradArr.length,
237                 canvas = document.createElement("canvas"),
238                 ctx = canvas.getContext("2d"),
239                 grad;
240             // the gradient in the legend including the ticks will be 256x15px
241             canvas.width = "256";
242             canvas.height = "15";
243 
244             grad = ctx.createLinearGradient(0,5,256,10);
245 
246             for(var i = 0; i < length; i++){
247                 grad.addColorStop(1/(length-1) * i, gradArr[i].value);
248             }
249 
250             ctx.fillStyle = grad;
251             ctx.fillRect(0,5,256,10);
252             ctx.strokeStyle = "black";
253             ctx.beginPath();
254  
255             for(var i = 0; i < length; i++){
256                 ctx.moveTo(((1/(length-1)*i*256) >> 0)+.5, 0);
257                 ctx.lineTo(((1/(length-1)*i*256) >> 0)+.5, (i==0)?15:5);
258             }
259             ctx.moveTo(255.5, 0);
260             ctx.lineTo(255.5, 15);
261             ctx.moveTo(255.5, 4.5);
262             ctx.lineTo(0, 4.5);
263             
264             ctx.stroke();
265 
266             // we re-use the context for measuring the legends label widths
267             me.set("ctx", ctx);
268 
269             return canvas.toDataURL();
270         },
271         getElement: function(){
272             return this.get("element");
273         },
274         update: function(max){
275             var me = this,
276                 gradient = me.get("gradientArr"),
277                 ctx = me.get("ctx"),
278                 labels = me.get("labelsEl"),
279                 labelText, labelsHtml = "", offset;
280 
281             for(var i = 0; i < gradient.length; i++){
282 
283                 labelText = max*gradient[i].stop >> 0;
284                 offset = (ctx.measureText(labelText).width/2) >> 0;
285 
286                 if(i == 0){
287                     offset = 0;
288                 }
289                 if(i == gradient.length-1){
290                     offset *= 2;
291                 }
292                 labelsHtml += '<li style="position:absolute;left:'+(((((1/(gradient.length-1)*i*256) || 0)) >> 0)-offset+.5)+'px">'+labelText+'</li>';
293             }       
294             labels.innerHTML = labelsHtml;
295         }
296     };
297 
298     // heatmap object constructor
299     var heatmap = function heatmap(config){
300         // private variables
301         var _ = {
302             radius : 40,
303             element : {},
304             canvas : {},
305             acanvas: {},
306             ctx : {},
307             actx : {},
308             legend: null,
309             visible : true,
310             width : 0,
311             height : 0,
312             max : false,
313             gradient : false,
314             opacity: 180,
315             premultiplyAlpha: false,
316             bounds: {
317                 l: 1000,
318                 r: 0,
319                 t: 1000,
320                 b: 0
321             },
322             debug: false
323         };
324         // heatmap store containing the datapoints and information about the maximum
325         // accessible via instance.store
326         this.store = new store(this);
327 
328         this.get = function(key){
329             return _[key];
330         };
331         this.set = function(key, value){
332             _[key] = value;
333         };
334         // configure the heatmap when an instance gets created
335         this.configure(config);
336         // and initialize it
337         this.init();
338     };
339 
340     // public functions
341     heatmap.prototype = {
342         configure: function(config){
343                 var me = this,
344                     rout, rin;
345 
346                 me.set("radius", config["radius"] || 40);
347                 me.set("element", (config.element instanceof Object)?config.element:document.getElementById(config.element));
348                 me.set("visible", (config.visible != null)?config.visible:true);
349                 me.set("max", config.max || false);
350                 me.set("gradient", config.gradient || { 0.45: "rgb(0,0,255)", 0.55: "rgb(0,255,255)", 0.65: "rgb(0,255,0)", 0.95: "yellow", 1.0: "rgb(255,0,0)"});    // default is the common blue to red gradient
351                 me.set("opacity", parseInt(255/(100/config.opacity), 10) || 180);
352                 me.set("width", config.width || 0);
353                 me.set("height", config.height || 0);
354                 me.set("debug", config.debug);
355 
356                 if(config.legend){
357                     var legendCfg = config.legend;
358                     legendCfg.gradient = me.get("gradient");
359                     me.set("legend", new legend(legendCfg));
360                 }
361                 
362         },
363         resize: function () {
364                 var me = this,
365                     element = me.get("element"),
366                     canvas = me.get("canvas"),
367                     acanvas = me.get("acanvas");
368                 canvas.width = acanvas.width = me.get("width") || element.style.width.replace(/px/, "") || me.getWidth(element);
369                 this.set("width", canvas.width);
370                 canvas.height = acanvas.height = me.get("height") || element.style.height.replace(/px/, "") || me.getHeight(element);
371                 this.set("height", canvas.height);
372         },
373 
374         init: function(){
375                 var me = this,
376                     canvas = document.createElement("canvas"),
377                     acanvas = document.createElement("canvas"),
378                     ctx = canvas.getContext("2d"),
379                     actx = acanvas.getContext("2d"),
380                     element = me.get("element");
381 
382                 
383                 me.initColorPalette();
384 
385                 me.set("canvas", canvas);
386                 me.set("ctx", ctx);
387                 me.set("acanvas", acanvas);
388                 me.set("actx", actx);
389 
390                 me.resize();
391                 canvas.style.cssText = acanvas.style.cssText = "position:absolute;top:0;left:0;z-index:10000000;";
392                 
393                 if(!me.get("visible"))
394                     canvas.style.display = "none";
395 
396                 element.appendChild(canvas);
397                 if(me.get("legend")){
398                     element.appendChild(me.get("legend").getElement());
399                 }
400                 
401                 // debugging purposes only
402                 if(me.get("debug"))
403                     document.body.appendChild(acanvas);
404                 
405                 actx.shadowOffsetX = 15000; 
406                 actx.shadowOffsetY = 15000; 
407                 actx.shadowBlur = 15; 
408         },
409         initColorPalette: function(){
410 
411             var me = this,
412                 canvas = document.createElement("canvas"),
413                 gradient = me.get("gradient"),
414                 ctx, grad, testData;
415 
416             canvas.width = "1";
417             canvas.height = "256";
418             ctx = canvas.getContext("2d");
419             grad = ctx.createLinearGradient(0,0,1,256);
420 
421             // Test how the browser renders alpha by setting a partially transparent pixel
422             // and reading the result.  A good browser will return a value reasonably close
423             // to what was set.  Some browsers (e.g. on Android) will return a ridiculously wrong value.
424             testData = ctx.getImageData(0,0,1,1);
425             testData.data[0] = testData.data[3] = 64; // 25% red & alpha
426             testData.data[1] = testData.data[2] = 0; // 0% blue & green
427             ctx.putImageData(testData, 0, 0);
428             testData = ctx.getImageData(0,0,1,1);
429             me.set("premultiplyAlpha", (testData.data[0] < 60 || testData.data[0] > 70));
430             
431             for(var x in gradient){
432                 grad.addColorStop(x, gradient[x]);
433             }
434 
435             ctx.fillStyle = grad;
436             ctx.fillRect(0,0,1,256);
437 
438             me.set("gradient", ctx.getImageData(0,0,1,256).data);
439         },
440         getWidth: function(element){
441             var width = element.offsetWidth;
442             if(element.style.paddingLeft){
443                 width+=element.style.paddingLeft;
444             }
445             if(element.style.paddingRight){
446                 width+=element.style.paddingRight;
447             }
448 
449             return width;
450         },
451         getHeight: function(element){
452             var height = element.offsetHeight;
453             if(element.style.paddingTop){
454                 height+=element.style.paddingTop;
455             }
456             if(element.style.paddingBottom){
457                 height+=element.style.paddingBottom;
458             }
459 
460             return height;
461         },
462         colorize: function(x, y){
463                 // get the private variables
464                 var me = this,
465                     width = me.get("width"),
466                     radius = me.get("radius"),
467                     height = me.get("height"),
468                     actx = me.get("actx"),
469                     ctx = me.get("ctx"),
470                     x2 = radius * 3,
471                     premultiplyAlpha = me.get("premultiplyAlpha"),
472                     palette = me.get("gradient"),
473                     opacity = me.get("opacity"),
474                     bounds = me.get("bounds"),
475                     left, top, bottom, right, 
476                     image, imageData, length, alpha, offset, finalAlpha;
477                 
478                 if(x != null && y != null){
479                     if(x+x2>width){
480                         x=width-x2;
481                     }
482                     if(x<0){
483                         x=0;
484                     }
485                     if(y<0){
486                         y=0;
487                     }
488                     if(y+x2>height){
489                         y=height-x2;
490                     }
491                     left = x;
492                     top = y;
493                     right = x + x2;
494                     bottom = y + x2;
495 
496                 }else{
497                     if(bounds['l'] < 0){
498                         left = 0;
499                     }else{
500                         left = bounds['l'];
501                     }
502                     if(bounds['r'] > width){
503                         right = width;
504                     }else{
505                         right = bounds['r'];
506                     }
507                     if(bounds['t'] < 0){
508                         top = 0;
509                     }else{
510                         top = bounds['t'];
511                     }
512                     if(bounds['b'] > height){
513                         bottom = height;
514                     }else{
515                         bottom = bounds['b'];
516                     }    
517                 }
518 
519                 image = actx.getImageData(left, top, right-left, bottom-top);
520                 imageData = image.data;
521                 length = imageData.length;
522                 // loop thru the area
523                 for(var i=3; i < length; i+=4){
524 
525                     // [0] -> r, [1] -> g, [2] -> b, [3] -> alpha
526                     alpha = imageData[i],
527                     offset = alpha*4;
528 
529                     if(!offset)
530                         continue;
531 
532                     // we ve started with i=3
533                     // set the new r, g and b values
534                     finalAlpha = (alpha < opacity)?alpha:opacity;
535                     imageData[i-3]=palette[offset];
536                     imageData[i-2]=palette[offset+1];
537                     imageData[i-1]=palette[offset+2];
538                     
539                     if (premultiplyAlpha) {
540                     	// To fix browsers that premultiply incorrectly, we'll pass in a value scaled
541                     	// appropriately so when the multiplication happens the correct value will result.
542                     	imageData[i-3] /= 255/finalAlpha;
543                     	imageData[i-2] /= 255/finalAlpha;
544                     	imageData[i-1] /= 255/finalAlpha;
545                     }
546                     
547                     // we want the heatmap to have a gradient from transparent to the colors
548                     // as long as alpha is lower than the defined opacity (maximum), we'll use the alpha value
549                     imageData[i] = finalAlpha;
550                 }
551                 // the rgb data manipulation didn't affect the ImageData object(defined on the top)
552                 // after the manipulation process we have to set the manipulated data to the ImageData object
553                 image.data = imageData;
554                 ctx.putImageData(image, left, top);
555         },
556         drawAlpha: function(x, y, count, colorize){
557                 // storing the variables because they will be often used
558                 var me = this,
559                     radius = me.get("radius"),
560                     ctx = me.get("actx"),
561                     max = me.get("max"),
562                     bounds = me.get("bounds"),
563                     xb = x - (1.5 * radius) >> 0, yb = y - (1.5 * radius) >> 0,
564                     xc = x + (1.5 * radius) >> 0, yc = y + (1.5 * radius) >> 0;
565 
566                 ctx.shadowColor = ('rgba(0,0,0,'+((count)?(count/me.store.max):'0.1')+')');
567 
568                 ctx.shadowOffsetX = 15000; 
569                 ctx.shadowOffsetY = 15000; 
570                 ctx.shadowBlur = 15; 
571 
572                 ctx.beginPath();
573                 ctx.arc(x - 15000, y - 15000, radius, 0, Math.PI * 2, true);
574                 ctx.closePath();
575                 ctx.fill();
576                 if(colorize){
577                     // finally colorize the area
578                     me.colorize(xb,yb);
579                 }else{
580                     // or update the boundaries for the area that then should be colorized
581                     if(xb < bounds["l"]){
582                         bounds["l"] = xb;
583                     }
584                     if(yb < bounds["t"]){
585                         bounds["t"] = yb;
586                     }
587                     if(xc > bounds['r']){
588                         bounds['r'] = xc;
589                     }
590                     if(yc > bounds['b']){
591                         bounds['b'] = yc;
592                     }
593                 }
594         },
595         toggleDisplay: function(){
596                 var me = this,
597                     visible = me.get("visible"),
598                 canvas = me.get("canvas");
599 
600                 if(!visible)
601                     canvas.style.display = "block";
602                 else
603                     canvas.style.display = "none";
604 
605                 me.set("visible", !visible);
606         },
607         // dataURL export
608         getImageData: function(){
609                 return this.get("canvas").toDataURL();
610         },
611         clear: function(){
612             var me = this,
613                 w = me.get("width"),
614                 h = me.get("height");
615 
616             me.store.set("data",[]);
617             // @TODO: reset stores max to 1
618             //me.store.max = 1;
619             me.get("ctx").clearRect(0,0,w,h);
620             me.get("actx").clearRect(0,0,w,h);
621         },
622         cleanup: function(){
623             var me = this;
624             me.get("element").removeChild(me.get("canvas"));
625         }
626     };
627 
628     return {
629             create: function(config){
630                 return new heatmap(config);
631             }, 
632             util: {
633                 mousePosition: function(ev){
634                     // this doesn't work right
635                     // rather use
636                     /*
637                         // this = element to observe
638                         var x = ev.pageX - this.offsetLeft;
639                         var y = ev.pageY - this.offsetTop;
640 
641                     */
642                     var x, y;
643 
644                     if (ev.layerX) { // Firefox
645                         x = ev.layerX;
646                         y = ev.layerY;
647                     } else if (ev.offsetX) { // Opera
648                         x = ev.offsetX;
649                         y = ev.offsetY;
650                     }
651                     if(typeof(x)=='undefined')
652                         return;
653 
654                     return [x,y];
655                 }
656             }
657         };
658     })();
659     w.h337 = w.heatmapFactory = heatmapFactory;
660 })(window);
661 
662 
663 /*==============================以上部分为heatmap.js的核心代码,只负责热力图的展现====================================*/
664 
665 
666 /*==============================以下部分为专为百度地图打造的覆盖物===================================================*/
667 /**
668  * @fileoverview 百度地图的热力图功能,对外开放。
669  * 主要基于http://www.patrick-wied.at/static/heatmapjs/index.html 修改而得
670  
671  * 主入口类是<a href="symbols/BMapLib.Heatmap.html">Heatmap</a>，
672  * 基于Baidu Map API 2.0。
673  *
674  * @author Baidu Map Api Group
675  * @version 1.0
676  */
677 
678 /**
679  * @namespace BMap的所有library类均放在BMapLib命名空间下
680  */
681 var BMapLib = window.BMapLib = BMapLib || {};
682 
683 
684 (function() {
685     /** 
686      * @exports HeatmapOverlay as BMapLib.HeatmapOverlay 
687      */
688     var HeatmapOverlay  = 
689     /**
690      * 热力图的覆盖物
691      * @class 热力图的覆盖物
692      * 实例化该类后，使用map.addOverlay即可以添加热力图
693      * 
694      * @constructor
695      * @param {Json Object} opts 可选的输入参数，非必填项。可输入选项包括：<br />
696      * {"<b>radius</b>" : {String} 热力图的半径,
697      * <br />"<b>visible</b>" : {Number} 热力图是否显示,
698      * <br />"<b>gradient</b>" : {JSON} 热力图的渐变区间,
699      * <br />"<b>opacity</b>" : {Number} 热力的透明度,
700      *
701      * @example <b>参考示例：</b><br />
702      * var map = new BMap.Map("container");<br />map.centerAndZoom(new BMap.Point(116.404, 39.915), 15);<br />var heatmapOverlay = new BMapLib.HeatmapOverlay({"radius":10, "visible":true, "opacity":70});<br />heatmapOverlay.setDataSet(data);//data是热力图的详细数据
703      */
704 
705     BMapLib.HeatmapOverlay =  function(opts) {
706         this.conf = opts;
707         this.heatmap = null;
708         this.latlngs = [];
709         this.bounds = null;
710     }
711 
712     HeatmapOverlay.prototype = new BMap.Overlay();
713 
714     HeatmapOverlay.prototype.initialize = function(map) {
715         
716         this._map = map;
717         var el = document.createElement("div");
718         el.style.position = "absolute";
719         el.style.top = 0;
720         el.style.left = 0;
721         el.style.border = 0;
722         el.style.width = this._map.getSize().width + "px";
723         el.style.height = this._map.getSize().height + "px";
724         this.conf.element = el;
725 
726 
727         if(!isSupportCanvas()){//判断是否支持Canvas.
728             return el;
729         }
730         map.getPanes().mapPane.appendChild(el);
731         this.heatmap = h337.create(this.conf);
732         this._div = el;
733         return el;
734     }
735 
736     HeatmapOverlay.prototype.draw = function() {
737         if(!isSupportCanvas()){//判断是否支持Canvas.
738             return ;
739         }
740         var currentBounds = this._map.getBounds();
741 
742         if (currentBounds.equals(this.bounds)) {
743             return;
744         }
745         this.bounds = currentBounds;
746 
747         var ne = this._map.pointToOverlayPixel(currentBounds.getNorthEast()),
748             sw = this._map.pointToOverlayPixel(currentBounds.getSouthWest()),
749             topY = ne.y,
750             leftX = sw.x,
751             h = sw.y - ne.y,
752             w = ne.x - sw.x;
753 
754         this.conf.element.style.left = leftX + 'px';
755         this.conf.element.style.top = topY + 'px';
756         this.conf.element.style.width = w + 'px';
757         this.conf.element.style.height = h + 'px';
758         this.heatmap.store.get("heatmap").resize();
759 
760         if (this.latlngs.length > 0) {
761             this.heatmap.clear();
762 
763             var len = this.latlngs.length;
764             d = {
765                 max: this.heatmap.store.max,
766                 data: []
767             };
768 
769             while (len--) {
770                 var latlng = this.latlngs[len].latlng;
771 
772                 if (!currentBounds.containsPoint(latlng)) {
773                     continue;
774                 }
775 
776                 var divPixel = this._map.pointToOverlayPixel(latlng),
777                     screenPixel = new BMap.Pixel(divPixel.x - leftX, divPixel.y - topY);
778                 var roundedPoint = this.pixelTransform(screenPixel);
779                 d.data.push({
780                     x: roundedPoint.x,
781                     y: roundedPoint.y,
782                     count: this.latlngs[len].c
783                 });
784             }
785             this.heatmap.store.setDataSet(d);
786         }
787     }
788 
789 
790     //内部使用的坐标转化
791     HeatmapOverlay.prototype.pixelTransform = function(p) {
792         var w = this.heatmap.get("width"),
793             h = this.heatmap.get("height");
794 
795         while (p.x < 0) {
796             p.x += w;
797         }
798 
799         while (p.x > w) {
800             p.x -= w;
801         }
802 
803         while (p.y < 0) {
804             p.y += h;
805         }
806 
807         while (p.y > h) {
808             p.y -= h;
809         }
810 
811         p.x = (p.x >> 0);
812         p.y = (p.y >> 0);
813 
814         return p;
815     }
816 
817     /**
818      * 设置热力图展现的详细数据, 实现之后,即可以立刻展现 
819      * @param {Json Object } data
820      * {"<b>max</b>" : {Number} 权重的最大值,
821      * <br />"<b>data</b>" : {Array} 坐标详细数据,格式如下 <br/>
822      * {"lng":116.421969,"lat":39.913527,"count":3}, 其中<br/>
823      * lng lat分别为经纬度, count权重值
824      */
825     HeatmapOverlay.prototype.setDataSet = function(data) {
826         this.data = data;
827         if(!isSupportCanvas()){//判断是否支持Canvas.
828             return ;
829         }
830         var currentBounds = this._map.getBounds();
831         var mapdata = {
832             max: data.max,
833             data: []
834         };
835         var d = data.data,
836             dlen = d.length;
837 
838 
839         this.latlngs = [];
840 
841         while (dlen--) {
842             var latlng = new BMap.Point(d[dlen].lng, d[dlen].lat);
843             if (!currentBounds.containsPoint(latlng)) {
844                 continue;
845             }
846             this.latlngs.push({
847                 latlng: latlng,
848                 c: d[dlen].count
849             });
850 
851             var divPixel = this._map.pointToOverlayPixel(latlng),
852                 leftX = this._map.pointToOverlayPixel(currentBounds.getSouthWest()).x,
853                 topY = this._map.pointToOverlayPixel(currentBounds.getNorthEast()).y,
854                 screenPixel = new BMap.Pixel(divPixel.x - leftX, divPixel.y - topY);
855             var point = this.pixelTransform(screenPixel);
856 
857             mapdata.data.push({
858                 x: point.x,
859                 y: point.y,
860                 count: d[dlen].count
861             });
862         }
863         this.heatmap.clear();
864         this.heatmap.store.setDataSet(mapdata);
865     }
866 
867     /**
868      * 添加热力图的详细坐标点
869      * @param {Number} lng 经度坐标
870      * @param {Number} lat 经度坐标
871      * @param {Number} count 经度坐标
872      */
873     HeatmapOverlay.prototype.addDataPoint = function(lng, lat, count) {
874         
875         if(!isSupportCanvas()){
876             return ;
877         }
878         if(this.data && this.data.data){
879             this.data.data.push({
880                 lng:lng,
881                 lat:lat,
882                 count:count
883             });
884         }
885 
886         var latlng = new BMap.Point(lng, lat),
887             point = this.pixelTransform(this._map.pointToOverlayPixel(latlng));
888 
889         this.heatmap.store.addDataPoint(point.x, point.y, count);
890         this.latlngs.push({
891             latlng: latlng,
892             c: count
893         });
894     }
895 
896     /**
897      * 更改热力图的展现或者关闭
898      */
899 
900     HeatmapOverlay.prototype.toggle = function() {
901         if(!isSupportCanvas()){//判断是否支持Canvas.
902             return ;
903         }
904         this.heatmap.toggleDisplay();
905     }
906     /**
907      * 设置热力图展现的配置
908      * @param {Json Object} options 可选的输入参数，非必填项。可输入选项包括：<br />
909      * {"<b>radius</b>" : {String} 热力图的半径,
910      * <br />"<b>visible</b>" : {Number} 热力图是否显示,
911      * <br />"<b>gradient</b>" : {JSON} 热力图的渐变区间,
912      * <br />"<b>opacity</b>" : {Number} 热力的透明度,}
913      */
914     HeatmapOverlay.prototype.setOptions = function(options){
915         if(!isSupportCanvas()){//判断是否支持Canvas.
916             return ;
917         }
918 
919         if(options){
920             for(var key in options){
921                 this.heatmap.set(key,options[key]);
922 
923                 if(key == "gradient"){
924                     this.heatmap.initColorPalette();
925                     continue;
926                 }
927 
928                 if( key == 'opacity'){
929                     this.heatmap.set(key,parseInt(255/(100/options[key]), 10));
930                     
931                 }
932             }
933 
934             if(this.data){
935                 this.setDataSet(this.data);//重新渲染
936             }
937         }
938     }
939 
940 
941     function isSupportCanvas(){
942         var elem = document.createElement('canvas');
943         return !!(elem.getContext && elem.getContext('2d'));
944     }
945 })()
946 