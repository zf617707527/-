var dom = document.getElementById("sun");
var myChart6 = echarts.init(dom);
var app = {};
option = null;
var data = [{
		'name': '中国',
		'children': [{
			'name': '军种',
			'itemStyle': {
				'color': '#FFAE57'
			},
			'children': [{
				'name': '海军',
				'itemStyle': {
					'color': '#FFAE57'
				},
				'value': 11
			}, {
				'name': '海军陆战队',
				'itemStyle': {
					'color': '#FFAE57'
				},
				'value': 6
			}, {
				'name': '陆军',
				'itemStyle': {
					'color': '#FFAE57'
				},
				'value': 3
			}]
		}, {
			'name': '战争目的',
			'itemStyle': {
				'color': '#FF7853'
			},
			'children': [{
				'name': '协助',
				'itemStyle': {
					'color': '#FF7853'
				},
				'value': 1
			}, {
				'name': '保护',
				'itemStyle': {
					'color': '#FF7853'
				},
				'value': 14
			}, {
				'name': '撤离',
				'itemStyle': {
					'color': '#FF7853'
				},
				'value': 1
			}, {
				'name': '报复',
				'itemStyle': {
					'color': '#FF7853'
				},
				'value': 2
			}, {
				'name': '入侵',
				'itemStyle': {
					'color': '#FF7853'
				},
				'value': 1
			}, {
				'name': '反海盗',
				'itemStyle': {
					'color': '#FF7853'
				},
				'value': 1
			}]
		}, {
			'name': '结果',
			'itemStyle': {
				'color': '#EA5151'
			},
			'children': [{
				'name': '胜利',
				'itemStyle': {
					'color': '#EA5151'
				},
				'value': 18
			}, {
				'name': '失败',
				'itemStyle': {
					'color': '#EA5151'
				},
				'value': 2
			}]
		}, {
			'name': '行动规模',
			'itemStyle': {
				'color': '#CC3F57'
			},
			'children': [{
				'name': '中型',
				'itemStyle': {
					'color': '#CC3F57'
				},
				'value': 2
			}, {
				'name': '大型',
				'itemStyle': {
					'color': '#CC3F57'
				},
				'value': 2
			}, {
				'name': '小型',
				'itemStyle': {
					'color': '#CC3F57'
				},
				'value': 16
			}]
		}]
	}];

						option = {
							series: {
								type: 'sunburst',
								// highlightPolicy: 'ancestor',
								data: data,
								radius: [0, '90%'],
								label: {
									rotate: 'radial'
								}
							}
						};;
						if (option && typeof option === "object") {
							myChart6.setOption(option, true);
						}
