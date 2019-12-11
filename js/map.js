mapboxgl.accessToken = 'pk.eyJ1IjoiemY2MTc3MDc1MjciLCJhIjoiY2p2aXhvbnRpMGI0djQ1cGJ1bGgxOXNwMCJ9.-oTM-DyFP-vhn-eWOIO3wA';
var map = new mapboxgl.Map({
	style: 'mapbox://styles/mapbox/streets-v11',
	center: [-65.252911, -19.041794],
	zoom: 15.5,
	pitch: 45,
	bearing: -17.6,
	container: 'map1',
	antialias: true
});

// The 'building' layer in the mapbox-streets vector source contains building-height
// data from OpenStreetMap.

//3D显示
map.on('load', function() {
	// Insert the layer beneath any symbol layer.
	var layers = map.getStyle().layers;

	var labelLayerId;
	for (var i = 0; i < layers.length; i++) {
		if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
			labelLayerId = layers[i].id;
			break;
		}
	}

	map.addLayer({
		'id': '3d-buildings',
		'source': 'composite',
		'source-layer': 'building',
		'filter': ['==', 'extrude', 'true'],
		'type': 'fill-extrusion',
		'minzoom': 15,
		'paint': {
			'fill-extrusion-color': '#aaa',

			// use an 'interpolate' expression to add a smooth transition effect to the
			// buildings as the user zooms in
			'fill-extrusion-height': [
				"interpolate", ["linear"],
				["zoom"],
				15, 0,
				15.05, ["get", "height"]
			],
			'fill-extrusion-base': [
				"interpolate", ["linear"],
				["zoom"],
				15, 0,
				15.05, ["get", "min_height"]
			],
			'fill-extrusion-opacity': .6
		}
	}, labelLayerId);

});


//增加切换样式的控件
var layerList = document.getElementById('menu');
var inputs = layerList.getElementsByTagName('input');

function switchLayer(layer) {
	var layerId = layer.target.id;
	map.setStyle('mapbox://styles/mapbox/' + layerId);



}

for (var i = 0; i < inputs.length; i++) {
	inputs[i].onclick = switchLayer;
}

//添加旋转放大控件
map.addControl(new mapboxgl.NavigationControl());
//全屏
map.addControl(new mapboxgl.FullscreenControl(), "top-left");




//异步加载geojson
var geo = [];
$.ajax({
	type: 'get',
	url: 'data/map.json',
	dataType: "json",
	async: false,
	success: function(result) {
		window.geo = result[0];
	},

	error: function(errorMsg) {
		//请求失败时执行该函数
		alert("图表请求数据失败!");

	}
});
// alert(geo);

//图上添加散点
map.on('load', function() { /* on(type,callback)为type事件添加监听器，callback是响应函数*/
	map.addSource("points", {
		"type": "geojson",
		/* geojson类型资源 */
		"data": geo
	});

	map.addLayer({
		"id": "points",
		"type": "symbol",
		/* symbol类型layer，一般用来绘制点*/
		"source": "points",
		"layout": {
			"icon-image": "{icon}-15",
			/* 图标图像 */
			"text-field": "{title}",
			/* 使用text标签显示的值，Feature属性使用{域名}格式*/
			"text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
			/* 文本字体 */
			"text-offset": [0, 0.6],
			/* 该属性表示文本偏移锚点的距离，正值表示向右和向下，负值表示向左和向上 */
			"text-anchor": "top" /* 该属性设置文本中最接近锚点的部分，top表示文本的顶端放置到最接近锚点的位置 */
		}
	});
});

//添加弹窗
map.on('click', function(e) {
	showSound("icon/click.mp3");
	var features = map.queryRenderedFeatures(e.point, {
		layers: ['points'] // replace this with the name of the layer
	});

	if (!features.length) {
		return;
	}

	var feature = features[0];

	var popup = new mapboxgl.Popup({
			offset: [0, -15]
		})
		.setLngLat(feature.geometry.coordinates)
		.setHTML('<h3>' + feature.properties.title + '</h3><p>' + feature.properties.name + '</p><p>' + feature.properties.start +
			'</p><p>' + feature.properties.end + '</p><p>' + feature.properties.opponent + '</p><p>' + feature.properties.services +
			'</p><p>' + feature.properties.aim + '</p><p>' + '</p><p>' + feature.properties.scale + '</p><p>' + feature.properties
			.scription + '</p>')
		.addTo(map);
});


//根据环境声音对3D建筑物进行动画处理


