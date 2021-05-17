<template>
  <div class="message-warp" ref="messageWarp">
    <div class="message-item-moremsg">
      <el-button size="mini" v-if="havemsg" @click="moreClick">更多记录</el-button>
      <template v-else>没有更多了</template>
    </div>
    <template v-for="(item,index) in messageList">
      <div class="message-item-date" v-if="getDiffTime(messageList,index) > 120000">{{getTime(item.createtime)}}</div>
      <div class="message-item-tip" v-if="item.tip">
        <span v-html="item.text"></span>
      </div>
      <template v-else>
        <div class="message-item self" v-if="userType == item.usertype">
          <div class="message-content-warp">
            <template v-if="showRead">
                <span v-if="item.isread" class="state read">已读</span>
                <span v-else class="state">未读</span>
            </template>
            <div v-if="!item.uploadFile" class="message-content" v-html="getHTML(item.content)"></div>
            <div class="message-content" v-if="item.uploadFile">
              <div class="download-warp" v-html="item.content"></div>
              <el-progress color="#2FDF54" v-if="item.percent < 100" :percentage="item.percent"></el-progress>
              <a upload :style="{color: uploadstate[item.uploadstate].color}">{{uploadstate[item.uploadstate].text}}</a>
            </div>
          </div>
          <avatarIcon style="margin: 15px 15px 15px 0;" :icon="getavatar(item)"></avatarIcon>
        </div>
        <div class="message-item" v-else>
          <avatarIcon style="margin: 15px 0 15px 15px;" :icon="getavatar(item)"></avatarIcon>
          <div v-if="!item.rate && !item.uploadFile" class="message-content" v-html="getHTML(item.content)"></div>
        </div>
      </template>
    </template>
    <span v-if="notbottomMsgNum" @click="hintClick" class="hint">您有{{(notbottomMsgNum<99)?notbottomMsgNum:'99+'}}条新消息</span>
  </div>
</template>

