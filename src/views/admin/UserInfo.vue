<template>
  <div v-if="reloadPage" style="width: 100vw;height: 100vh;">
    <ReloadPage style="display: flex;justify-content: center;align-items: center;"></ReloadPage>
  </div>
  <div v-else class="content">
    <TopMenu @enterFullscreen="enterFullscreen" @exitFullscreen="exitFullscreen" @reload="reload"></TopMenu>
    <div class="main-content">
      <SideBar :url="'/admin/user'"></SideBar>
      <div class="books-table">
        <div style="width: 20%;display: flex;flex-direction: row;padding:6px 0 0 6px;">
          <a-button type="primary" style="width: 65px;margin-left: 7px;" @click="editForm({}, 'add')">添加</a-button>
          <a-button type="primary" style="margin-left: 7px;" :disabled="!hasSelected" @click="deleteMany">
            批量删除
          </a-button>
          <span
            style="margin-left: 8px;display: flex;justify-content: center;align-items: center;font-size: 12px;color:gray">
            <template v-if="hasSelected">
              {{ `选择了 ${state.selectedRowKeys.length} 项` }}
            </template>
          </span>
        </div>

        <a-table :row-selection="{
    selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange
  }" :data-source="tableData" :columns="columns" :scroll="{ y: 710 }"
          :pagination="{ hideOnSinglePage: true, pageSize: 50 }" :customHeaderRow="customHeaderRow" :loading="loading">
          <template #headerCell="{ column, text }">
            <template v-if="column.key === 'username'">
              <span style="color: #1890ff">{{ column.title }}</span>
            </template>

          </template>

          <template #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
            <div style="padding: 8px">
              <a-input ref="searchInput" :placeholder="`Search ${column.dataIndex}`" :value="selectedKeys[0]"
                style="width: 188px; margin-bottom: 8px; display: block"
                @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
                @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)" />
              <a-button type="primary" size="small" style="width: 90px; margin-right: 8px"
                @click="handleSearch(selectedKeys, confirm, column.dataIndex)">
                <template #icon>
                  <SearchOutlined />
                </template>
                搜索
              </a-button>
              <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)">
                清空
              </a-button>
            </div>
          </template>
          <template #customFilterIcon="{ filtered }">
            <search-outlined :style="{ color: filtered ? '#108ee9' : undefined, position: 'absolute', right: 0 }" />
          </template>
          <template #bodyCell="{ text, column, record }">
            <span v-if="state.searchText && state.searchedColumn === column.dataIndex">
              <template v-for="(fragment, i) in text
    .toString()
    .split(new RegExp(`(?<=${state.searchText})|(?=${state.searchText})`, 'i'))">
                <mark v-if="fragment.toLowerCase() === state.searchText.toLowerCase()" :key="i" class="highlight">
                  {{ fragment }}
                </mark>
                <template v-else>{{ fragment }}</template>
              </template>
            </span>
            <template v-else-if="column.key === 'action'">
              <a-popconfirm v-if="tableData.length" title="确认删除？" okText="确认" cancelText="取消"
                @confirm="onDelete(record.key)">
                <a>删除</a>
              </a-popconfirm>

              <span style="margin-left: 5px;">
                <a @click="editForm(record, 'edit')">编辑</a>
              </span>
            </template>
            <template v-else-if="column.key === 'avatar'">
              <a-image :width="50" :src="text" />
            </template>
            <template v-else-if="column.key === 'role'">
              <span>{{ record.role?.rolename }}</span>
            </template>
          </template>
        </a-table>
        <a-modal :open="modalVisible" :title="titleValue" centered @cancel="cancelModal">

          <a-form ref="formRef" name="custom-validation" labelAlign="left" :model="formState" :rules="rules"
            v-bind="layout">
            <a-form-item label="头像" name="avatar">
              <div class="clearfix">
                <a-upload v-model:file-list="formState.avatar" :before-upload="beforeUpload" list-type="picture-card"
                  @change="uploadChange" @preview="handlePreview" action="/logins">
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
            <a-form-item label="用户名" name="username">
              <a-input v-model:value="formState.username" type="text" autocomplete="off" />
            </a-form-item>
            <a-form-item label="密码" name="password">
              <a-input v-model:value="formState.password" type="password" autocomplete="off" />
            </a-form-item>

            <a-form-item label="年龄" name="age">
              <a-input-number v-model:value="formState.age" autocomplete="off" />
            </a-form-item>

            <a-form-item label="性别" name="sex">
              <a-radio-group v-model:value="formState.sex">
                <a-radio :value="'男'">男</a-radio>
                <a-radio :value="'女'">女</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="邮箱" name="email">

              <a-input v-model:value="formState.email" type="text" autocomplete="off" />
            </a-form-item>
            <a-form-item label="权限" name="role">
              <a-select v-model:value="formState.role" placeholder="Select a person" :filter-option="filterOption"
                style="width: 300px" :options="items.map(item => ({ value: item }))">


              </a-select>
            </a-form-item>


            <a-form-item label="职业" name="profession">
              <a-select v-model:value="formState.profession" show-search placeholder="选择一个职业" style="width: 200px"
                :options="options" :filter-option="filterOption"></a-select>
            </a-form-item>

            <a-form-item label="手机" name="phone">
              <a-input v-model:value="formState.phone" type="text" autocomplete="off" />
            </a-form-item>
          </a-form>


          <template #footer>
            <a-button @click="cancelModal">取消</a-button>
            <a-button type="primary" @click="updateForm">保存</a-button>
          </template>
        </a-modal>
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
import { ref, reactive, onBeforeMount, computed, toRaw } from 'vue';

