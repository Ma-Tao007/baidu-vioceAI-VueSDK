<template>
    <div>
        <button @click="start()">开始录音</button>
        <button @click="stop()">结束录音</button>
    </div>
</template>
<script>
import { HZRecorder} from '../../static/js/recorder'
//api
import { getBaiduTokenAjax,getBaiduServer_api_Ajax } from '@/api/baidu/baidu'

export default {
  data() {
    return {
        isVoice:false,
        recorder:{},
        audio_context:{},
        baiduToken:''
    };
  },
  mounted() {
    getBaiduTokenAjax({
            client_id: '',              //必须参数，应用的API Key
            client_secret: '',  //必须参数，应用的Secret Key
            grant_type: 'client_credentials',                   //必须参数，固定为client_credentials
        },data=>{
            //保存百度Token
            console.log("请求成功",data.access_token)
            this.baiduToken = data.access_token
        })


    var that = this
    this.$nextTick(() => {
      //获取录音对象
      try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        navigator.mediaDevices.getUserMedia =  navigator.mediaDevices.getUserMedia ||
                                navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia
        window.URL = window.URL || window.webkitURL;

        that.audio_context = new AudioContext();
        console.log(
          "navigator.getUserMedia " +
            (navigator.getUserMedia ? "available." : "not present!")
        );
      } catch (e) {
        alert("No web audio support in this browser!");
      }

      navigator.getUserMedia(
        { audio: true },
        function (stream) {
          that.recorder = new HZRecorder(stream);
          console.log("初始化完成");
        },
        function (e) {
          console.log("No live audio input: " + e);
        }
      );
    });
  },
  methods: {
    start() {
        //开启录音 -->
        this.recorder && this.recorder.start();
        this.isVoice = true;
      } ,
      stop(){
        var that = this
        this.isVoice = false;
        //结束录音 -->
        this.recorder && this.recorder.stop();
        setTimeout(() => {
          // 录音上传 -->
          var mp3Blob = this.recorder.upload();
          let blobToDataURL=(blob, callback)=> {
              var a = new FileReader();
              a.onload = function (e) { callback(e.target.result.split('data:audio/wav;base64,')[1]); }
              a.readAsDataURL(blob);
          }
          blobToDataURL(mp3Blob,(base_64)=>{
              let vaudioItem =
                  {
                      isMyMasg: true,
                      masgType: 'vaudio',
                      audioUrl: mp3Blob,
                      isPlayAudio: false,
                      data: null
                      // data: data_data.data.result[0]

                  }
              // that.datas=that.datas.concat(vaudioItem);

              /**
              * @params String format
              * @params Number rate
              * @params Number dev_pid
              * @params Number channel
              * @params String token
              * @params String cuid(baidu_workshop)
              * @params String len
              * @params base64 speech （FILE_CONTENT）
              * @returns Promise
              */
              getBaiduServer_api_Ajax({
                  speech: base_64,//本地语音文件的的二进制语音数据 ，需要进行base64 编码。与len参数连一起使用。
                  len: mp3Blob.size,		//字节数
                  dev_pid: 1537,//普通话识别代码
                  cuid: '541b:3f:5af4:b2c9',
                  rate: 16000,//音频格式16k或8k 采样率、16bit 位深、单声道，
                  token: that.baiduToken,//根据你的参数获取的token
                  channel: 1,//单声道
                  format: 'wav',//识别的格式
                  // lan: 'ct',//历史兼容参数，已不再使用
              },baidu_data=>{
                  //清除录音给下一个录音初始化
                  that.recorder.clear()
                  if (baidu_data.err_msg == 'success.'){
                    console.log('识别结果：'+baidu_data.result[0])
                  }else {
                    alert('识别失败')
                  };
              })
          })
        }, 1000);
      }

  },
};
</script>