<script>
  import avatarIcon from "./avatarIcon";
    export default {
      name: "chatMessage",
      components: {
        avatarIcon
      },
      props:{
        receiverObj: {},
        messageList: {
          type:Array,
          default: _=> []
        },
        userType:String,
        fileUrl:String,
        havemsg: { //是否可以点击 -- 消息窗口的分页
          type: Boolean,
          default:true
        },
        showRead: {
          type: Boolean,
          default:true
        },
      },
      data(){
        return{
          uploadstate: {
            1:{text:"上传进度",color:"#588AFD"},
            2:{text:"上传成功",color:"#17CB3D"},
            3:{text:"上传失败",color:"#EA4E30"},
          },
          waitNum:0,
          scrollTop:0,
          scrollHeight:0,
          notbottomMsgNum:0,
        }
      },
      watch:{
        receiverObj(n,o){
          this.warptoBottom();
        },
      },
      mounted() {
        this.$refs.messageWarp.onscroll= Util.throttleFactory(() => {
          if(this.$refs.messageWarp.scrollTop+this.$refs.messageWarp.clientHeight>=this.$refs.messageWarp.scrollHeight-70){
            this.notbottomMsgNum=0;
          };
        },200);
      },
      methods:{
        /*
        * 获取转换后的文本
        * 图片 [image/img](url)
        * 表情 [image/emoji](url)
        * 文件 [file/{fileName}\*\{fileSize}](url)
        * return {tip:"",html}
        * */
        getFormattedText(content,tip = false){
          let out = true;
          while(out){
            out=false;
            let pendingText = content.match(/\[\w{4,5}([^\]]*)\]\(([^\)]*)\)/);
            if(pendingText){
              pendingText = pendingText[0]; // 待处理文本
              out=true;
              let type = pendingText.match(/\S{1}([^\/]{4,5})/);
              type=type?type[1]:type;
              let subname = pendingText.match(/\/([^\]]*)/);
              subname = subname?subname[1]:subname; //img | emoji | fileName
              let src = pendingText.match(/\]\([^\)]*/);
              src = src?src[0].substr(2):src; //img | emoji | fileName
              if(type == "image"){
                if(subname == "img"){ //这是图片的
                  var oimg = new Image();
                  var imgurl = this.fileUrl+src;
                  if(src.indexOf("http") != -1){
                    imgurl = src;
                  }
                  oimg.src = imgurl;
                  oimg.onload = () => {this.warptoBottom()};
                  content = this.insertHTML(content,{pendingText,type:"img",subname,src:imgurl},tip);
                }else{// 这是表情的
                  content = this.insertHTML(content,{pendingText,type:"emoji",subname,src},tip);
                }
              }else if(type == "file"){ //这是文件的 //error 截取第一个[]();
                let Text = content.match(/\[([^\)]*)\)/);
                let fileData = subname.split("\\*\\");
                subname = fileData[0];
                let fileType,fileSize = Util.getFileSize(fileData[1]||0);
                if (subname.lastIndexOf(".") != -1){
                  fileType = subname.substr(subname.lastIndexOf(".")+1);
                }
                content = this.insertHTML(content,{pendingText:content,type:"file",fileType:Dict.findFileType(fileType),subname,fileSize,src},tip);
              }
            }
          }
          return content;
        },
        insertHTML(content,obj,tip){
          let htmlObj = {
            "img":`<img preview style="width: 200px;" src="${obj.src}" />`,
            "emoji":`<img src="${obj.src}" class="emoji" />`,
            "file":`<div class="download-warp">
                      <div class="file-info">
                        <span class="file-name">${obj.subname}</span>
                        <span class="file-size">${obj.fileSize}</span>
                      </div>
                      <span class="filetype-icon ${obj.fileType||'undefined'}"></span>
                    </div>
                    <a upload target="_blank" href="${this.fileUrl+obj.src}" download="${obj.subname}">下载</a>`
          };
          let tipObj = {
            "img":"[图片]",
            "emoji":"[表情]",
            "file":"[文件]"
          };
          let resultObj = tip?tipObj:htmlObj;
          let otherText = content.split(obj.pendingText);
          for (let i = 0; i < otherText.length; i++) {
            if(i != 0){
              otherText[i] = resultObj[obj.type]+otherText[i];
            }
          };
          return otherText.join("");
        },
        getHTML(content){
          let html = this.getFormattedText(content);
          let resultStart = `<div class="message-content">`,resultEnd = "</div>"
          this.addElementNodeClick("img[preview]",function () {
            Util.openpreview(this.src);
          })
          return html;
          // return resultStart+html+resultEnd;
        },
        //给dom元素添加点击事件
        addElementNodeClick(tagName,clickfn){
          this.$nextTick().then(()=> {
            for(var i =0,dom; dom = document.querySelectorAll(tagName)[i++];){
              if(!dom.onclick)dom.onclick=clickfn;
            }
          })
        },
        hintClick(){
          this.warptoBottom();
          this.notbottomMsgNum=0;
        },
        getavatar({usertype,avatar}){
          let isSelf = usertype == "user",isUser = this.userType == 'user';
          if(isUser){
            return isSelf?'client':(avatar||'main');
          }else{
            return isSelf?(avatar||'main'):'client';
          }
        },
        moreClick(e){
          this.$emit("moreClick");
        },
        /**
         *
         * @param fn 新增消息事件
         * @param moreState 是否为更多消息
         */
        addMessage(fn,moreState){
          let msgobj = fn();
          let isSelf = !!this.userType == !!msgobj.usertype,
            notbottom = this.scrollTop > this.$refs.messageWarp.scrollTop; // 当前窗口是否不在最底部
          if(moreState){//更多
            if(!this.scrollHeight) this.scrollHeight = this.$refs.messageWarp.scrollHeight; //第一次发消息 将保存消息之前的高度进行保存 之后用于累加计算
            this.warptoStop(this.scrollHeight); //累加
          }else{//发消息
            if(isSelf){ //自己发的消息
              this.warptoBottom();
            }else {//其他人发的消息
              if(notbottom&&!msgobj.tip){//不在最底部
                this.notbottomMsgNum++;
              }else{//在最底部
                this.warptoBottom();
              }
            }
          }
        },
        warptoBottom(){
          this.$nextTick().then(()=>{
            this.$refs.messageWarp.scrollTop = this.$refs.messageWarp.scrollHeight;
            this.scrollTop = this.$refs.messageWarp.scrollTop;
          })
        },
        warptoStop(beforeHeight){
          this.$nextTick().then(()=>{
            this.$refs.messageWarp.scrollTop = (this.$refs.messageWarp.scrollHeight - beforeHeight);
          })
        },
        getDiffTime(list,index){
          var time = list[index];
          var pro = list[index-1];
          if(pro){
            return time.createtime - pro.createtime
          }
          return time.createtime;
        },
        getTime(time){
          let date = new Date(time);
          return date.toLocaleDateString()+" "+date.toTimeString().split(' ')[0];
        },
      },
    }
