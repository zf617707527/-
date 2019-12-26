var dom = document.getElementById("line");
var myChart5 = echarts.init(dom);
var app = {};
var dataAxis = ['不断地', '部分胜利', '混合', '胜利', '失败', '妥协', '相持'];
var data = [220, 182, 191, 234, 290, 330, 310];
var yMax = 20;
var dataShadow = [];

for (var i = 0; i < data.length; i++) {
    dataShadow.push(yMax);
}

option = {
    // title: {
    //     text: '特性示例：渐变色 阴影 点击缩放',
    //     // subtext: 'Feature Sample: Gradient Color, Shadow, Click Zoom'
    // },
    xAxis: {
        data: dataAxis,
        axisLabel: {
            // inside: true,
            textStyle: {
                color: '#8DEEEE'
            }
        },
        axisTick: {
            show: false
        },
        axisLine: {
            show: false
        },
        z: 10
    },
    yAxis: {
        axisLine: {
            show: false
        },
        axisTick: {
            show: false
        },
        axisLabel: {
            textStyle: {
                color: '#8DEEEE'
            }
        }
    },
    dataZoom: [
        {
            type: 'inside'
        }
    ],
    series: [
        { // For shadow
            type: 'bar',
            itemStyle: {
                normal: {color: 'rgba(0,0,0,0.05)'}
            },
            barGap:'-100%',
            barCategoryGap:'40%',
            data: dataShadow,
            animation: false
        },
        {
            type: 'bar',
            itemStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(
                        0, 0, 0, 1,
                        [
                            {offset: 0, color: '#83bff6'},
                            {offset: 0.5, color: '#188df0'},
                            {offset: 1, color: '#188df0'}
                        ]
                    )
                },
                emphasis: {
                    color: new echarts.graphic.LinearGradient(
                        0, 0, 0, 1,
                        [
                            {offset: 0, color: '#2378f7'},
                            {offset: 0.7, color: '#2378f7'},
                            {offset: 1, color: '#83bff6'}
                        ]
                    )
                }
            },
            data: data
        }
    ]
};
myChart5.setOption(option)
// Enable data zoom when user click bar.
var zoomSize = 2;
myChart5.on('click', function (params) {
	// alert(params.dataIndex);
   // alert(dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)]);
   // alert(data.lenth);
   // alert(Math.min(params.dataIndex + zoomSize / 2, data.length - 1));
    myChart5.dispatchAction({
        type: 'dataZoom',
        startValue: dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)],
        endValue: dataAxis[Math.min(params.dataIndex + zoomSize / 2, 6)]
    });
});