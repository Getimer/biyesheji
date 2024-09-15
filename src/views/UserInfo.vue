<template>
  <div v-show="reloadPage" style="width: 100vw;height: 100vh;position: absolute;z-index: 9999;">
    <ReloadPage style="display: flex;justify-content: center;align-items: center;"></ReloadPage>
  </div>
  <div class="content">
    <TopMenu @enterFullscreen="enterFullscreen" @exitFullscreen="exitFullscreen" @reload="reload"></TopMenu>
    <div class="main-content">
      <SideBar :url="'/user'"></SideBar>
      <div class="userinfo">
        <div class="user-wrapper">
          <div class="avatar">
            <img v-if="store.state.user.avatar" :src="store.state.user.avatar" />
            <img v-else src="../assets/user-avatar-line.png" />

          </div>
          <div class="userinfocard">
            <a-descriptions :contentStyle="{ fontSize: '28px' }"
              :labelStyle="{ fontSize: '28px', marginLeft: '-100px' }">
              <template #extra>
                <a-button type="primary" @click="setModalVisible(true)">完善信息</a-button>
              </template>
              <a-descriptions-item label="昵称">{{ store.state.user.username || '未完善' }}</a-descriptions-item>
              <a-descriptions-item label="性别">{{ store.state.user.sex || '未完善' }}</a-descriptions-item>
              <a-descriptions-item label="年龄">{{ store.state.user.age || '未完善' }}</a-descriptions-item>
              <a-descriptions-item label="职业" :labelStyle="{ marginTop: '40px' }"
                :contentStyle="{ marginTop: '40px' }">{{
    store.state.user.profession || '未完善' }}</a-descriptions-item>
              <a-descriptions-item label="联系方式" :labelStyle="{ marginTop: '40px' }"
                :contentStyle="{ marginTop: '40px' }">{{
    store.state.user.phone || '未完善' }}</a-descriptions-item>
              <a-descriptions-item label="邮箱" :labelStyle="{ marginTop: '40px' }"
                :contentStyle="{ marginTop: '40px' }">{{
    store.state.user.email || '未完善' }}</a-descriptions-item>
            </a-descriptions>
          </div>
        </div>
        <a-modal :open="modalVisible" title="完善个人信息" style="top: 20px" centered @cancel="cancelModal">


          <a-form ref="formRef" name="custom-validation" :model="formState" :rules="rules" v-bind="layout"
            @validate="handleValidate" @finishFailed="handleFinishFailed">
            <a-form-item has-feedback label="头像" name="avatar">
              <div class="clearfix">
                <a-upload v-model:file-list="formState.avatar" :before-upload="beforeUpload" list-type="picture-card"
                  @change="uploadChange" @preview="handlePreview" action="http://localhost:3000/logins">
                  <div v-if="formState.avatar.length < 1">
                    <plus-outlined />
                    <div style="margin-top: 8px">Upload</div>
                  </div>
                </a-upload>
                <a-modal :open="previewVisible" :title="previewTitle" :footer="null" @cancel="handleCancel">
                  <img alt="example" style="width: 100%" :src="previewImage" />
                </a-modal>
              </div>
            </a-form-item>
            <a-form-item has-feedback label="昵称" name="username" required>
              <a-input v-model:value="formState.username" type="text" autocomplete="off" />
            </a-form-item>
            <a-form-item has-feedback label="性别" name="sex">
              <a-radio-group v-model:value="formState.sex">
                <a-radio :value="'男'">男</a-radio>
                <a-radio :value="'女'">女</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item has-feedback label="年龄" name="age">
              <a-input-number v-model:value="formState.age" autocomplete="off" />
            </a-form-item>
            <a-form-item has-feedback label="职业" name="profession">
              <a-select v-model:value="formState.profession" show-search placeholder="选择一个职业" style="width: 200px"
                :options="options" :filter-option="filterOption"></a-select>
            </a-form-item>
            <a-form-item has-feedback label="联系方式" name="phone">
              <a-input v-model:value="formState.phone" type="text" autocomplete="off" />
            </a-form-item>
            <a-form-item has-feedback label="邮箱" name="email">
              <a-input v-model:value="formState.email" type="text" autocomplete="off" />
            </a-form-item>
          </a-form>

          <template #footer>
            <a-button @click="cancelModal">取消</a-button>
            <a-button type="primary" @click="updateUser">保存</a-button>
          </template>

        </a-modal>
        <div class="middle-content">
          <div class="bookmessage" ref="bookmessage">

          </div>
          <div class="message">
            <a-timeline style="margin-left: 20%;margin-top:15px" pending="Recording...">
              <a-timeline-item v-for="(event, index) in eventList" :key="index"
                :color="event.status === 3 ? 'blue' : event.status === 1 ? 'green' : 'red'">{{ event.status }}|{{
    event.status === 3 ? `${dayjs(event.createdAt.replace('Z', '+08:00')).format('YYYY-MM-DD')} 借阅了图书
                《${event.book.bookname}》` : event.status === 1 ? `${event.realBackTime ?
      dayjs(event.realBackTime.replace('Z', '+08:00')).format('YYYY-MM-DD') : dayjs(event.backAt.replace('Z',
        '+08:00')).format('YYYY-MM-DD')}
                归还了图书 《${event.book.bookname}》` : `${dayjs(event.backAt.replace('+00:00',
          '+08:00')).format('YYYY-MM-DD')}
                图书
                《${event.book.bookname}》逾期` }}</a-timeline-item>



            </a-timeline>
          </div>
        </div>

        <div class="countmessage" ref="countmessage">

        </div>

      </div>


    </div>
  </div>
