import { axios } from '@/utils/request'
var qs = require('querystring');

/**
* @params String client_id     
* @params String client_secret
* @params String grant_type
*/
export function getBaiduTokenAjax(postData,fn1,fn2) {
    axios.post('/oauth/2.0/token',qs.stringify(postData))
        .then(function(data){
            fn1 && fn1(data);
        })
        .catch(function(err){
            fn2 && fn2(err.message);
        });
 }
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
export function getBaiduServer_api_Ajax(postData,fn1,fn2) {
    axios.post('/server_api',postData)
        .then(function(data){
            fn1 && fn1(data);
        })
        .catch(function(err){
            fn2 && fn2(err.message);
        });
 }
 