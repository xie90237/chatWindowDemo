# chatWindowDemo

> 描述：这是一个聊天窗的dome
>
> 基本上是纯原生的，但是因为是原本在项目中写的，所以稍微借用了一下 elementUI的文件上传功能
>
> 主要大区域包括：聊天窗口，消息编辑框，
>
> 主要功能包括：消息，表情，实时监听 截图粘贴/图片粘贴 上传服务器，回显图片地址，发送文件（显示进度条），支持ctrl+enter换行，enter发送等功能

## 聊天窗口

主要功能是将消息进行展示

每一个消息体的对象是这样的

```javascript
{
   // 消息体的身份  
   // 当其等于 this.userType 就代表这条消息是自己发的 在右边
   usertype:userType, 
   content, // 消息内容
   avatar:"", // 头像默认为空
   isread:true,
   createtime:new Date()
}
```

