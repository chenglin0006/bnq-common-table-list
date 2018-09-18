import moment from 'moment';
import Toast from './components/prompt/toast';
import Dialog from './components/dialog/index'
// import * as Qiniu from 'qiniu-js';
// import Fetch from '../middleware/fetch/fetch';

const createUrl = (request) => {
    let url = request.url;
    let param = request.param;
    let isExport = request.isExport;

    if (param) {
        url = !url.includes('?') && url + '?';
        if (!isExport) {
            for (let key of Object.keys(param)) {
                url = url + key + '=' + param[key] + '&';
            }
        } else {//列表导出接口不需要传pageSize&curPage
            for (let key of Object.keys(param)) {
                if (key === 'pageSize' || key === 'curPage') {
                    continue;
                } else {
                    url = url + key + '=' + param[key] + '&';
                }
            }
        }
        if (url.endsWith('&')) {
            url = url.substring(0, url.length - 1);
        }
    }
    return url;
};

const getUrlArg = (name) => {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    let arg = window.location.search.substr(1).match(reg);
    return arg ? arg[2] : '';
};

//判断字符串/数组/对象/不为空时返回true
const isNotNull = (obj) => {
    if (obj instanceof Object) {
        for (var a in obj) {
            return true;
        }
        return false;
    }
    return typeof(obj) != 'undefined' && obj !== null && (Array.isArray(obj) ? obj.length !== 0 : obj !== "");
};

//时间戳转标准日期
const fmtDate = (obj) => {
    var date = new Date(obj);
    var y = 1900 + date.getYear();
    var m = "0" + (date.getMonth() + 1);
    var d = "0" + date.getDate();
    return y + "-" + m.substring(m.length - 2, m.length) + "-" + d.substring(d.length - 2, d.length);
};

//毫秒数或中国标准时间转日期：
function msToDate(msec) {
    let datetime = new Date(msec);
    let year = datetime.getFullYear();
    let month = datetime.getMonth();
    let date = datetime.getDate();
    let hour = datetime.getHours();
    let minute = datetime.getMinutes();
    let second = datetime.getSeconds();
    let result1 = year +
        '-' +
        ((month + 1) >= 10 ? (month + 1) : '0' + (month + 1)) +
        '-' +
        ((date + 1) < 10 ? '0' + date : date) +
        ' ' +
        ((hour + 1) < 10 ? '0' + hour : hour) +
        ':' +
        ((minute + 1) < 10 ? '0' + minute : minute) +
        ':' +
        ((second + 1) < 10 ? '0' + second : second);

    let result2 = year +
        '-' +
        ((month + 1) >= 10 ? (month + 1) : '0' + (month + 1)) +
        '-' +
        ((date + 1) < 10 ? '0' + date : date);

    let result = {
        hasTime: result1,
        withoutTime: result2
    };
    return result;
}

//向data里面添加初始化（initalValue）值
const setInitialValue = (items, values) => {
    items && items.forEach((item) => {
        if (item.type === 'cascader') {
            setInitialValue(item.linkage, values);
        }
        let value = values && values[item.id];
        if (value === 0 || value) {
            if (item.type === 'datepicker') {
                let dateFormat = 'YYYY-MM-DD';
                if(item.showTime){
                    dateFormat = 'YYYY-MM-DD HH:mm:ss'
                }
                value = moment(fmtDate(value), dateFormat);
            } else if (item.type === 'switch') {
                value === 0 ? value = false : value = true;
            }
            item.initialValue = value;
        } else {
            if(item.mode=='multiple'&&item.type=='select' || item.type=='checkbox'){
                item.initialValue = [];
            } else {
                item.initialValue = '';
            }
        }
    });
};

