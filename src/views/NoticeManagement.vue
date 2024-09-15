<template>
  <div v-if="reloadPage" style="width: 100vw;height: 100vh;">
    <ReloadPage style="display: flex;justify-content: center;align-items: center;"></ReloadPage>
  </div>
  <div v-else class="content">
    <TopMenu @enterFullscreen="enterFullscreen" @exitFullscreen="exitFullscreen" @reload="reload"></TopMenu>
    <div class="main-content">
      <SideBar :url="'/notice'"></SideBar>
      <div class="notice-list">
        <div class="demo-infinite-container" :infinite-scroll-distance="5" :infinite-scroll-disabled="false">
          <a-list  :grid="{ gutter: 10, column: 1 }" :data-source="noticeData" :loading="loading">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-card>
                  <template #title>
                    <a-tag
                      :color="(item.title.includes('归还') || item.title.includes('借阅')) ? 'green' : (item.tag === '通知' ? 'red' : item.tag === '公告' ? 'blue' : 'warning')">{{
                        item.tag }}</a-tag>
                    {{ item.title }}
                    <div style="position: absolute;right: 4px;top: 2px;font-weight: 200;font-size: 13px;">
                      
                      <CheckCircleOutlined v-show="item.status===1" style="color: green;font-size: 20px;" />
                      <ClockCircleOutlined v-show="item.status===0" style="color: orange;font-size: 20px;" @click="confirmMessage(item._id)"/></div>
                    <div style="position: absolute;right: 4px;bottom: 2px;font-weight: 200;font-size: 13px;">
                      发布于：{{ dayjs(item.createdAt).format('YYYY-MM-DD hh:mm:ss') }}
                    </div>
                  </template>
                  {{ item.content }}
                </a-card>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </div>
    </div>
    <a-float-button-group trigger="hover" type="primary" :style="{ right: '820px', bottom: '30px' }">
            <template #icon>
                <UnorderedListOutlined />
            </template>
            <a-float-button @click="refresh">
                <template #icon>
                    <RedoOutlined />
                </template>
            </a-float-button>
        </a-float-button-group>
  </div>
</template>
<script lang="ts" setup>
import SideBar from '../components/SideBar.vue';
import TopMenu from '../components/TopMenu.vue';
import { onBeforeMount, ref } from 'vue'
import dayjs from 'dayjs'
import axios from 'axios'
import { useStore } from 'vuex';
import ReloadPage from '../components/reloadPage.vue'
import { UnorderedListOutlined, CheckCircleOutlined,RedoOutlined,ClockCircleOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';


const store=useStore()
interface DataItem {
  title: string;
  content: string;
  tag: string
}
const confirmMessage=async(noticeId:string)=>{
  console.log('qqqq')
  await axios.post('http://localhost:3000/editnotice',{noticeId,status:1}).then((res)=>{
    if(res.status===200){
      message.loading('loading',1.0).then(()=>{
        message.success('已确认',1.5)
        refresh()
      })
    }
  }).catch((err)=>{
    console.error('err',err)
  })

}



const enterFullscreen = () => {
  const element = document.documentElement; // 全屏元素，这里使用整个文档根元素
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) { // Firefox
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) { // Chrome, Safari and Opera
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) { // IE/Edge
    element.msRequestFullscreen();
  }

}

const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) { // Firefox
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { // IE/Edge
    document.msExitFullscreen();
  }

}
const reloadPage = ref<boolean>(false)
const reload = async () => {
  try {
    reloadPage.value = true
    await axios.get('http://localhost:3000/shownotices?userId='+store.state.user._id).then((res) => {
      if (res) {
        noticeData.value = res.data.notices
      }
    }).finally(() => {
      reloadPage.value = false
    })

  } catch (error) {
    console.log(error)
  }
}
let noticeData = ref<DataItem[]>([

]);
const loading = ref<boolean>(true)
onBeforeMount(async () => {
  console.log('init',store.state.user)
  loading.value=false
  reloadPage.value = true
  await axios.get('http://localhost:3000/shownotices?userId='+store.state.user._id).then((res) => {
      if (res) {
        noticeData.value = res.data.notices
      }
    }).finally(() => {
      reloadPage.value = false
    })
})
const refresh = () => {
  try {
    loading.value = true
    setTimeout(async() => {
      const { data } = await axios.get('http://localhost:3000/shownotices?userId='+store.state.user._id)
      noticeData.value = data.notices
      loading.value = false
    },1000)

  } catch (error) {
    console.log(error)
  }
}
</script>
<style lang="scss" scoped>
.demo-infinite-container {
  // border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: auto;
  padding: 8px 24px;
  height: 89vh;
}

.content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #f0f2f5;

  >.main-content {
    display: flex;
    flex-direction: row;

    >.notice-list {
      width: 87%;
      background-color: #f8f8f8;
      margin: 20px;
    }
  }
}
</style>