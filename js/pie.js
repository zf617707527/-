var dom = document.getElementById("pie");
var myChart1 = echarts.init(dom);
var val1data2 = [{
					value: 166,
					name: '陆军',
				},
				{
					value: 34,
					name: '空军',
				},
				{
					value: 41,
					name: '海军陆战队',
				},
				{
					value: 105,
					name: '海军',
				}
			]

			var arr = ['middleLost', 0.9, val1data2, '参战军种占比']

			option = {
				title: {
					top: '90%',
					left: 'center',
					text: arr[3],
					textStyle: {
						color: '#E0FFFF',
						fontStyle: 'normal',
						fontWeight: 'normal',
						fontSize: 18
					},
					//subtext: '(110000 篇)',
					subtextStyle: {
						color: 'red',
						fontSize: 12
					}
				},
				
				toolbox: {
					show: true,
					x: 'center',
					// y: 'top',
					top: '0%',
					itemSize:25,
					feature: {
						myTool1: {
							show: true,
							title: '参战军种',
							icon: 'image://http://echarts.baidu.com/images/favicon.png',
							onclick: function() {
								showSound("icon/click.mp3");
								$.ajax({
									type: 'get',
									url: 'data/services.json',
									dataType: "json",        
									success: function (result) {
										
										myChart1.setOption({
											title:{
												text:'参战军种占比'
											},
											series: [{
												//name: '第九类协议使用占比',
												name:result
												
											},
											{
												data:result
											}]
										})
										}})
										}
										},
										
						myTool2: {
							show: true,
							title: '战争结果',
							icon: 'image://http://echarts.baidu.com/images/favicon.png',
							onclick: function() {
								showSound("icon/click.mp3");
								$.ajax({
									type: 'get',
									url: 'data/war_result.json',
									dataType: "json",        
									success: function (result) {
										
										myChart1.setOption({
											title:{
												text:'战争结果占比'
											},
											series: [{
												//name: '第九类协议使用占比',
												name:result
												
											},
											{
												data:result
											}]
										})
										}})
										}
										},
										
						myTool3: {
							show: true,
							title: '战争规模',
							icon: 'image://http://echarts.baidu.com/images/favicon.png',
							onclick: function() {
								showSound("icon/click.mp3");
								$.ajax({
									type: 'get',
									url: 'data/scale.json',
									dataType: "json",        
									success: function (result) {
										myChart1.setOption({
											title:{
												text:'战争占比'
											},
											series: [{
												//name: '第九类协议使用占比',
												name:result
												
											},
											{
												data:result
											}]
										})
										}})
										}
										
										}
										},
										},
										
				
				series: [{
						type: 'liquidFill',
						itemStyle: {
							normal: {
								opacity: 0.4,
								shadowBlur: 0,
								shadowColor: 'blue'
							}
						},
						name: arr[3],
						data: [0.8, {
							value: 0.6,
							direction: 'left',
							itemStyle: {
								color: 'blue'
							}
						}, 0.5, 0.3],
						//  background: '#fff',
						color: ['#53d5ff'],
						center: ['50%', '50%'],
						/*  backgroundStyle: {
						      color: '#fff'
						  },*/
						label: {
							normal: {
								formatter: '',
								textStyle: {
									fontSize: 12
								}
							}
						},
						outline: {
							itemStyle: {
								borderColor: '#86c5ff',
								borderWidth: 0
							},
							borderDistance: 0
						}
					},
					{
						type: 'pie',
						radius: ['42%', '50%'],
						color: ['#c487ee', '#C0FF3E', '#49dff0',  '#6f81da', '#00ffb4'],
						hoverAnimation: false, ////设置饼图默认的展开样式
						label: {
							show: true,

							normal: {
								formatter: '{b}\n{d}%',
								show: true,
								position: ''
							},
						},
						labelLine: {
							normal: {
								show: false
							}
						},

						itemStyle: { // 此配置
							normal: {
								borderWidth: 2,
								borderColor: '#fff',
							},
							emphasis: {
								borderWidth: 0,
								shadowBlur: 2,
								shadowOffsetX: 0,
								shadowColor: 'rgba(0, 0, 0, 0.5)'
							}
						},
						data: arr[2]
					}
				]
			}
			myChart1.setOption(option);