</template>

<script lang="ts" setup>
import SideBar from '../components/SideBar.vue';
import TopMenu from '../components/TopMenu.vue';
import type { SelectProps } from 'ant-design-vue';
import { useStore } from 'vuex';
import { ref, onMounted, onBeforeUnmount } from 'vue';
import type { Rule } from 'ant-design-vue/es/form';
import type { FormInstance } from 'ant-design-vue';
import type { UploadProps } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import { message } from 'ant-design-vue';
// import axios from 'axios';
const axios = require('axios')
import ReloadPage from '../components/reloadPage.vue'
import * as echarts from 'echarts/core';
import { TooltipComponent, LegendComponent, GridComponent, TitleComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';

echarts.use([
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer,
  LabelLayout,
  UniversalTransition,
  LineChart,
  GridComponent,
  TitleComponent
]);
const bookmessage = ref()
const countmessage = ref()

interface FormState {
  avatar: UploadProps['fileList'] | undefined
  username: string;
  sex: string;
  age: number | undefined;
  profession: string;
  phone: string;
  email: string;
}
const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');

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
    setTimeout(() => {
      reloadPage.value = false

    }, 1500)



  } catch (error) {
    console.log(error)
  }
}




const options = ref<SelectProps['options']>([
  { value: '学生', label: '学生' },
  { value: '老师', label: '老师' },
  { value: '其他', label: '其他' },
]);
const store = useStore()
const formRef = ref<FormInstance>();
const formState = ref<FormState>({
  avatar: [],
  username: '',
  sex: '男',
  age: undefined,
  profession: '无',
  phone: '',
  email: ''
});

const eventList = ref()
let myChart1: any = null
let myChart2: any = null

