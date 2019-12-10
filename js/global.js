const globe3D = echarts.init(document.getElementById("global"));
				//配置项
				const globeOpt = {
				    globe: {
				    	environment: 'img/bg09.jpg', //环境贴图
				        baseTexture: "img/globe.jpg", //地球的纹理
				        heightTexture: "img/globe.jpg", //地图的高度纹理
				        displacementScale: 0, //地球顶点位移的大小
				        shading: 'realistic', //着色效果，真实感渲染
				        realisticMaterial: { //真实感渲染配置
				            roughness: 0.8 //材质的粗糙度
				        },
				        postEffect: { //后处理特效配置
				            enable: true
				        },
				        light: { //光照设置
				            main: { //场景主光源设置，在globe设置中就是太阳光
				                intensity: 5, //主光源强度
				                shadow: true //是否投影
				            },
				            ambientCubemap: { //使用纹理作为光源的环境光， 会为物体提供漫反射和高光反射
				                texture: 'img/pisa.hdr', //环境光贴图
				                diffuseIntensity: 0.1 //漫反射强度
				            }
				        }
				    }
				};
				//渲染图表
				globe3D.setOption(globeOpt);