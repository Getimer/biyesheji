<template>
  <div v-if="reloadPage" style="width: 100vw;height: 100vh;">
    <ReloadPage style="display: flex;justify-content: center;align-items: center;"></ReloadPage>
  </div>
  <div v-else class="content">
    <TopMenu @enterFullscreen="enterFullscreen" @exitFullscreen="exitFullscreen" @reload="reload"></TopMenu>
    <div class="main-content">
      <SideBar :url="'/admin/notice'"></SideBar>
      <div class="notice-form">
        <a-form ref="formRef" name="custom-validation" labelAlign="right" :model="formState" :rules="rules"
          v-bind="layout">

          <a-form-item label="接收人" name="target">
            <a-select v-model:value="formState.target" show-search placeholder="请选择一个接收人"
              style="width: 1016px;text-align: left;" :options="options1" :filter-option="filterOption"
              @change="selectChange"></a-select>
          </a-form-item>
          <a-form-item label="类型" name="type">
            <a-select v-model:value="formState.type" show-search placeholder="请选择一个类型"
              style="width: 1016px;text-align: left;" :options="options" :filter-option="filterOption"></a-select>
          </a-form-item>
          <a-form-item label="标题" name="title">
            <a-input style="width: 1016px;" v-model:value="formState.title" placeholder="请输入标题" type="text"
              autocomplete="off" />
          </a-form-item>
          <a-form-item label="内容" name="content">
            <a-textarea style="width: 1016px;" ref="textareaRef" placeholder="请输入内容" v-model:value="formState.content"
              allow-clear show-count />
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 14, offset: 5 }">
            <a-button type="primary" @click="onSubmit">发送</a-button>
            <a-button style="margin-left: 30px" @click="resetForm">重置</a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import SideBar from './components/SideBar.vue';
import TopMenu from './components/TopMenu.vue';
import { reactive, ref, toRaw, onBeforeMount, onBeforeUnmount, onMounted } from 'vue';
import type { UnwrapRef } from 'vue';
import type { Rule } from 'ant-design-vue/es/form';
import axios from 'axios';
import { message } from 'ant-design-vue';
import ReloadPage from '../../components/reloadPage.vue'
interface FormState {
  target: string | undefined;
  content: string | undefined;
  type: string | undefined;
  title: string | undefined;
  user: any;
}

const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 15 },
};

const textareaRef = ref<Element>();
// const temp=ref<any>()
// onMounted(()=>{
//   const resizeObserver = new ResizeObserver(() => {
//     // 处理尺寸变化的逻辑
//   });
//   temp.value=resizeObserver
//   if (textareaRef.value instanceof Element) {
//         resizeObserver.observe(textareaRef.value);
//       }
// })

// onBeforeUnmount(() => {
//   temp.value.disconnect();
// });

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



const options = ref<any>([
  { value: '提醒', label: '提醒' },
  { value: '公告', label: '公告' },
  { value: '通知', label: '通知' },
]);
const options1 = ref<any>([]);

const selectChange = (value, option) => {
  console.log('213', value, option)
  formState.user = option.userId
}
const filterOption = (input: string, option: any) => {
  return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};
const formRef = ref();

const formState: UnwrapRef<FormState> = reactive({
  user: '',
  target: undefined,
  content: '',
  type: undefined,
  title: ''
});
const rules: Record<string, Rule[]> = {
  target: [{ required: true, message: '请输入接收者', trigger: 'change' }],
  content: [{ required: true, message: '请输入内容', trigger: 'change' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'change' }],
};
const reloadPage = ref<boolean>()
onBeforeMount(async () => {
  try {
    reloadPage.value = true
    await axios.get('http://localhost:3000/showusers').then((res) => {
      console.log('res', res.data.users)
      for (let i = 0; i < res.data.users.length; i++) {
        if (res.data.users[i].role.identity === 0) {
          options1.value?.push({ value: res.data.users[i].username, userId: res.data.users[i]._id })
        }

      }

    }).finally(() => {
      reloadPage.value = false
    })
  } catch (error) {
    console.log(error)
    reloadPage.value = false
  }

})
const reload = async () => {
  try {
    reloadPage.value = true
    await axios.get('http://localhost:3000/showusers').then((res) => {
      for (let i = 0; i < res.data.users.length; i++) {
        options1.value?.push({ value: res.data.users[i].username, userId: res.data.users[i]._id })
      }

    }).finally(() => {
      reloadPage.value = false
    })
  } catch (error) {
    console.log('error', error)
  }
}
const onSubmit = () => {
  formRef.value
    .validate()
    .then(async () => {
      console.log('values', formState, toRaw(formState));
      await axios.post('http://localhost:3000/addglobalnotice', { notice: toRaw(formState) }).then((res) => {
        if (res) {
          message.loading('loading', 1.5).then(() => {
            message.success('发送成功', 1.0)
            formRef.value.resetFields()
          })
        }
      })
    })
    .catch(error => {
      console.log('error', error);
    });
};
const resetForm = () => {
  formRef.value.resetFields();
};
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

    >.notice-form {
      width: 87%;
      background-color: #fff;
      margin: 20px;
      padding-top: 100px;
      border-radius: 8px;
    }
  }
}
</style>