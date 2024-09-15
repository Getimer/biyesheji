import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd from "ant-design-vue"
// import 'ant-design-vue/dist/antd.css'
import '@/mock'
import VueQuillEditor from 'vue-quill-editor'

// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'


router.beforeEach((to) => {

    console.log(111, !store.state.user && to.name !== 'Login', store.state.user)
    if (Object.keys(store.state.user).length === 0 && to.name !== 'Login') {
        console.log(1111)
        // 将用户重定向到登录页面
        return { name: 'Login' }
    }
})
createApp(App).use(Antd).use(VueQuillEditor).use(store).use(router).mount('#app')
