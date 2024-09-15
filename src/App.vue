<template>
  <div class="content">
    <div class="maincontainer">
      <a-config-provider :locale="locale">
      <router-view class="routerview" />
    </a-config-provider>
    </div>
  </div>
</template>
<script lang="ts" setup>
import locale from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('en')
import { useStore } from 'vuex';
import { onBeforeMount } from 'vue'
const store=useStore()



onBeforeMount(() => {
  //在页面加载时读取sessionStorage里的状态信息
  if (sessionStorage.getItem('store')) {
    store.replaceState(Object.assign({}, store.state, JSON.parse(sessionStorage.getItem('store') as string)));
  }

  //在页面刷新时将vuex里的信息保存到sessionStorage里
  window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('store', JSON.stringify(store.state));
  });
})



</script>
<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  width: 100%;
  height: 100vh;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #f8f8f8;
}

a {
  text-decoration: none;
}

.content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.maincontainer {
  display: flex;
  flex-direction: row;
}

.routerview {
  width: 80%;
  height: 94vh;
 
}
</style>
