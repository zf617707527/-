var myChart3 = echarts.init(document.getElementById('world_cloud'));

var cloud = [];
$.ajax({
				type: 'get',
				url: 'data/world_cloud.json',
				dataType: "json",    
				async : false,
				success: function (result) {
					window.cloud = result;
					},
				
				error: function  (errorMsg) {
				    //请求失败时执行该函数
				    alert("图表请求数据失败!");
				    
				}
			});
var worldCloudoption = {
				title: {
					//text: '网络拓扑特征指标',
					x: 'center',
					textStyle: {
						fontSize: 23,
						color: '#FFFFFF'
					}

				},
				tooltip: {
					show: true
				},
				series: [{
					name: '网络拓扑特征指标',
					type: 'wordCloud',
					<!--												sizeRange: [20, 70],-->
					rotationRange: [-45, 90],
					textPadding: 0,
					autoSize: {
						enable: true,
						minSize: 6

					},
					drawOutOfBound: true,
					textStyle: {
						normal: {
							color: function() {
								var colors = ['#00FF00', '#00BFFF', '#FFFF00', "#FF0000", "#FF00FF", '#FFA500', '#FF00FF',
									'#00FF00', '#00BFFF', '#546570', '#c4ccd3'
								];
								return colors[parseInt(Math.random() * 10)];
							}
						},
						emphasis: {
							shadowBlur: 10,
							shadowColor: '#333'
						}
					},
					data: cloud
				}]
			};

			//var JosnList = data.data;

			//JosnList.push(data.data);
			//worldCloudoption.series[0].data = JosnList;

			myChart3.setOption(worldCloudoption);