import axiosInstance from '../../axiosInstance';
import SideBar from './components/SideBar.vue';
import TopMenu from './components/TopMenu.vue';
import { SearchOutlined } from '@ant-design/icons-vue';
import { message, type FormInstance } from 'ant-design-vue';
import type { SelectProps } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import { PlusOutlined, UnorderedListOutlined, RedoOutlined } from '@ant-design/icons-vue';
import type { UploadProps, UploadChangeParam } from 'ant-design-vue';
import ReloadPage from '../../components/reloadPage.vue'
import { useStore } from 'vuex';

const store = useStore()
const selectRecord = ref('')
const loading = ref<boolean>(true)

interface FormState {
  _id: string;
  username: string;
  password: string;
  email: string;
  role: string | undefined;
  age: number | undefined;
  avatar: UploadProps['fileList'] | undefined;
  phone: string;
  profession: string;
  sex: string | undefined;
}

const filterOption = (input: string, option: any) => {
  return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};
const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 14 },
};
const formRef = ref<FormInstance>();
const formState = ref<FormState>({
  _id: '',
  username: '',
  password: '',
  email: '',
  role: undefined,
  age: undefined,
  avatar: [],
  phone: '',
  profession: '',
  sex: undefined,
});
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


const customHeaderRow = (conlumn) => {
  // 在这里可以在控制台看到有一个className ，如下图
  conlumn.forEach((e, index) => {
    conlumn[index].className = 'tableClass' // 给数组中的每一列加上一个类名
  })
}

const items = ref<any>([]);
const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
const titleValue = ref('编辑用户信息')
const options = ref<SelectProps['options']>([
  { value: '学生', label: '学生' },
  { value: '老师', label: '老师' },
  { value: '其他', label: '其他' },
]);

