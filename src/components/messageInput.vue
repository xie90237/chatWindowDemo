<template>
  <div :class="`xie-message-input-warp`" :disabled="disabled">
    <div ref="messageDIV" id="message-input"
         @click="(e)=> messageInputClick(e)"
         @keyup="messageInputClick"
         @keydown="(e) => {if (e.keyCode == 13){e.returnValue = false;e.preventDefault()}}"
         @input="messageInputClick"
         :contenteditable="!disabled" :disabled="disabled"></div>
    <div class="tool-warp">
      <div class="tool">
        <el-tooltip content="表情" effect="light">
          <icon-button style="margin-right: 20px;" @click="iconClick('emoji')" :disabled="disabled" icon="emoji"></icon-button>
        </el-tooltip>
        <el-upload
          ref="fileupload"
          style="margin-right: 20px;height: 25px;"
          :action="uploadUrl"
          :data="{type:4}"
          :before-upload="(file) => {return beforeFile('imageupload',file)}"
          :on-success="(resp, file) => {successFile('imageupload',resp, file)}"
          :on-error="(err, file) => {errorFile('imageupload',err, file)}"
          :on-progress="(event, file) => {progressFile('imageupload',event, file)}"
          :show-file-list="false"
          :disabled="disabled || isnotsend"
          :file-list="fileList">
          <el-tooltip content="文件" effect="light">
            <icon-button @click="iconClick('file')" :disabled="disabled || isnotsend" icon="file"></icon-button>
          </el-tooltip>
        </el-upload>
        <el-upload
          accept="image/*"
          ref="imageupload"
          style="margin-right: 20px;height: 25px;"
          :action="uploadUrl"
          :data="{type:3}"
          :before-upload="(file) => {return beforeFile('imageupload',file)}"
          :on-success="(resp, file) => {successFile('imageupload',resp, file)}"
          :on-error="(err, file) => {errorFile('imageupload',err, file)}"
          :on-progress="(event, file) => {progressFile('imageupload',event, file)}"
          :show-file-list="false"
          :disabled="disabled || isnotsend"
          :file-list="fileList">
          <el-tooltip content="图片" effect="light">
            <icon-button @click="iconClick('image')" :disabled="disabled || isnotsend" icon="image"></icon-button>
          </el-tooltip>
        </el-upload>
        <el-tooltip content="功能按钮" effect="light">
          <icon-button :disabled="disabled" icon="rate"></icon-button>
        </el-tooltip>
      </div>
      <el-button :disabled="disabled" size="small" round @click="onSubmit">发 送</el-button>
    </div>
    <div class="emoji-warp" v-if="emojivisible">
      <el-tooltip effect="light" v-for="(item,index) in $emojiArr" :key="index" :content="item.label">
        <i class="emoji" :style="{background:`url('${emojiUrl}${item.icon}.png')`}" @click="emojiClick"></i>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
  import iconButton from "./iconButton";
  export default {
    name: "messageInput",
    components: {
      iconButton
    },
    props:{
      isNow: {
        type:Boolean,
        default:_=> false
      },
      client: {
        type:Boolean,
        default:_=> true
      },
      isnotsend: {
        type:Boolean,
        default:_=> true
      },
      disabled:Boolean,
      fileUrl: {
        type:String,
        default:_=> location.origin
      },
      uploadUrl:String
    },
    data() {
      return {
        emojiUrl:"/static/images/emoji/",
        fileList:[],
        messageInput:{},
        currentObj: {},
        emojivisible: false,
        fileUploadObj:{},
        fileState:true,
      }
    },
    created() {
      this.messageInputClick = Util.antiShakeFactory((e)=>{
        this.messageInputClickfn(e);
      },100);
      this.initUpload = Util.antiShakeFactory((e)=>{
        Util.FunctionChain(true)
      },300);
    },
    mounted() {
      this.messageInput = document.getElementById("message-input");
      this.$emit("getDom",this.messageInput);
      this.messageInput.click();
      this.messageInput.addEventListener('paste',(e) => {
        const data=e.clipboardData||window.clipboardData;
        const item = data.items[0];
        if(!item)return;
        if(item.kind == "string"){
          item.getAsString(str => {
            let imgSrc = str.match(/<img src=([^>]*)>/);
            imgSrc = imgSrc?imgSrc[0]:imgSrc;
            if(imgSrc){
              imgSrc = imgSrc.match(/"[^"]*/);
              imgSrc = imgSrc?imgSrc[0]:imgSrc;
              imgSrc=imgSrc.substr(1);
              this.emojiClick(e,imgSrc);
              e.preventDefault();
            }
          });
        }else if(item.kind == "file"){
          const file = item.getAsFile();
          file.state = true;
          file.screenshot = true;
          Util.FunctionChain((()=>{
            return ()=>{
              this.fileState = false;
              this.$refs.imageupload.handleStart(file);
              this.$refs.imageupload.submit();
            }
          })());
          this.initUpload();
          e.preventDefault();
        }
      });
    },
    methods:{
      initUpload(){},
      isType(object){
        return Object.prototype.toString.call(object);
      },
      /*输入框 点击 回车 焦点*/
      messageInputClick(){},
      messageInputClickfn(e){
        this.convertText();
        let currKey = e.keyCode || e.which || e.charCode || 0; // 支持IE、FF
        if (currKey == 13){
          if(this.disabled)return;
          if(!e.ctrlKey){
            if (event) {
              e.returnValue = false
            } else {
              e.preventDefault()
            }
            this.onSubmit();
          } else{
            this.enterRangeContent();
          }
        }else{
          //获取当前用户文本域
          this.currentObj.range = document.createRange();
          //返回用户当前的选区
          this.currentObj.sel =  document.getSelection();

          this.currentObj.dom =  document.getSelection().focusNode;
          //获取当前光标位置
          this.currentObj.offset = this.currentObj.sel.focusOffset;
          // console.log(this.currentObj.offset);
        }
      },
      enterRangeContent(){
        //获取当前用户文本域
        let range = document.createRange();
        //返回用户当前的选区
        let sel =  document.getSelection();
        //获取当前光标位置
        let offset = sel.focusOffset;

        let dom =  document.getSelection().focusNode;
        //判断messageInput内有没有文本
        if(!this.messageInput.innerHTML){
          return
        }
        let odiv = document.createElement("div");
        if(Object.prototype.toString.call(dom) == "[object Text]"){
          // console.log("text",offset,dom.length);
          if(offset === 0){
            //光标在文本的前面
            odiv.appendChild(document.createElement("br"));
            dom.before(odiv);
            range.setStart(dom, 0);
          }else if(dom.length == offset) {
            odiv.appendChild(document.createElement("br"));
            //光标在文本的最后
            dom.after(odiv);
            range.setStart(odiv, 0);
          }else{
            //光标在中间
            odiv.appendChild(dom.splitText(offset));
            dom.after(odiv);
            range.setStart(odiv, 0);
          }
        }else{
          // console.log("dom",offset,dom.childNodes.length);
          let beforedom = dom.childNodes[offset-1];
          let afterdom = dom.childNodes[offset];
          // console.log("beforedom",beforedom)
          if(offset === 0){
            // console.log("dom前面")
            //光标在dom的前面
            odiv.appendChild(document.createElement("br"));
            afterdom.before(odiv);
            range.setStart(afterdom, 0);
          } else if(dom.childNodes.length == offset) {
            // console.log("dom后面")
            odiv.appendChild(document.createElement("br"));
            //光标在dom的最后
            beforedom.after(odiv);
            range.setStart(odiv, 0);
          } else{
            //光标在中间
            let afterDiv = document.createElement("div");
            for (let i = 0,node; node=dom.childNodes[0];i++) {
              if(i<offset){
                odiv.appendChild(node)
              }else{
                afterDiv.appendChild(node)
              }
            }
            dom.appendChild(odiv);
            dom.appendChild(afterDiv);
            range.setStart(afterDiv, 0);
          }
        }
        //使得选区(光标)开始与结束位置重叠
        range.collapse(true);
        //移除现有其他的选区
        sel.removeAllRanges();
        //加入光标的选区
        sel.addRange(range);
      },
      convertText(){
        const nDelAttrName="href,src,target,class";
        for (let i=0,dom;dom = document.querySelectorAll("#message-input *")[i++];){
          for (let j=0,attr;attr = dom.attributes[j++];){
            if(nDelAttrName.indexOf(attr.name) == -1){
              dom.removeAttribute(attr.name);
            }
          }
          switch (this.isType(dom)) {
            case "[object HTMLPreElement]":
              dom.outerHTML = dom.innerHTML;
              break;
            case "[object HTMLAnchorElement]":
              dom.setAttribute("target","_blank");
              break;
            case "[object HTMLImageElement]":
              this.handelImg(dom)
              break;
          }
        }
      },
      handelImg(dom){
        const fileTypeObj = {
          "png":"png",
          "jpeg":"jpg",
          "gif":"gif",
          "svg+xml":"svg",
          "x-icon":"ico",
          "bmp":"bmp",
        };
        let fileType = dom.getAttribute("src").match(/data:image\/(\S*);base64,/);
        fileType = fileType?fileType[1]:null;
        if(fileTypeObj[fileType]){
          if(this.isnotsend){
            dom.outerHTML = "";
            Util.openalert("非客服状态不能发送截图")
          }else{
            Util.FunctionChain((()=>{
              let Dom = dom,fileName = Util.getUserId(20)+"."+fileTypeObj[fileType],type="image/"+fileTypeObj[fileType];
              return ()=>{
                this.dataURLtoFile(Dom,fileName,type);
              }
            })());
            this.initUpload();
          }
        }
      },
      dataURLtoFile(dom,filename,filetype) {
        if(dom.getAttribute("src").indexOf("http") != -1)return;
        var arr = dom.getAttribute("src").split(","),
          bstr = window.atob(arr[1]),
          n = bstr.length,
          u8arr =new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        let file = new File([u8arr], filename, {type: filetype});
        file.state = true;
        file.dom = dom;
        this.$refs.imageupload.handleStart(file);
        this.$refs.imageupload.submit();
      },
      getNodeIndex(List,dom){
        let result = 0;
        for (let i = 0,node; node = List[i++];){
          if(dom.isSameNode(node)){
            return result = i;
          }
        }
        return result;
      },
      /*表情点击*/
      emojiClick(e,imgUrl){
        let bgurl = imgUrl || e.target.style.background.split("\"")[1];
        let oimg = document.createElement("img");
        oimg.src = bgurl
        if(!imgUrl)oimg.className = "emoji";
        let {range,sel,dom,offset} = this.currentObj;
        if (!dom){
          dom = this.messageInput;
          dom.append(oimg);
          range.setStart(dom,1);
          this.currentObj.dom = oimg;
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
          this.emojivisible = false;
          return;
        }else{
          if(Object.prototype.toString.call(dom) == "[object Text]"){
            if(offset == 0) {
              dom.before(oimg);
              this.currentObj.dom = oimg;
              range.setStart(dom,0);
            }else if(dom.length == offset) {
              dom.after(oimg);
              this.currentObj.dom = oimg;
              range.setStart(dom.parentNode,this.getNodeIndex(dom.parentNode.childNodes,dom)+1);
            }else{
              dom.splitText(this.currentObj.offset);
              dom.after(oimg);
              this.currentObj.dom = oimg;
              range.setStart(dom.parentNode,this.getNodeIndex(dom.parentNode.childNodes,dom)+1);
            }
          }else{
            // console.log("dom",offset,dom,dom.childNodes.length);
            let beforedom = dom.childNodes[offset-1];
            let afterdom = dom.childNodes[offset];
            // console.log("beforedom",beforedom)
            // console.log("afterdom",afterdom)

            if(dom.isSameNode(this.messageInput)){
              if(offset === 0 && dom.childNodes.length){
                //光标在dom的前面
                afterdom.before(oimg);
                range.setStart(dom, 1);
              }else if((offset === 0 && !dom.childNodes.length)||(offset == dom.childNodes.length)){
                dom.append(oimg);
                range.setStart(dom,dom.childNodes.length);
              }else{
                beforedom.after(oimg);
                range.setStart(dom,this.getNodeIndex(dom.childNodes,afterdom)-1);
              }
              this.currentObj.dom = oimg;
            }else{
              if(dom.innerHTML == "<br>"){
                dom.innerHTML = "";
                dom.appendChild(oimg);
                this.currentObj.dom = oimg;
                range.setStart(dom,1);
              }else{
                dom.after(oimg);
                this.currentObj.dom = oimg;
                range.setStart(dom.parentNode,this.getNodeIndex(dom.parentNode.childNodes,dom)+1);
              }
            }
          }
        }
        //使得选区(光标)开始与结束位置重叠
        range.collapse(true);
        //移除现有其他的选区
        sel.removeAllRanges();
        //加入光标的选区
        sel.addRange(range);
        this.emojivisible = false;
      },
      /*上传 file or img*/
      beforeFile(refname,file){
        let arr = ["EXE", "ZIP", "RAR", "JPG", "PNG", "GIF", "PDF", "SVG", "DOC", "DOCX", "XLS", "XLSX", "TXT", "PPT", "MP4", "AVI", "RMVB", "FLV"];
        let fileType;
        if (file.name.lastIndexOf(".") != -1){
          fileType = file.name.substr(file.name.lastIndexOf(".")+1);
          fileType = fileType.toLocaleUpperCase();
        };
        if(!fileType || arr.indexOf(fileType) == -1) {
          Util.openalert("该文件类型不支持！")
          return false;
        };
        let uuid = "file"+Date.now();
        this.fileUploadObj[uuid] = {
          uuid,
          uploadFile: true,
          uploadstate: 1,//1进度中 2 成功 3 失败
          percent:0,
          content:`<div class="file-info"><span class='flie-name'>${file.name}</span><span class='file-size'>${Util.getFileSize(file.size)}</span></div><span class="filetype-icon ${Dict.findFileType(fileType)||"undefined"}"></span>`,
          createtime:new Date(),
          state:false,
          iscustomer:false,
        };
        file.uuid = uuid;
        if(file.type.indexOf("image/") != -1){
          return;
        }
        if(file.size <= 500*1024*1024){
          this.$emit("uploadFile",this.fileUploadObj[uuid]);
        }else{
          Util.openalert("上传文件不能大于500MB");
          if(this.$refs[refname]){
            this.$refs[refname].clearFiles();
            this.$refs[refname].abort(file);
          }
          return false;
        }
      },
      successFile(refname,resp,file){
        // console.log("成功",file)
        if(file.raw.state){
          if(file.raw.screenshot){
            this.emojiClick(null,this.fileUrl+resp.object);
          }else{
            file.raw.dom.setAttribute("src",this.fileUrl+resp.object);
          }
          this.initUpload();
          this.fileState = true;
        }else{
          if(resp.code == 1){
            this.fileUploadObj[file.raw.uuid].uploadstate=2;
            let response = {
              ...resp,
              fileresult: {
                fileStr:"",
                type:""
              }
            };
            if(file.raw.type.indexOf("image/") != -1){
              response.fileresult.fileStr = `[image/img](${resp.object})`;
              response.fileresult.type="img";
            }else{
              response.fileresult.fileStr = `[file/${file.name}\\*\\${file.size}](${resp.object})`;
              response.fileresult.type="file";
            }
            this.$emit("uploadFile",this.fileUploadObj[file.raw.uuid],response,file);
            delete this.fileUploadObj[file.raw.uuid];
          }else{
            this.fileUploadObj[file.raw.uuid].uploadstate=3;
            Util.openalert('未知错误');
          }
        }
        if(this.$refs[refname]){
          this.$refs[refname].clearFiles();
        }
        // console.log("成功",arguments)
      },
      errorFile(refname,err,file){
        // console.log("失败",file.raw.uuid)
        this.fileUploadObj[file.raw.uuid].percent = 100;
        this.fileUploadObj[file.raw.uuid].uploadstate=3;
        delete this.fileUploadObj[file.raw.uuid];
        if(this.$refs[refname]){
          this.$refs[refname].clearFiles();
        }
        if(file.raw.state){
          this.initUpload();
        }
      },
      progressFile(refname,event, file){
        // console.log("上传时",file.raw.uuid)
        this.fileUploadObj[file.raw.uuid].percent = Math.floor(event.percent);
      },
      /*转人工*/
      forwardMan(e){
        if(this.disabled)return;
        this.$emit("forwardMan");
      },
      /*图标点击*/
      iconClick(e){
        let self = this;
        if(this.disabled)return;
        if (e === "emoji"){
          this.emojivisible = !this.emojivisible;
          return
        }
        this.$emit("iconClick",e)
      },
      /*获取 转换后的文本*/
      getConvertContent(){
        let out = true,index = 0;
        while (out){
          let i=0;
          out = false;
          for (let dom;dom = document.querySelectorAll("#message-input *")[i++];){
            if(this.isType(dom) == "[object HTMLImageElement]"){
              let imgStr = ""
              if(dom.className == 'emoji'){
                imgStr = `[image/emoji](${dom.src.split(location.origin)[1]})`;
              }else{
                imgStr = `[image/img](${dom.src.split(this.fileUrl)[1]||dom.src.split(this.fileUrl)[0]})`;
              }
              dom.outerHTML = imgStr;
              out = true;
              break;
            }
          }
        }
        let result = this.messageInput.innerHTML;
        this.messageInput.innerHTML = "";
        this.messageInput.focus();
        this.currentObj.dom = null;
        return result;
      },
      /*发送消息*/
      onSubmit(e){
        if(!this.fileState)return;
        function filtertrim(content){
          let result = content.split("&nbsp;").join("");
          result = result.split(" ").join("");
          result = result.split("<div>").join("");
          result = result.split("</div>").join("");
          result = result.split("<br>").join("");
          return result;
        }
        // this.emojivisible = false;
        let innerHTML = this.getConvertContent();
        if(this.disabled)return;
        if(!filtertrim(innerHTML))return;
        let result = {
          dom:this.messageInput,
          result:innerHTML
        };
        this.$emit("click",result);
      }
    }
  }
