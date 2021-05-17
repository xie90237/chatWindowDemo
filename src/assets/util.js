(function (window) {
  let Util = {}
  /**
   * 提示新消息
   */
  Util.newmsgTip = (function(){
    const title = document.head.querySelector("title").innerHTML;
    var oAudio = document.createElement("audio");
    oAudio.preload="auto";
    oAudio.src="/static/music/hint.mp3";
    document.body.appendChild(oAudio);
    var time;
    return {
      open(text = "（您有新消息了）"){
        window.musicPlay&&oAudio.play();
        let state = true;
        if(time)clearInterval(time);
        window.timerBase["I1"] = time = setInterval(()=>{
          document.head.querySelector("title").innerHTML = title+(state?text:"");
          state = !state;
        },100);
      },
      close(){
        clearInterval(time);
        document.head.querySelector("title").innerHTML = title;
      }
    }
  })();
  /**
   * 打开放大图片
   */
  Util.openpreview = (function(){
    var oDiv = document.createElement("div");
    oDiv.className = "preview-img"
    var oSpan = document.createElement("span");
    oSpan.className = "icon-close";
    oDiv.appendChild(oSpan);
    var oImg = document.createElement("img");
    oDiv.appendChild(oImg);
    document.body.appendChild(oDiv);
    oDiv.onclick = oSpan.onclick=function(){
      oDiv.className = "preview-img"
      oImg.src = "";
    }
    return function(imgUrl){
      oDiv.className = "preview-img show"
      oImg.src = imgUrl;
    }
  })();
  Util.getFileSize = function(fileSize=0,type=0){
    fileSize = Number(fileSize);
    let fileSizeType = ["B", "KB", "MB", "GB", "TB"];
    if(fileSize<1024){
      return fileSize.toFixed(1)+fileSizeType[type];
    }else{
      fileSize = fileSize/1024;
      return Util.getFileSize(fileSize,type+1);
    }
  };
  /**
   * 打开弹框 半透明
   */
  Util.openalert = (function(){
    var oDiv = document.createElement("div");
    oDiv.style.display = "none";
    var oSpan = document.createElement("span");
    oDiv.appendChild(oSpan);
    document.body.appendChild(oDiv);
    return function(text){
      oDiv.className = "alert-tip"
      oSpan.innerHTML=text;
      window.timerBase["w1"] = setTimeout(function () {
        oDiv.className = 0;
      },2800)
    }
  })();
  //节流 工厂
  Util.throttleFactory=function(fn,timeout){
    return (function(){
      let state = true;
      return function() {
        var arg = arguments;
        if(!state){
          return;
        }
        state = false;
        window.timerBase["f1"] = setTimeout(()=>{
          fn.apply(null,arg);
          state = true;
        },timeout)
      }
    })();
  };
  //防抖工厂
  Util.antiShakeFactory=function(fn,timeout){
    return (function(){
      let time = null;
      return function() {
        var arg = arguments;
        clearTimeout(time);
        window.timerBase["f2"] = time = setTimeout(()=>{
          fn.apply(null,arg);
        },timeout)
      }
    })();
  };
  //函数链 柯里化
  Util.FunctionChain = (function(){
    var chain = [];
    return function(){ // 参数只有一个 要么为true  要么为箭头函数
      var res = [].shift.apply(arguments);
      if(Object.prototype.toString.call(res) == "[object Function]"){
        chain.push(res);
      }else if(Object.prototype.toString.call(res) == "[object Boolean]"){
        let fn = chain.shift();
        fn&&fn.apply(null,arguments);
      }
    }
  })();

  /**
   * js判空方法
   */
  Util.validatenull = function (val) {
    if (val instanceof Array) {
      if (val.length == 0) return true;
    } else if (val instanceof Object) {
      if (JSON.stringify(val) === '{}') return true;
    } else {
      if (val == 'null' || val == null || val == 'undefined' || val == undefined || val == '') return true;
      return false;
    }
    return false;
  };

  Util.getCorrectStr = function(str){
    if(Object.prototype.toString.call(str) === "[object String]"){
      let start = false,end = false;
      let strArr = str.split("").map(item => {
        if(item === "\t")return "  ";
        return item;
      }).join("").split("");
      while (!start || !end){
        (strArr[0] == " ")?strArr.shift():start = true;
        (strArr[strArr.length - 1] == " ")?strArr.pop():end = true;
      };
      return strArr.join("");
    }
    return str;
  };
  /**
   * 解析JSON
   */
  Util.validateJSON = function (str,state = false) {
    if(Object.prototype.toString.call(str) === "[object String]"){
      try {
        let obj = JSON.parse(str);
        return obj;
      }catch (e) {
        if(state) return {};
        return Util.validateJSON(Util.getCorrectStr(str),true);
      }
    }
    return {};
  };
  /**
   * 处理时间
   * 2个回调函数
   * date：传入时间
   * format： 传入时间类型
   */
  Util.getTime = function (date, format) {
    if (!date) {
      return '--';
    }
    let yy = new Date(date).getFullYear()+"";
    let mm = (new Date(date).getMonth() + 1 > 9) ? new Date(date).getMonth() + 1 : '0' + (new Date(date).getMonth() + 1);
    let dd = (new Date(date).getDate() > 9) ? new Date(date).getDate() : '0' + new Date(date).getDate();
    let yearOne = new Date(yy, 0, 1);
    let yearnumday = Math.round((new Date(date).valueOf() - yearOne.valueOf()) / 86400000);
    let ww = Math.ceil((yearnumday + ((yearOne.getDay() + 1) - 1)) / 7);
    let hh = (new Date(date).getHours() > 9) ? new Date(date).getHours() : '0' + new Date(date).getHours();
    let min = (new Date(date).getMinutes() > 9) ? new Date(date).getMinutes() : '0' + new Date(date).getMinutes();
    let ss = (new Date(date).getSeconds() > 9) ? new Date(date).getSeconds() : '0' + new Date(date).getSeconds();

    format = format.replace(/y+/,yy);
    format = format.replace(/m+/,mm);
    format = format.replace(/d+/,dd);
    format = format.replace(/h+/,hh);
    format = format.replace(/M+|min/,min);
    format = format.replace(/s+/,ss);
    format = format.replace(/w+/,ww);
    return format;
  }

  /**
   * js精确加法 多个数字相加
   */
  Util.addFns = function (){
    let lengthArr = [],dataArr = [], maxlength = 0,sumNum = 0;
    //对参数进行初步处理
    [].map.call(arguments,(item,index) => {
      if(Number.isNaN(item)) item = 0;
      let num = item || 0
      dataArr.push(Number(num));  // 对原参数进行处理保存
      let float = num.toString().split(".")[1]; //将参数中的小数点后数据取出 Integer
      lengthArr.push(float?float.toString().length:0);    //对小数的长度进行处理保存 Integer
    })
    maxlength = Math.max.apply(Math,lengthArr);           //对小数长度进行对比获取最大小数长度 Integer
    lengthArr.map((item,index) => {               //对数据进行遍历 获取小数长度
      for(let i = 0; i<maxlength;i++){                    //对所有数据 进行数据大小的统一 例 参数为 1.23456，2.2， 这里会将数据处理成 123456,220000  Integer
        dataArr[index] = dataArr[index] * 10;
      }
      sumNum += Number(dataArr[index]);                   //对数据进行相加统计 Integer
    })
    return sumNum / Math.pow(10, maxlength) || 0;    //对数据做最后处理 并输出
  }

  /*
   *精准减法
   * */
  Util.floatSub = (arg1,arg2) => {
    arg1 = !!arg1?arg1:0
    arg2 = !!arg2?arg2:0
    let r1,r2,m,n;
    try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0}
    try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0}
    m=Math.pow(10,Math.max(r1,r2));
    //动态控制精度长度
    n=(r1>=r2)?r1:r2;
    return ((arg1*m-arg2*m)/m).toFixed(n);
  }

  /*
   *精准乘法
   * */
  Util.accMul = (arg1, arg2)=> {
    arg1 = !!arg1?arg1:0
    arg2 = !!arg2?arg2:0
    let m = 0,
      s1 = arg1.toString(),
      s2 = arg2.toString();
    try { m += s1.split(".")[1].length } catch (e) {}
    try { m += s2.split(".")[1].length } catch (e) {}
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
  };


  /*
   *精准除法
   * */
  Util.floatDiv = (arg1,arg2) =>{
    arg1 = !!arg1?arg1:0
    arg2 = !!arg2?arg2:0
    let t1=0,t2=0,r1,r2;
    try{t1=arg1.toString().split(".")[1].length}catch(e){}
    try{t2=arg2.toString().split(".")[1].length}catch(e){}

    r1=Number(arg1.toString().replace(".",""));

    r2=Number(arg2.toString().replace(".",""));
    return (r1/r2)*Math.pow(10,t2-t1);
  }

  window.Util = Util
})(window)