onMounted(async () => {

  reloadPage.value = true
  myChart1 = echarts.init(bookmessage.value);
  myChart2 = echarts.init(countmessage.value);
  let timeArray: string[] = []
  let dataArray: number[] = []
  let dataValue = [
    { value: 0, name: '已借阅', itemStyle: { color: '#00FF00' } },
    { value: 0, name: '已归还', itemStyle: { color: '#1E90FF' } },
    { value: 0, name: '已逾期', itemStyle: { color: '#FF0000' } }
  ]
  const currentDate = dayjs();
  for (let i = 15; i >= 1; i--) {
    timeArray.push(currentDate.subtract(i, 'day').format('YYYY-MM-DD'))
  }
  timeArray.push(currentDate.format('YYYY-MM-DD'))
  let data: any
  try {
    data = (await axios.get('http://localhost:3000/showborrowlist?userId=' + store.state.user._id)).data
    eventList.value = data.records
    eventList.value.sort((a: any, b: any) => {
      return b.createdAt > a.createdAt ? -1 : 1
    })

  } catch (error) {
    const errors: any = error
    message.error(errors, 1.0)
  }




  for (let i = 0; i <= 15; i++) {
    let tempArray = data.records.filter((item: any) => {
      return dayjs(item.createdAt).format('YYYY-MM-DD') === timeArray[i]
    })
    dataArray.push(tempArray.length)
  }

  for (let i = 0; i < data.records.length; i++) {
    if (data.records[i].status === 3) {
      dataValue[0].value += 1
    } else if (data.records[i].status === 1) {
      dataValue[1].value += 1
    } else if (data.records[i].status === 2) {
      dataValue[2].value += 1
    }
  }
  let option1 = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: '5%',
      left: 'center'
    },
    series: [
      {
        name: '',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,

        colorStops: ['#9a60b4', '#ea7ccc'],
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 40,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: dataValue
      }
    ]
  }
  let option2 = {
    title: {
      text: '15天之内借阅情况',
      left: 'center',
      top: '8%'
    },
    tooltip: {
      trigger: 'item'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timeArray
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: dataArray,
        symbol: 'circle',
        symbolSize: 8,
        type: 'line',
        areaStyle: {}
      }
    ]

  }


  setTimeout(() => {
    reloadPage.value = false
    option1 && myChart1.setOption(option1);
    option2 && myChart2.setOption(option2);
  }, 1500)




})

onBeforeUnmount(() => {
  if (myChart1 && myChart2) {
    myChart1.dispose(); // 手动销毁 ECharts 实例
    myChart2.dispose()
  }
})
const modalVisible = ref<boolean>(false);
const filterOption = (input: string, option: any) => {
  return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

const updateUser = async () => {
  const values: any = { ...formState.value }

  if (values.phone === '' || values.email === '' || values.age === undefined || values.sex === '' || values.username === '' || values.profession === '') {
    message.error('检查所填信息是否有误', 1.0)
    return
  }
  try {
    const user = {
      _id: store.state.user._id,
      avatar: values.avatar.length !== 0 ? await getBase64(values.avatar[0].originFileObj) : store.state.user.avatar,
      username: values.username,
      sex: values.sex,
      age: values.age,
      profession: values.profession,
      phone: values.phone,
      email: values.email,

    }
    const { data } = await axios.post('http://localhost:3000/updateusernormal', { user })
    message.loading('loading', 1.5).then(() => {
      message.success('编辑成功', 1.0)
      store.commit('setUser', data.user)
    })

    console.log('data', data)
    setModalVisible(false)
  } catch (error) {
    console.log('err', error)
  }



};



function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}



const beforeUploadResult = ref(false)
const uploadChange = (info: UploadChangeParam) => {
  console.log('INFO', info, beforeUploadResult)
  if (beforeUploadResult.value) {
    // 文件上传失败，手动从文件列表中移除
    formState.value.avatar = []
    beforeUploadResult.value = false
  }

};
const handleCancel = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};
const handlePreview = async (file: UploadProps['fileList'][number]) => {
  console.log('image', file)
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;

  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);

};
const beforeUpload = (file: UploadProps['fileList'][number]) => {
  console.log('编辑之前', file)
  const maxSize = 60 * 1024; // 60KB
  if (file.size > maxSize) {
    message.error('文件大小不能超过60KB');
    beforeUploadResult.value = true
  } else {
    beforeUploadResult.value = false
  }

};




