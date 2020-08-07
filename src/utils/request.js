import Vue from 'vue'
import axios from 'axios'

// 创建 axios 实例
const service = axios.create({
  // baseURL: '/api', // api base_url
  timeout: 6000, // 请求超时时间
  withCredentials: true,
  crossDomain: true
})

let flag = true

let pending = []; //声明一个数组用于存储每个ajax请求的取消函数和ajax标识
let cancelToken = axios.CancelToken;
let removePending = (ever) => {
    for(let p in pending){
        if(pending[p].u === ever.url + '&' + ever.method) { //当当前请求在数组中存在时执行函数体
            pending[p].f(); //执行取消操作
            pending.splice(p, 1); //把这条记录从数组中移除
        }
    }
}
const err = (error) => {
  if (error.response) {
    const data = error.response.data
    if (error.response.status === 401 && !(data.result && data.result.isLogin)) {
      notification.error({
        message: 'Unauthorized',
        description: 'Authorization verification failed'
      })
    }
  }
  return Promise.reject(error)
}

var requestMethod = ""//记录每一次请求的方式//get请求不控制重复

// request interceptor
service.interceptors.request.use(config => {
 
  if(!flag){
    return false
  }
  var token = localStorage.getItem('token')
  if(token!=null){
    config.headers['token'] = token
  }else{
    config.headers['token'] = 'eyJhbGciOiJIUzI1NiIsIlR5cGUiOiJKd3QiLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE1OTY2ODI5MzYsInVzZXIiOiJ7XCJsb2dpblR5cGVcIjowLFwib3BlbmlkXCI6XCJvVUlMUnN6QkpJRW5CM1RZUmd1X1ozcjc5Y0RVXCIsXCJyb2xlaWRcIjowLFwiZGVwdGlkXCI6MCxcInZpZXdraW5kXCI6MCxcImlkXCI6Nn0ifQ.Hq_z3qPdx2u0w37QZqcKiod6nqhw6RCmcWU7-a3MD1s'
  }

  // console.log("请求体",config)
  requestMethod = config.method
  if(requestMethod !='get'){
    removePending(config); //在一个ajax发送前执行一下取消操作
    config.cancelToken = new cancelToken((c)=>{
        // 这里的ajax标识我是用请求地址&请求方式拼接的字符串，当然你可以选择其他的一些方式
        pending.push({ u: config.url + '&' + config.method, f: c });  
    });
  }else{
    // //get请求，加一个随机数
    // console.log("查询的参数1：",config)
    // if(!config.params){
    //   config.data.t = (new Date()).valueOf()
    // }
    // console.log("查询的参数2：",config)
  }
  
  return config
}, err)


service.interceptors.response.use(response => {
  if(requestMethod != 'get'){
   removePending(response.config);  //在一个ajax响应后再执行一下取消操作，把已经完成的请求从pending中移除

  }

  // if(response.data.code=="401"){
  //   flag = false
  //   //退出登录
  //   // store.dispatch('Logout').then(() => {
  //   //   setTimeout(() => {
  //   //     window.location.reload()
  //   //   }, 1500)
  //   // })
  // }

  return response.data
}, err)

const installer = {
  vm: {},
  install (Vue) {
    Vue.use(VueAxios, service)
  }
}


export {
  installer as VueAxios,
  service as axios
}