//用于新建的页面将所有数据重置（用于新建和编辑是一个页面的时候）
const resetInitialValue = (items) => {
    items && items.forEach((item) => {
        delete item.initialValue;
    })
}
/*
 *argus: object，里面包含参数
 *status
 *code
 *message
 *params: 当前列表搜索的参数值，fetch成功之后，无刷新更改浏览器URL
 *isShowDialog: 控制当code不等于-1、0的时候，是否显示Dialog，还是Toast
*/
const fetchCallback = (argus) => {
    const {status, code, message, params, updateStatus, successCallback, isShowToastSuccess, successText, isShowDialog,isNotReplaceState,mulParams} = argus;
    if (status) {
        updateStatus();
        if (code && code !== 0) {
            if (code >= 500) {
                Toast.show('服务器异常');
            } else if (code >= 400) {
                if (code == 404) {
                    Toast.show('服务器找不到请求地址');
                } else if (code == 414) {
                    Toast.show('请求的 URI（通常为网址）过长，服务器无法处理');
                } else {
                    Toast.show('错误请求');
                }
            } else if (code >= 300) {
                Toast.show('网络异常');
            } else if (code == -1) {
                window.location.href = getAuthUrl();
            } else {
                !isShowDialog ? Toast.show(message) : Dialog.open({
                    message: message,
                    dialogButton: [
                        {
                            text: '确定',
                            type: 'primary',
                            clickHandle: () => {
                                Dialog.close();
                            }
                        }
                    ]
                });
            }
        } else if (code === 0) {
            isShowToastSuccess ? Toast.show(successText || message) : null;

            if (params) {
                //获取列表数据成功之后，无刷新更新URL
                if(isNotReplaceState===true){
                }else {
                    let linkParams = params;
                    if(mulParams){
                        linkParams = Object.assign({},mulParams,params);
                    }
                    let url = createUrl({
                        url: window.location.origin + window.location.pathname,
                        param: linkParams
                    });
                    window.history.replaceState({}, 0, url);
                }
            }
            successCallback && successCallback();
        }
    }
};

//获取登录地址

const getCookie = (cookieName) => {
    let cookieStr = decodeURI(document.cookie);
    let arr = cookieStr.split("; ");
    let cookieValue = '';
    for (let i = 0; i < arr.length; i++) {
        let temp = arr[i].split("=");
        if (temp[0] == cookieName) {
            cookieValue = temp[1];
            break;
        }
    }
    return decodeURI(cookieValue);
}

//图片上传七牛云，调用七牛云SDK
// const getQiniuToken = (e, callBack, id, fileSizeLimit) => {
//     Toast.show('上传图片中');
//     let file = e.file;
//     Fetch({
//         url: '/upload/getQiniuToken',
//         type: 'GET',
//         isQiniu: 'true'
//     }).then((res) => {
//         if (res.response.code === 0) {
//             let key = file.name;
//             let token = res.response.data.upToken;
//             if(fileSizeLimit&&file.size>fileSizeLimit*1048576){
//                 Toast.show('支持'+fileSizeLimit+'M以内图片');
//                 return
//             }
//             let putExtra = {
//                 fname: "",
//                 params: {},
//                 mimeType: ["image/png", "image/jpeg", "image/jpg"]
//             };
//             let observer = {
//                 next(res) {
//                     let total = res.total;
//                 },
//                 error(err) {
//                     if (err && err.isRequestError) {
//                         switch (err.code) {
//                             case 614:
//                                 Toast.show('该图片已经存在!');
//                                 break;
//                             default:
//                                 Toast.show(err.message);
//                         }
//                     } else {
//                         Toast.show('支持jpg、.png、.jpeg格式!');
//                     }
//                 },
//                 complete(res) {
//                     res.id = id;
//                     callBack && callBack(res)
//                 }
//             }
//             //调用sdk上传接口获得相应的observable，控制上传和暂停
//             let observable = Qiniu.upload(file, key, token, putExtra);
//             let subscription = observable.subscribe(observer);
//         }
//     })
// }

//数组交换顺序 用于元素的前移或者后移
const swapItems = (arr,index1,index2)=>{
    arr[index1] = arr.splice(index2, 1, arr[index1])[0];
    return arr;
}

const QiniuCallBack = (res,newData)=>{
    let timeStamp=new Date().getTime();
    newData.forEach((ele,index)=>{
        if(ele.id == res.id){
            if(ele.uploadImgLimitNumber>1 || !ele.uploadImgLimitNumber&&ele.uploadImgLimitNumber!=0){
                let list = ele.fileList;
                if(list.length==ele.uploadImgLimitNumber){
                    let msg = `最多允许传${ele.uploadImgLimitNumber}张图`;
                    Toast.show(msg);
                    return
                }
                list.push({
                    flag:timeStamp,
                    uid: timeStamp,
                    name: res.key,
                    status: 'done',
                    url: 'http://res1.bnq.com.cn/' + res.key + '?t=' + timeStamp,
                })
                ele.fileList = list;
            } else {
                ele.fileList = [{
                    uid: -1,
                    name: res.key,
                    status: 'done',
                    url: 'http://res1.bnq.com.cn/' + res.key + '?t=' + timeStamp,
                }]
            }
        }
    })
}

const RemoveImgFun= (flag,id,newData)=>{
    newData.forEach((ele)=>{
        if(ele.id == id){
            ele.fileList.forEach((item,index)=>{
                if(item.flag === flag){
                    ele.fileList.splice(index,1);
                }
            })
        }
    })
}

