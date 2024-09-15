<template>
  <div class="topmenu" style="position: relative;">
    <div class="logo">
      <img src="../assets/logo.png" />
    </div>
    <div style="position:absolute;width: 60%;height: 80%;margin-left: 20%;">
      <a-carousel autoplay :dots="false" effect="fade">
        <div v-for="(item, index) in noticeData" :key="index">

          <h2 style="display: flex;flex-direction: row;justify-content: center;align-items: center;">
            <a-tag
              :color="(item.title.includes('归还') || item.title.includes('借阅')) ? 'green' : (item.tag === '通知' ? 'red' : item.tag === '公告' ? 'blue' : 'warning')">{{
        item.tag }}</a-tag>{{ item.content.length > 50 ?
        item.content.slice(0, 30) + '...' : item.content }}
          </h2>
        </div>
      </a-carousel>
    </div>
    <div class="user-info">
      <RedoOutlined @click="reload" :style="{ fontSize: '21px', marginRight: '3px' }" />
      <FullscreenOutlined v-if="!isFullscreen" :style="{ fontSize: '21px', marginRight: '3px' }"
        @click="enterFullscreen" />
      <FullscreenExitOutlined v-else :style="{ fontSize: '21px', marginRight: '3px' }" @click="exitFullscreen" />
      <div class="avatar"><img v-if="store.state.user.avatar" :src="store.state.user.avatar" />
        <img v-else src="../assets/user-avatar-line.png" /><span>{{
        store.state.user.username
      }}</span>
      </div>
      <div class="user-btn" @click="logout"><img style="width: 35px;height: 35px;" src="../assets/Logout.png"></div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue'
import axios from 'axios'
import { useStore } from 'vuex';
import { message } from 'ant-design-vue';
import { FullscreenOutlined, FullscreenExitOutlined, RedoOutlined } from '@ant-design/icons-vue'
interface DataItem {
  title: string;
  content: string;
  tag: string
}
const emits = defineEmits(['enterFullscreen', 'exitFullscreen', 'reload']);
let isFullscreen = ref<boolean>(false)
let noticeData = ref<DataItem[]>([

]);
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


const store = useStore()
const fetchNotices = async () => {
  const { data } = await axios.get('http://localhost:3000/shownotices?userId=' + store.state.user._id);
  const filteredNotices = data.notices.filter(notice => notice.status === 0);
  noticeData.value = filteredNotices;
};
onBeforeMount(async () => {
  await fetchNotices(); // 初始加载数据

  // 每 30 秒自动刷新数据
  const refreshInterval = 30000; // 30 秒
  setInterval(async () => {
    await fetchNotices();
  }, refreshInterval);
});






const logout = () => {
  message.loading('loading', 1.0).then(() => {
    localStorage.removeItem('user')
    store.commit('logout')
    store.commit('setLoginStatus', false)
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
  ;
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