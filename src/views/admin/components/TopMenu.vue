<template>
  <div class="topmenu" style="position: relative;">
    <div class="logo">
      <img src="../../../assets/logo.png" />
    </div>

    <div class="user-info" >
      <RedoOutlined @click="reload" :style="{fontSize:'21px',marginRight:'3px'}"/>
      <FullscreenOutlined v-if="!isFullscreen" :style="{fontSize:'21px',marginRight:'3px'}" @click="enterFullscreen" />
      <FullscreenExitOutlined v-else :style="{fontSize:'21px',marginRight:'3px'}" @click="exitFullscreen" />
      <div class="avatar"><img v-if="store.state.user.avatar" :src="store.state.user.avatar" />
        <img v-else src="../../../assets/user-avatar-line.png" /><span>{{
          store.state.user.username
        }}</span>
      </div>
      <div class="user-btn" @click="logout"><img style="width: 35px;height: 35px;" src="../../../assets/Logout.png"></div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {ref, defineEmits } from 'vue'

import { useStore } from 'vuex';
import { message } from 'ant-design-vue';
import { FullscreenOutlined, FullscreenExitOutlined ,RedoOutlined} from '@ant-design/icons-vue'


// 使用 defineEmits 定义组件的事件
const emits = defineEmits(['enterFullscreen', 'exitFullscreen', 'reload']);
interface DataItem {
  title: string;
  content: string;
  tag: string
}
let isFullscreen = ref<boolean>(false)



const store = useStore()
const enterFullscreen = () => {
  emits('enterFullscreen')
  isFullscreen.value = true
}

const exitFullscreen = () => {
  emits('exitFullscreen')
  isFullscreen.value = false
}
const reload = () => {
  emits('reload')
}

const logout = () => {
  message.loading('loading', 1.0).then(() => {
    localStorage.removeItem('user')
    store.commit('logout')
  })

}

</script>
<style lang="scss" scoped>
:deep(.slick-slide) {
  text-align: center;
  background: transparent;
  height: 45px;
  line-height: 45px;
}

:deep(.slick-slide h3) {
  color: #fff;
}

.topmenu {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 6vh;
  background-color: white;
}

.logo {
  width: 197px;
  height: 100%;
  border-right: 1px solid #f6f6f6;

  >img {
    width: 120px;
    height: 70px;
  }
}

.user-info {
  width: 200px;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-right: 15px;

  >.user-btn {
    display: flex;
    justify-content: center;
    margin-right: 10px;
    align-items: center;
    cursor: pointer;
  }
}

.avatar {

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  >span {
    margin-left: 5px;
  }

  >img {
    width: 35px;
    height: 35px;
    border-radius: 50%;
  }
}
</style>