<template>
  <div :busy="busy" :online="online" :class="`xie-avatar ${state?'state':''}`"
       :style="getStyle()"></div>
</template>

<script>
    export default {
      name: "avatarIcon",
      props:{
        icon:String,//main  client  customer
        image:String,
        online: {
          type:Boolean,
          default:true
        },
        busy: {
          type:Boolean,
          default:false
        },
        state: {
          type:Boolean,
          default:false
        }
      },
      methods:{
        getStyle(){
          let result = {};
          if(this.icon)result.background = "url('/static/images/avatar/"+this.icon+".png')";
          if(this.image)result.background = 'url('+this.image+')';
          return result
        },
        handleClick(evt) {
          this.$emit('click', evt);
        }
      }
    }
</script>

<style scoped lang="scss">
  .xie-avatar{
    position: relative;
    width: 37px;
    height: 37px;
    margin-right: 15px;
    border-radius: 50%;
    background: #000;
    background-size: cover !important;
    background-position: center center !important;
    background-repeat: no-repeat !important;
    filter: grayscale(100%);
    &.state::after{
      content: "";
      position: absolute;
      right: 0;
      bottom: 0;
      display: inline-block;
      width: 9px;
      height: 9px;
      background: #b7b7b7;
      border-radius: 50%;
    }
    &[online]{
      &::after{
        background: #34C464;
      }
      &[busy]{
        &::after{
          background: #EA944F;
        }
      }
      filter: unset;
    }
  }
</style>
