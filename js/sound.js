 function showSound(audioSrc) {
            /**因为音效元素是追加的，所以每次生成之前，将原来的删除掉*/
            $("#hint").remove();
            /**创建audio标签的Jquery对象，然后追加到body进行播放即可*/
            let audioJQ = $("<audio src='" + audioSrc + "' autoplay id='hint'/>");
            audioJQ.appendTo("body");
        }

// $(function () {
//             /** 音效*/
//             $("#hintButton").click(function () {
//                 showSound("icon/click.mp3");
//             });
//         });