let rules: Record<string, Rule[]> = {
  username: [{ required: true, message: '请输入用户名', trigger: 'change' }],

  email: [{ required: true, message: '请输入邮箱', trigger: 'change' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  age: [{ required: true, message: '请输入年龄', trigger: 'change' }],

  phone: [{ required: true, message: '请输入手机号', trigger: 'change' }],
  profession: [{ required: true, message: '请选择职业', trigger: 'change' }],
  sex: [{ required: true, message: '请选择性别', trigger: 'change' }],
};


const updateForm = () => {
  console.log('点击了')
  formRef.value?.validate().then(async () => {
    console.log('点击了1', formState.value, selectRecord.value)
    // let avatar
    // if (titleValue.value !== "添加用户") {
    //   avatar = [(formState.value.avatar?.length !== 0) ?formState.value.avatar[0].url  : selectRecord.value.avatar]
    // } else {
    //   avatar = [(formState.value.avatar?.length !== 0) ? await getBase64(formState.value.avatar[0].originFileObj) : `data:image/png;base64,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`]
    // }
    const emptyAvatar = `data:image/png;base64,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`
    const user = { ...formState.value, avatar: formState.value.avatar?.length !== 0 ? formState.value.avatar[0].url : emptyAvatar }
    // const user = { ...formState.value}
    await axiosInstance.post('/updateuser', { user }).then((res) => {
      modalVisible.value = false
      message.success('编辑成功', 1.5)
      console.log('res', res, formState.value)
      if (formState.value._id) {
        for (let i = 0; i < tableData.value.length; i++) {
          if (tableData.value[i]._id === res.data.user._id) {
            tableData.value[i] = { key: res.data.user._id, ...res.data.user };
          }
        }
        store.commit('setUser', res.data.user)
      } else {
        const temp = ref<string[]>([{ key: res.data.user._id, role: res.data.user.role.rolename, ...res.data.user }])
        tableData.value = temp.value.concat(tableData.value)
      }
      updateRoles()

    }).catch(error => {
      console.log(error)
      message.error(error.response.data.message, 1.5)
    })
    console.log('value', formState.value)
  }).catch(error => {
    console.log('error', error);
  })
}


const updateRoles = async () => {
  try {
    const { data } = await axiosInstance.get('/showroles')
    console.log('data', data)
    let tempRoles = []
    for (let i = 0; i < data.roles.length; i++) {
      tempRoles.push(data.roles[i].rolename)
    }
    items.value = [...new Set(tempRoles)]
  } catch (error) {
    console.log(error)
  }
}
const beforeUploadResult = ref(false)

// const uploadChange = (e: any) => {
//   console.log('e',e.fileList)
//   if(beforeUploadResult){
//     formState.value.avatar = e.fileList
//   }else{
//     e.fileList=[]
//     formState.value.avatar = []
//   }

// }

const uploadChange = async (info: UploadChangeParam) => {
  console.log('INFO', info, beforeUploadResult)
  if (beforeUploadResult.value) {
    // 文件上传失败，手动从文件列表中移除
    formState.value.avatar = []
    beforeUploadResult.value = false
  } else if (info.file.status === 'done') {
    const base64Url: any = await getBase64(info.file.originFileObj)
    console.log('ava', formState.value.avatar)
    formState.value.avatar[0] = {
      uid: base64Url,
      status: 'done',
      name: base64Url,
      url: base64Url

    }
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


function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
















const deleteMany = async () => {
  console.log('添加', toRaw(state.selectedRowKeys))
  await axiosInstance.post('/deleteusers', { users: toRaw(state.selectedRowKeys) }).then((res) => {
    console.log('res', res)
    if (res) {
      message.loading('loading', 1.0).then(() => {
        message.success('删除成功', 1.0)
        for (let i = 0; i < toRaw(state.selectedRowKeys).length; i++) {
          tableData.value = tableData.value.filter(item => item.key !== toRaw(state.selectedRowKeys)[i]);
        }
        state.selectedRowKeys = []
      })
    }
  })
}


const onDelete = async (key: string) => {
  console.log('key', key)

  await axiosInstance.post('/deleteuser', { _id: key }).then((res) => {
    console.log('res', res)
    if (res) {
      message.loading('loading', 1.0).then(() => {
        message.success('删除成功', 1.0)
        tableData.value = tableData.value.filter(item => item.key !== key);
      })
    }
  })

}









const columns = [
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
    customFilterDropdown: true,
    ellipsis: true,
    onFilter: (value, record) => record.username.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus();
        }, 100);
      }
    },

    align: 'center'
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
    ellipsis: true,
    customFilterDropdown: true,
    onFilter: (value, record) => record.email.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus();
        }, 100);
      }
    },

    align: 'center'
  },
  {
    title: '权限',
    dataIndex: 'role',
    key: 'role',
    align: 'center'
  },
  {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
    align: 'center'
  },
  {
    title: '头像',
    dataIndex: 'avatar',
    key: 'avatar',
    align: 'center'
  },
  {
    title: '手机',
    dataIndex: 'phone',
    key: 'phone',
    align: 'center'
  },
  {
    title: '职业',
    dataIndex: 'profession',
    key: 'profession',
    align: 'center'
  },
  {
    title: '性别',
    dataIndex: 'sex',
    key: 'sex',
    align: 'center'
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    align: 'center'
  }
]
const tableData = ref<any>([])

