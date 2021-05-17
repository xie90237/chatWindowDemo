<template>
  <section class="message-warp-g">
    <div class="message-warp">
      <chatMessage :havemsg="havemsg"
                   @moreClick="moreClick"
                   :fileUrl="fileUrl"
                   ref="chatMessage"
                   :messageList="messageList"
                   :userType="userType"></chatMessage>
      <div class="message-input-warp">
        <messageInput
          @getDom="(dom) => InputDom = dom"
          @click="onsubmit"
          @uploadFile="uploadFile"
          :fileUrl="fileUrl"
          :uploadUrl="uploadUrl"
          :isnotsend="false">
        </messageInput>
      </div>
    </div>
  </section>
</template>

<script>
  import messageInput from "@/components/messageInput";
  import chatMessage from "@/components/chatMessage"
    export default {
      name: "Index",
      components:{
        messageInput,
        chatMessage,
      },
      data(){
        return {
          fileUrl:"",//ftp文件地址
          userType:"user",//自己的身份
          InputDom:null,
          messageList:[],
          uploadUrl:"localhost:8080/uploadFile",//后端地址
          havemsg:true,//是否显示更多记录按钮

        }
      },
      mounted() {
          setTimeout(()=>{
            for (let i = 0;i<20;i++){
              this.addMessage(this.getMessageObj(i+Dict.getUserId(),Boolean(Math.round(Math.random()))?"user":""));
            }
          },2000)
      },
      methods:{
        addMessage(messageObj,moreState = false){
          this.$refs.chatMessage.addMessage(()=> {
            this.messageList.push(messageObj);
            return messageObj;
          },moreState)
        },
        onsubmit({dom,result}){
          this.addMessage(this.getMessageObj(result));
          console.log(dom,result);
        },
        uploadFile(obj,resp,file){
          if(resp){//上传成功
            let objIndex = this.messageList.findIndex(item => item === obj);
            if(objIndex != -1){
              this.messageList.splice(objIndex,1)
            }
          }else{//开始上传
            obj.usertype = "user";
            this.addMessage(obj);
          }
        },
        moreClick(){
          console.log("点击查看更多记录")
        },
        getMessageObj(content="发送失败",userType='user'){
          return {
            usertype:userType, // 消息的身份  当其等于 this.userType 就代表这条消息是我发的 在右边
            content, // 消息内容
            avatar:"", // 头像默认为空
            isread:true,
            createtime:new Date()
          }
        },
      }
    }
</script>

<style scoped>
  .message-warp-g{
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
  }
  .message-warp{
    width: 500px;
    height: 600px;
  }
  .message-input-warp{
    width: 500px;
  }
</style>
