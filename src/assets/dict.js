(function(){
  window.Dict = {
    fileType: {
      "DOC,DOCX":"word",
      "XLS,XLSX":"excel",
      "TXT":"txt",
      "PPT":"ppt",
      "PDF":"pdf",
      "MP3":"music",
      "MP4,AVI,RMVB,FLV":"video",
      "ZIP,RAR,7Z":"package",
      default:"undefined"
    },
    getUserId: (function () {
      var lowKey = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
      var arr = []
      lowKey.forEach(item => {
        arr.push(item);
        arr.push(item.toLocaleUpperCase())
      });
      for (let i = 0; i < 10; i++) {
        arr.push(i);
      }
      var narr = [], len = arr.length;
      for (let i = 0; i < len; i++) {
        narr.push(arr.splice((Math.floor(Math.random() * arr.length)), 1)[0]);
      }
      return function (num = 16) {
        let result = [];
        for (let i = 0; i < num; i++) {
          result.push(narr[Math.floor(Math.random() * len)]);
        }
        return result.join("");
      }
    })(),
    emojiList:[
      {icon:"1wx",label:"微笑"},
      {icon:"2ws",label:"哇塞"},
      {icon:"3ng",label:"难过"},
      {icon:"4tp",label:"调皮"},
      {icon:"5cy",label:"呲牙"},
      {icon:"6smm",label:"色眯眯"},
      {icon:"7xmm",label:"笑眯眯"},
      {icon:"8jy",label:"惊讶"},
      {icon:"9lh",label:"刘海"},
      {icon:"10tst",label:"吐舌头"},
      {icon:"11zh",label:"憎恨"},
      {icon:"12kx",label:"哭笑"},
      {icon:"13xz",label:"吓着"},
      {icon:"14qq",label:"亲亲"},
      {icon:"15hgg",label:"好尴尬"},
      {icon:"16wq",label:"委屈"},
      {icon:"17lh",label:"冷汗"},
      {icon:"18kz",label:"口罩"},
      {icon:"19sj",label:"睡觉"},
      {icon:"20dx",label:"担心"},
      {icon:"21nh",label:"怒火"},
      {icon:"22dy",label:"得意"},
      {icon:"23fn",label:"愤怒"},
      {icon:"24dyl",label:"独眼龙"},
      {icon:"25tx",label:"偷笑"},
      {icon:"26yk",label:"愉快"},
      {icon:"27bs",label:"鄙视"},
      {icon:"28dk",label:"大哭"},
      {icon:"29cm",label:"财迷"},
      {icon:"30xy",label:"眩晕"},
      {icon:"32kq",label:"哭泣"},
      {icon:"33ty",label:"晕"},
      {icon:"34hp",label:"害怕"},
      {icon:"35bz",label:"闭嘴"},
      {icon:"36kbz",label:"抠鼻子"},
      {icon:"37fd",label:"发抖"},
      {icon:"38bb",label:"拜拜"},
      {icon:"39yw",label:"疑问"},
      {icon:"40s",label:"衰"},
      {icon:"41kbj",label:"眼瞎"},
      {icon:"42sq",label:"生气"},
      {icon:"43xd",label:"心动"},
      {icon:"44xs",label:"心碎"},
      {icon:"45xw",label:"学问"},
      {icon:"46js",label:"沮丧"},
      {icon:"47sx",label:"伤心"},
      {icon:"48yc",label:"忧愁"},
      {icon:"49nb",label:"棒"},
      {icon:"50ok",label:"好的"},
      {icon:"51qt",label:"晴天"},
      {icon:"52dy",label:"多云"},
      {icon:"53xy",label:"下雨"},
      {icon:"54yt",label:"阴天"},
      {icon:"31666",label:"666"},
    ],
    findFileType(fileType){
      if(!fileType)return this.fileType.default;
      fileType = fileType.toLocaleUpperCase();
      for (const key in this.fileType) {
        if(key.indexOf(fileType) != -1){
          return this.fileType[key];
        }
      }
      return this.fileType.default;
    },
    contentType: {
      text: 1, //文本
      voice: 2, //语音 声音
      img: 3, //图片
      file: 4, //文件
    },

  }
})(window);