const modalVisible = ref<boolean>(false);
const cancelModal = () => {
  modalVisible.value = false
  console.log('取消了')
  formState.value.avatar = []
  resetForm()

};
const editForm = (record: any, type: string) => {
  switch (type) {
    case 'edit':
      resetForm()
      initFormData(record)
      selectRecord.value = record
      titleValue.value = '编辑用户信息'
      rules = { ...rules, password: [{ required: false, message: '请输入密码', trigger: 'change' }] }
      modalVisible.value = true
      break;
    case 'add':
      resetForm()
      titleValue.value = '添加用户'
      rules = { ...rules, password: [{ required: true, message: '请输入密码', trigger: 'change' }] }

      modalVisible.value = true
      break;
    default:
      console.error({ msg: '未知提交类型' })
  }

  console.log('record', record)

}

const initFormData = (record: any) => {
  formRef.value?.resetFields()
  formState.value._id = record.key
  formState.value.username = record.username
  formState.value.email = record.email
  formState.value.role = record.role.rolename
  formState.value.age = record.age
  formState.value.avatar = []
  formState.value.avatar?.push({
    uid: record.avatar,
    name: record.avatar,
    status: 'done',
    url: record.avatar,
  },)
  formState.value.phone = record.phone
  formState.value.profession = record.profession
  formState.value.sex = record.sex

}
const resetForm = () => {
  formRef.value?.resetFields()
  formState.value._id = ''
  formState.value.username = ''
  formState.value.email = ''
  formState.value.role = '普通用户'
  formState.value.age = undefined
  formState.value.phone = ''
  formState.value.profession = ''
  formState.value.sex = '男'
  formState.value.avatar = []
}

const reloadPage = ref<boolean>(false)

onBeforeMount(async () => {
  try {
    reloadPage.value = true
    await axiosInstance.get('/showusers').then((res) => {
      for (let i = 0; i < res.data.users.length; i++) {
        tableData.value.push({ key: res.data.users[i]._id, ...res.data.users[i] });
      }
    }).finally(() => {
      updateRoles()
      loading.value = false
      reloadPage.value = false
    })
  } catch (error) {
    console.log(error)
  }
})
const reload = async () => {
  try {
    reloadPage.value = true
    await axiosInstance.get('/showusers').then((res) => {
      tableData.value = []
      for (let i = 0; i < res.data.users.length; i++) {
        tableData.value.push({ key: res.data.users[i]._id, ...res.data.users[i] });
      }
    }).finally(() => {
      updateRoles()
      reloadPage.value = false
    })



  } catch (error) {
    console.log(error)
  }
}
const refresh = () => {
  try {
    loading.value = true
    setTimeout(async () => {
      tableData.value = []
      const { data } = await axiosInstance.get('/showusers')
      console.log('data', data)
      for (let i = 0; i < data.users.length; i++) {
        tableData.value.push({ key: data.users[i]._id, ...data.users[i] });
      }
      updateRoles()
      loading.value = false
    }, 1000)

  } catch (error) {
    console.log(error)
  }
}


const state = reactive({
  searchText: '',
  searchedColumn: '',
  selectedRowKeys: [],
});

const searchInput = ref();



const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
  state.searchText = selectedKeys[0];
  state.searchedColumn = dataIndex;
};

const handleReset = clearFilters => {
  clearFilters({ confirm: true });
  state.searchText = '';
};

const onSelectChange = (selectedRowKeys) => {
  console.log('selectedRowKeys changed: ', selectedRowKeys);
  state.selectedRowKeys = selectedRowKeys;
};



const hasSelected = computed(() => state.selectedRowKeys.length > 0);
</script>
<style lang="scss" scoped>
:deep(.ant-table-tbody tr:nth-child(2n)) {
  background-color: #fafafa;
}

:deep(.tableClass) {
  background-color: #fff !important;

  &:first-child {

    display: flex;
    justify-content: center;
    align-items: center;
  }
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


  }
}

.container {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.books-table {
  width: 87%;
  margin: 20px;
  background-color: #fff;
  display: flex;
  border-radius: 8px;
  flex-direction: column;
}
</style>