</script>
<style>
  #message-input p{
    margin: 0;
  }
</style>
<style scoped lang="scss">
  i.emoji{
    display: inline-block;
    width: 25px;
    height: 25px;
    margin: 2.5px;
    background-repeat: no-repeat !important;
    background-position: center !important;
    background-size: 80% !important;
  }
  .emoji-warp{
    i.emoji:hover{
      cursor: pointer;
      background-color: #eeeeee !important;
    }
  }
  .xie-message-input-warp{
    position: relative;
    width: 100%;
    height: 150px;
    padding: 10px 0px;
    .emoji-warp{
      position: absolute;
      bottom: 160px;
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      width: calc(100% - 20px);
      max-width: 400px;
      max-height: 200px;
      margin-left: 10px;
      padding: 10px;
      background: #ffffff;
      overflow-y: auto;
      border-radius: 5px;
    }
    #message-input{
      position: relative;
      width: 100%;
      height: calc(100% - 50px);
      padding: 10px;
      margin-bottom: 10px;
      border: #C6BDBD solid 1px;
      outline: unset;
      border-radius: 5px;
      overflow-y: auto;
      box-sizing: border-box;
      &:empty:before{
        content: '请输入...';
        color: #bbbbbb;
      }
      &:focus:before{
        content:none;
      }
      &,*{
        word-break:break-all;
      }
      &[disabled]{
        overflow: hidden;
        &:after{
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 5px;
          background: #999999;
          opacity: .05;
          cursor: not-allowed;
        }
      }
    }
    .tool-warp{
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 32px;
      .tool{
        display: flex;
        align-items: center;
        justify-content: flex-start;
      }
    }
  }

  /*全局样式 聊天框 输入框 图片表情 样式*/
  #messageWarp,#message-input{
    *{
      font-size: 14px;
      font-weight: 400;
    }
    .el-image-viewer__close{
      font-size: 40px;
    }
    [class*=" el-icon-"], [class^=el-icon-]{
      font-size: unset;
    }
    p{
      margin: unset;
    }
    img{
      max-width: calc(100% - 6px);
      margin: 0 3px;
      &[preview]{
        cursor: pointer;
      }
    }
    .download-warp{
      display: flex;
      .file-info{
        display: flex;
        flex-direction: column;
        width: 150px;
        .file-name{
          display: block;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2; //多行在这里修改数字即可
          overflow:hidden;
          -webkit-box-orient: vertical;
        }
        .file-size{
          margin-top: 10px;
          font-size: 12px;
        }
      }
      .filetype-icon{
        display: block;
        width: 35px;
        height: 35px;
        margin-left: 12px;
        background-image: url(/static/images/fileType/undefined.png);
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        &.word{background-image: url(/static/images/fileType/word.png)}
        &.excel{background-image: url(/static/images/fileType/excel.png)}
        &.txt{background-image: url(/static/images/fileType/txt.png)}
        &.ppt{background-image: url(/static/images/fileType/ppt.png)}
        &.pdf{background-image: url(/static/images/fileType/pdf.png)}
        &.music{background-image: url(/static/images/fileType/music.png)}
        &.video{background-image: url(/static/images/fileType/video.png)}
        &.package{background-image: url(/static/images/fileType/package.png)}
        &.undefined{background-image: url(/static/images/fileType/undefined.png)}
      }
    }
    a{
      display: block;
      width: 100%;
      text-align: right;
      margin-top: 5px;
      color: #588AFD;
      &[upload]{
        position: absolute;
        bottom: -20px;
        right: 8px;
        white-space: nowrap;
      }
    }
    .el-progress__text{color: #FFFFFF}
  }
</style>