const setModalVisible = (open: boolean) => {
  modalVisible.value = open;
  initFormData()
}
const initFormData = () => {
  formState.value.username = store.state.user.username
  formState.value.sex = store.state.user.sex
  formState.value.age = store.state.user.age
  formState.value.profession = store.state.user.profession
  formState.value.phone = store.state.user.phone
  formState.value.email = store.state.user.email
  formState.value.avatar = []
  formState.value.avatar?.push({
    uid: store.state.user.avatar,
    name: store.state.user.avatar,
    status: 'done',
    url: store.state.user.avatar,
  },)
}
const checkAge = async (_rule: Rule, value: number) => {
  if (!value) {
    return Promise.reject('Please input the age');
  }
  if (!Number.isInteger(value)) {
    return Promise.reject('Please input digits');
  } else {
    if (value < 18) {
      return Promise.reject('Age must be greater than 18');
    } else {
      return Promise.resolve();
    }
  }
};
const checkPhone = async (_rule: Rule, value: string) => {
  if (value === '') {
    return Promise.reject('Please input the phone');
  } else {
    const mPattern = /^1[34578]\d{9}$/;
    if (!mPattern.test(value.trim())) {
      return Promise.reject('Phone format is incorrect');
    }
    return Promise.resolve();
  }
};

const checkEmail = async (_rule: Rule, value: string) => {
  if (value === '') {
    return Promise.reject('Please input the email');
  } else {
    const emailRegExp = /^\w{3,12}@\w{1,5}\.[a-z]{2,3}$/;
    const email = value.trim();
    if (!emailRegExp.test(email)) {
      return Promise.reject('Email format is incorrect');
    }
    return Promise.resolve();
  }
};


const rules: Record<string, Rule[]> = {
  email: [{ required: true, validator: checkEmail, trigger: 'change' }],
  age: [{ required: true, validator: checkAge, trigger: 'change' }],
  phone: [{ required: true, validator: checkPhone, trigger: 'change' }]

};
const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 14 },
};

const handleFinishFailed = (errors: any) => {
  console.log(errors);
};
const cancelModal = () => {
  modalVisible.value = false
  formRef.value?.resetFields()
};
const handleValidate = (...args: any[]) => {
  console.log(args);
};
</script>
<style lang="scss" scoped>
/* you can make up upload button and sample style by using stylesheets */
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}

.events {
  list-style: none;
  margin: 0;
  padding: 0;
}

.events .ant-badge-status {
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
  text-overflow: ellipsis;
  font-size: 12px;
}

.notes-month {
  text-align: center;
  font-size: 28px;
}

.notes-month section {
  font-size: 28px;
}

.middle-content {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 30%;
  margin-top: 20px;


  >.bookmessage {
    width: 48%;
    height: 100%;
    background-color: #fff;
    border-radius: 6px;

  }

  >.message {
    width: 48%;
    height: 100%;
    background-color: #fff;
    margin-left: 4%;
    overflow-y: scroll;

  }
}



.userinfo {
  width: 87%;
  background-color: #f8f8f8;
  height: 89vh;
  display: flex;
  flex-direction: column;
  margin: 20px;

  >.user-wrapper {
    display: flex;
    flex-direction: row;
    height: 278px;
  }



  >.countmessage {
    width: 100%;
    height: 30%;
    margin-top: 32px;
    background-color: #fff;
    border-radius: 6px;
    overflow-x: auto;
  }

}

.avatar {
  background-color: #fff;
  width: 30%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  >img {
    width: 40%;

    border-radius: 50%;
  }

}

.userinfocard {
  width: 70%;
  display: flex;
  background-color: #fff;
  justify-content: space-evenly;
  align-items: center;
  flex-wrap: wrap;
  padding: 20px;

  >.text-wrapper {
    font-size: 28px;
    text-align: left;

    width: 30%;
    white-space: nowrap;

    &:nth-child(2),
    &:nth-child(5) {
      margin-left: -80px;
    }
  }
}

.content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  >.main-content {
    display: flex;
    flex-direction: row;

    background-color: #f0f2f5;
  }
}
</style>