map.on('load', function() {
	var bins = 16;
	var maxHeight = 200;
	var binWidth = maxHeight / bins;

	// Divide the buildings into 16 bins based on their true height, using a layer filter.
	for (var i = 0; i < bins; i++) {
		map.addLayer({
			'id': '3d-buildings-' + i,
			'source': 'composite',
			'source-layer': 'building',
			'filter': ['all', ['==', 'extrude', 'true'],
				['>', 'height', i * binWidth],
				['<=', 'height', (i + 1) * binWidth]
			],
			'type': 'fill-extrusion',
			'minzoom': 15,
			'paint': {
				'fill-extrusion-color': '#aaa',
				'fill-extrusion-height-transition': {
					duration: 0,
					delay: 0
				},
				'fill-extrusion-opacity': .6
			}
		});
	}

	// Older browsers might not implement mediaDevices at all, so we set an empty object first
	if (navigator.mediaDevices === undefined) {
		navigator.mediaDevices = {};
	}

	// Some browsers partially implement mediaDevices. We can't just assign an object
	// with getUserMedia as it would overwrite existing properties.
	// Here, we will just add the getUserMedia property if it's missing.
	if (navigator.mediaDevices.getUserMedia === undefined) {
		navigator.mediaDevices.getUserMedia = function(constraints) {

			// First get ahold of the legacy getUserMedia, if present
			var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

			// Some browsers just don't implement it - return a rejected promise with an error
			// to keep a consistent interface
			if (!getUserMedia) {
				return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
			}

			// Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
			return new Promise(function(resolve, reject) {
				getUserMedia.call(navigator, constraints, resolve, reject);
			});
		};
	}

	navigator.mediaDevices.getUserMedia({
			audio: true,

		})
		.then(function(stream) {
			// Set up a Web Audio AudioContext and AnalyzerNode, configured to return the
			// same number of bins of audio frequency data.
			var audioCtx = new(window.AudioContext || window.webkitAudioContext)();

			var analyser = audioCtx.createAnalyser();
			analyser.minDecibels = -90;
			analyser.maxDecibels = -10;
			analyser.smoothingTimeConstant = 0.85;

			var source = audioCtx.createMediaStreamSource(stream);
			source.connect(analyser);

			analyser.fftSize = bins * 2;

			var dataArray = new Uint8Array(bins);

			function draw(now) {
				analyser.getByteFrequencyData(dataArray);

				// Use that data to drive updates to the fill-extrusion-height property.
				var avg = 0;
				for (var i = 0; i < bins; i++) {
					avg += dataArray[i];
					map.setPaintProperty('3d-buildings-' + i, 'fill-extrusion-height', 10 + 4 * i + dataArray[i]);
				}
				avg /= bins;

				// Animate the map bearing and light color over time, and make the light more
				// intense when the audio is louder.
				// map.setBearing(now / 500);   //旋转
				map.setLight({
					color: "hsl(" + now / 100 % 360 + "," + Math.min(50 + avg / 4, 100) + "%,50%)",
					intensity: Math.min(1, avg / 256 * 10)
				});

				requestAnimationFrame(draw);
			}

			requestAnimationFrame(draw);
		})
		.catch(function(err) {
			console.log('The following gUM error occured: ' + err);
		});
});






map.on('click', function(e) {
	showSound("icon/click.mp3");
	var features = map.queryRenderedFeatures(e.point, {
		layers: ['points'] // replace this with the name of the layer
	});

	if (!features.length) {
		return;
	}

	var feature = features[0];
	var name = feature.properties.opponent.substring(6, )
	// alert(name)
	$.ajax({
		type: 'get',
		url: 'data/line.json',
		dataType: "json",
		async: false,
		success: function(result) {
			myChart5.setOption({
				series: [{ // For shadow
					type: 'bar',
					itemStyle: {
						normal: {
							color: 'rgba(0,0,0,0.05)'
						}
					},
					barGap: '-100%',
					barCategoryGap: '40%',
					data: dataShadow,
					animation: false
				}, {
					data: result[name]
				}]
			});
		},

		error: function(errorMsg) {
			//请求失败时执行该函数
			alert("图表请求数据失败!");

		}
	});
	// alert(name)
	$.ajax({
		type: 'get',
		url: 'data/sun2.json',
		dataType: "json",
		async: false,
		success: function(result) {
			// alert(result[name]["name"])
			myChart6.setOption({
				series: [{
					data: result[name]
				}]
			});
		},
	
		error: function(errorMsg) {
			//请求失败时执行该函数
			alert("图表请求数据失败!");
	
		}
	});

});