const SortImgFun = (index,type,id,newData)=> {
    newData.forEach((ele) => {
        if (ele.id == id) {
            if (type == 'pre') {
                if (index == 0) {
                    return;
                }
                ele.fileList = swapItems(ele.fileList, index, index - 1);
            } else {
                if (index == ele.fileList.length - 1) {
                    return;
                }
                ele.fileList = swapItems(ele.fileList, index, index + 1);
            }
        }
    })
}

//深拷贝
const deepClone = (obj)=> {
    var str, newobj = obj.constructor === Array ? [] : {};
    if(typeof obj !== 'object'){
        return;
    } else if(window.JSON){
        str = JSON.stringify(obj), //序列化对象
            newobj = JSON.parse(str); //还原
    } else {
        for(var i in obj){
            newobj[i] = typeof obj[i] === 'object' ? deepClone(obj[i]) : obj[i];
        }
    }
    return newobj;
}

const getEnv = ()=>{
    let ENV = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168') || window.location.hostname.endsWith('.dev-zt.bnq.com.cn') ? 'development' : 'production';
    if(ENV=='production'){
        if(window.location.hostname.indexOf('dev')>-1){
            ENV = 'productionDev';
        } else if (window.location.hostname.indexOf('uat')>-1){
            ENV = 'productionUat';
        } else {
            ENV = 'production';
        }
    }
    return ENV;
}

const flatten =(arr)=>{
    var res = [];
    for(var i=0;i<arr.length;i++){
        let arry = arr[i]&&arr[i].children || arr[i];
        if(arry&&Array.isArray(arry)){
            res = res.concat(flatten(arry));
        }else{
            if(arry&&!arry.children){
                res.push(arry);
            }
        }
    }
    return res;
}

//处理目录对应的tree
const treeDataDeal = (arr)=>{
    arr&&arr.forEach((ele,index)=>{
        ele.id=ele.key;
        ele.name = ele.title;
        if(ele.children&&ele.children.length){
            treeDataDeal(ele.children)
        }
    })
    return arr;
}

const findButtonsDeal = (data,url)=>{
    let buttons = [];
    data&&data.forEach((ele)=>{
        if(ele.url==url){
            buttons = deepClone(ele.buttons);
        } else if(ele.childNodes){
            findButtonsDeal(ele.childNodes,url);
        }
    })
    return buttons;
}

//资源类型resourceType（10：菜单，11：页面，12：按钮）
const resourseDeal = (data)=>{
    data.forEach((ele,index)=>{
        ele.name=ele.resourceName;
        ele.icon = ele.resourceIcon;
        ele.url = ele.resourceLink;
        ele.children = [];
        ele.buttons = [];
        if(ele.childNodes&&ele.childNodes.length){
            ele.childNodes.forEach((item,itemIndex)=>{
                if(item.resourceType==12){
                    let obj ={
                        name:item.resourceName,
                        type:'primary',
                        id:item.resourceValue,
                        actionFun:item.resourceFunction
                    }
                    ele.buttons.push(obj);
                } else {
                    ele.children.push(item);
                }
            })
            if(ele.children.length==0){
                delete ele.children;
            }
            resourseDeal(ele.childNodes);
        }else {
            ele.children = null;
        }
    })
    return data
}

//处理门店对应的tree结构
const detailTreeDataDeal = (arr)=>{
    arr&&arr.forEach((ele,index)=>{
        ele.key=ele.code+'';
        ele.title = '（'+ele.code+'）'+ele.name;
        if(ele.children&&ele.children.length){
            ele.isLast = false;
            detailTreeDataDeal(ele.children)
        } else {
            ele.isLast = true;
        }
    })
    return arr;
}

let isLastBool = false;
const isLastTreeItem = (treeData,key)=>{
    treeData.forEach((ele) => {
        if (ele.key + '' == key + '') {
            isLastBool = ele.isLast;
        } else if (ele.children && ele.children.length) {
            isLastTreeItem(ele.children, key);
        }
    })
    return isLastBool
}

export {
    createUrl,
    getUrlArg,
    isNotNull,
    msToDate,
    fmtDate,
    setInitialValue,
    resetInitialValue,
    fetchCallback,
    getCookie,
    // getQiniuToken,
    swapItems,
    QiniuCallBack,
    RemoveImgFun,
    SortImgFun,
    deepClone,
    getEnv,
    flatten,
    treeDataDeal,
    resourseDeal,
    findButtonsDeal,
    detailTreeDataDeal,
    isLastTreeItem
}
