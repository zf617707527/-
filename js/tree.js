var dom = document.getElementById("tree");
var myChart7 = echarts.init(dom);
var app = {};
option = null;
myChart7.showLoading();
$.get('data/tree.json', function (data) {
    myChart7.hideLoading();
	// alert(data);
	var data = data["中国"];
    echarts.util.each(data.children, function (datum, index) {
        index % 2 === 0 && (datum.collapsed = true);
    });
	
    myChart7.setOption(option = {
        tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove'
        },
		
        series: [
            {
                type: 'tree',

                data: [data],

                top: '1%',
                left: '7%',
                bottom: '1%',
                right: '20%',

                symbolSize: 7,
				lineStyle:{
					color:'#B0E2FF'
				},
                label: {
                    normal: {
                        position: 'left',
                        verticalAlign: 'middle',
                        align: 'right',
                        fontSize: 20,
						color:'#8DEEEE'
						
                    }
                },

                leaves: {
                    label: {
                        normal: {
                            position: 'right',
                            verticalAlign: 'middle',
                            align: 'left',
							
                        }
						
						
                    },
					itemStyle:{
						borderColor:'#54FF9F'
					}
					
                },

                expandAndCollapse: true,
                animationDuration: 550,
                animationDurationUpdate: 750
            }
        ]
    });
});;
if (option && typeof option === "object") {
    myChart7.setOption(option, true);
}
