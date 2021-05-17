<template>
  <div @click="handleClick" :disabled="disabled"
       :class="`xie-icon-button ${notHover?'notHover':''}`"
       :style="getStyle()"></div>
</template>

<script>
  export default {
    name: "iconButton",
    props: {
      icon: String,//emoji  file  image,
      image: "",
      notHover: false,
      disabled:Boolean,
    },
    methods: {
      getStyle(){
        let result = {};
        if(this.icon)result.background = "url('/static/images/buttonIcon/"+this.icon+".png')";
        if(this.image)result.background = 'url('+this.image+')';
        return result
      },
      handleClick(evt) {
        if(this.disabled)return;
        this.$emit('click', evt);
      }
    }
  }
</script>

<style scoped lang="scss">
  .xie-icon-button {
    display: inline-block;
    width: 25px;
    height: 25px;
    background: #8C8C8C;
    background-size: cover !important;
    background-position: center center !important;
    background-repeat: no-repeat !important;
    cursor: pointer;
    opacity: .7;
    transition: all linear 100ms;
    &[disabled]{
      opacity: .9;
      cursor: not-allowed;
      &:hover{
        opacity: .9;
      }
    }
    &.notHover {
      opacity: 1;
    }

    & + .xie-icon-button {
      margin-left: 20px;
    }

    &:hover {
      opacity: 1;
    }
  }

</style>
