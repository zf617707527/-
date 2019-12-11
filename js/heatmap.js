var dom = document.getElementById("heatmap");
var myChart = echarts.init(dom);
//var app = {};
option = null;
myChart.showLoading();

//异步加载数据
var heat = [];
$.ajax({
	type: 'get',
	url: 'data/heatmap.json',
	dataType: "json",
	async: false,
	success: function(result) {
		window.heat = result;
	},

	error: function(errorMsg) {
		//请求失败时执行该函数
		alert("图表请求数据失败!");

	}
});

$.get('data/world2.json', function(usaJson) {
	myChart.hideLoading();

	echarts.registerMap('world', usaJson);
	option = {
		// title: {
		// 	text: 'USA Population Estimates (2012)',
		// 	subtext: 'Data from www.census.gov',
		// 	sublink: 'http://www.census.gov/popest/data/datasets.html',
		// 	left: 'right'
		// },
		tooltip: {
			trigger: 'item',
			showDelay: 0,
			transitionDuration: 0.2,
			formatter: function(params) {
				var value = (params.value + '').split('.');
				value = value[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,');
				return params.seriesName + '<br/>' + params.name + ': ' + value;
			}
		},
		visualMap: {
			left: 'right',
			min: 1,
			max: 20,
			inRange: {
				color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43',
					'#d73027', '#a50026'
				]
			},
			text: ['High', 'Low'], // 文本，默认为数值文本
			calculable: true,

			textStyle: {
				color: 'white'
			}

		},
		// toolbox: {
		// 	show: true,
		// 	//orient: 'vertical',
		// 	left: 'left',
		// 	top: 'top',
		// 	feature: {
		// 		dataView: {readOnly: false},
		// 		restore: {},
		// 		saveAsImage: {}
		// 	}
		// },
		series: [{
			name: '与美军交战的次数',
			type: 'map',
			roam: true,
			map: 'world',
			itemStyle: {
				emphasis: {
					label: {
						show: true
					}
				}
			},
			// 文本位置修正
			// textFixed: {
			// 	Alaska: [20, -20]
			// },
			data: heat
		}]
	};

	myChart.setOption(option);
});;
if (option && typeof option === "object") {
	myChart.setOption(option, true);
}


//事件相应函数
myChart.on('click', function(params) {
	// alert(params.name);
	showSound("icon/click.mp3");
	$.ajax({
		type: 'get',
		url: 'data/tree.json',
		dataType: "json",
		async: false,
		success: function(result) {
			echarts.util.each(result[params.name].children, function (datum, index) {
			    index % 2 === 0 && (datum.collapsed = true);
			});
			myChart7.setOption({
				series: [{
					data: [result[params.name]]
				}]
			});
		},

		error: function(errorMsg) {
			//请求失败时执行该函数
			alert("图表请求数据失败!");

		}
	});

});