</script>

<style scoped lang="scss">
  .message-warp{
    position: relative;
    width: 100%;
    height: calc(100% - 150px);
    padding: 20px;
    background: #EDEFF5;
    overflow: auto;
    box-sizing: border-box;
    .hint{
      position: sticky;
      bottom: -15px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      align-items:center;
      width: 140px;
      height: 36px;
      background: #FFFFFF;
      border-radius: 18px;
      margin: auto;
      font-size: 14px;
      color: #588AFD;
      box-shadow: 0px 0px 5px 0px rgba(48, 48, 48, 0.2);
      cursor: pointer;
      &::before{
        content: " ";
        display: inline-block;
        width: 11px;
        height: 13px;
        margin-right: 5px;
        background: url("/static/images/imgIcon/down.png")no-repeat center/cover;
      }
    }
    .message-item-moremsg{
      width: 100%;
      text-align: center;
      color: #999999;
      font-size: 12px;
      .el-button{
        background:initial;
        border-color: #409eff;
        color: #409eff;
        &:hover{
          color: #fff;
          background-color: #409eff;
          border-color: #409eff;
        }
      }
    }
    .message-item-date{
      width: 100%;
      font-size: 13px;
      color: #C6BDBD;
      text-align: center;
    }
    .message-item-tip{
      width: calc(100% - 24px);
      text-align: center;
      margin: 12px;
      span{
        display: inline-block;
        background: rgba(222,222,222,0.8);
        padding: 5px 20px;
        border-radius: 17px;
        font-size: 13px;
        color: #777777;
        text-align: center;
        user-select: none;
      }
    }
    .message-item{
      display: flex;
      align-items: flex-start;
      width: 100%;
      .message-content{
        /*display: flex;*/
        /*flex-wrap: wrap;*/
        position: relative;
        max-width: calc(90% - 100px);
        padding: 12px;
        margin: 12px 12px 20px 12px;
        background: #FFFFFF;
        font-size: 14px;
        font-family: Source Han Sans CN;
        color: #8C8C8C;
        border-radius: 6px;
        word-break:break-all;
        .rate{
          width: 300px;
          .title{
            color: #666666;
            margin-bottom: 10px;
          }
          .rate-warp{
            display: flex;
            height: 70px;
          }
        }
        &.file{

        }
        &::before {
          content: "";
          position: absolute;
          left: 0;
          display: inline-block;
          border: 5px solid rgba(0, 0, 0, 0);
          margin-top: 4.5px;
          margin-left: -10px;
          border-right-color: #FFFFFF;
        }
      }
      &.self{
        justify-content: flex-end;
        .message-content-warp{
          display: flex;
          align-items: center;
          justify-content: flex-end;
          width: 100%;
        }
        .message-content{
          background: #C9E7FF;
          color: #000000;
          background: #588AFD;
          color: #FFFFFF;
          &::before{
            left: unset;
            right: 0;
            border-right-color: rgba(0, 0, 0, 0);
            border-left-color: #588AFD;
            margin-right: -10px;
          }
        }
        .state{
          font-size: 13px;
          color: #FB7A6C;
          &.read{
            color: #C6BDBD;
          }
        }
      }
    }
  }
</style>
