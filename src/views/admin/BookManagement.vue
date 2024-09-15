<template>
  <div v-if="reloadPage" style="width: 100vw;height: 100vh;">
    <ReloadPage style="display: flex;justify-content: center;align-items: center;"></ReloadPage>
  </div>
  <div v-else class="content">
    <TopMenu @enterFullscreen="enterFullscreen" @exitFullscreen="exitFullscreen" @reload="reload"></TopMenu>
    <div class="main-content">
      <SideBar :url="'/admin/bookmanage'"></SideBar>
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

        <a-table style="border-radius: 8px;" :row-selection="{
          selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange
        }" :data-source="tableData" :columns="columns" :scroll="{ y: 680 }"
          :pagination="{ hideOnSinglePage: true, pageSize: 50 }" :customHeaderRow="customHeaderRow" :loading="loading">

          <template #headerCell="{ column }">
            <template v-if="column.key === 'bookname'">
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
                <a>下架</a>
              </a-popconfirm>

              <span style="margin-left: 5px;">
                <a @click="editForm(record, 'edit')">编辑</a>
              </span>
            </template>

            <template v-else-if="column.key === 'status'">
              <a-tag v-if="record.status === 0" color="green">可借阅</a-tag>
              <a-tag v-else-if="record.status === 1" color="error">已借出</a-tag>
              <a-tag v-else-if="record.status === 2">不可用</a-tag>
            </template>
          </template>
        </a-table>
        <a-modal :open="modalVisible" title="编辑图书信息" centered @cancel="cancelModal">
          <a-form ref="formRef" name="custom-validation" labelAlign="left" :model="formState" :rules="rules"
            v-bind="layout">

            <a-form-item label="书名" name="bookname" required>
              <a-input v-model:value="formState.bookname" type="text" autocomplete="off" />
            </a-form-item>
            <a-form-item label="作者" name="author">

              <a-input v-model:value="formState.author" type="text" autocomplete="off" />
            </a-form-item>
            <a-form-item label="发布时间" name="publishtime">
              <a-date-picker v-model:value="formState.publishtime" />
            </a-form-item>
            <a-form-item label="分类" name="type">
              <a-select v-model:value="formState.type" show-search placeholder="选择一个分类" :filter-option="filterOption"
                style="width: 300px" :options="items.map(item => ({ value: item }))" :allowClear="true" :tag="true">

                <template #dropdownRender="{ menuNode: menu }">
                  <v-nodes :vnodes="menu" />
                  <a-divider style="margin: 4px 0" />
                  <a-space style="padding: 4px 8px">
                    <a-input ref="inputRef" v-model:value="name" placeholder="增加一个分类" />
                    <a-button type="text" @click="addItem">
                      <template #icon>
                        <plus-outlined />
                      </template>
                      添加分类
                    </a-button>
                  </a-space>
                </template>

                <template #option="{ value }">
                  <div style="display: flex;flex-direction: row;justify-content: space-between;align-items: center;">
                    <span>{{ value }}</span>
                    <div @click.stop>
                      <CloseCircleOutlined @click="deleteType(value)" />
                    </div>

                  </div>
                </template>
              </a-select>
            </a-form-item>
            <a-form-item label="预览" name="preview">
              <div class="clearfix">

                <a-upload v-model:file-list="fileList" @remove="removeChange" @change="uploadChange" action="/logins"
                  list-type="picture-card" @preview="handlePreview">
                  <div v-if="fileList.length < 3">
                    <plus-outlined />
                    <div style="margin-top: 8px">Upload</div>
                  </div>
                </a-upload>
                <a-modal :open="previewVisible" :title="previewTitle" :footer="null" @cancel="handleCancel">
                  <img alt="example" style="width: 100%" :src="previewImage" />
                </a-modal>
              </div>
            </a-form-item>
            <a-form-item label="状态" name="status">
              <a-select v-model:value="formState.status" placeholder="请选择一个状态" :options="statusOptions"></a-select>
            </a-form-item>
            <a-form-item label="出版社" name="publish">
              <a-input v-model:value="formState.publish" type="text" autocomplete="off" />
            </a-form-item>
            <a-form-item label="isbn" name="isbn">
              <a-input v-model:value="formState.isbn" type="text" autocomplete="off" />
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
import { ref, reactive, onBeforeMount, computed, defineComponent, toRaw } from 'vue';
import axiosInstance from '../../axiosInstance';
import dayjs from 'dayjs'
import SideBar from './components/SideBar.vue';
import TopMenu from './components/TopMenu.vue';
import { SearchOutlined } from '@ant-design/icons-vue';
import { message, type FormInstance } from 'ant-design-vue';

import type { Rule } from 'ant-design-vue/es/form';
import { PlusOutlined, CloseCircleOutlined, UnorderedListOutlined, RedoOutlined } from '@ant-design/icons-vue';
import ReloadPage from '../../components/reloadPage.vue'
import type { Dayjs } from 'dayjs';
import type { SelectProps } from 'ant-design-vue';

import type { UploadProps } from 'ant-design-vue';


const statusOptions = ref<SelectProps['options']>([
  { value: 1, label: '已借出' },
  { value: 2, label: '不可用' },
  { value: 0, label: '可借阅' },
]);


const reloadPage = ref<boolean>(false)
interface FormState {
  _id: string;
  author: string;
  bookname: string;
  isbn: number | undefined;
  status: number | undefined;
  publish: string;
  publishtime: Dayjs | undefined;
  preview: string | undefined;
  type: string | undefined;
}


function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
const uploadChange = () => {
  console.log('has upload')
  hasUpload.value = true
}

const removeChange = (file: any) => {
  console.log('remove', file)

}
const formType = ref('编辑')
const fileList = ref<UploadProps['fileList']>([

]);
const hasUpload = ref(false)
const handleCancel = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};
const handlePreview = async (file: UploadProps['fileList'][number]) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;

  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};




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




const filterOption = (input: string, option: any) => {
  return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};
const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 14 },
};
const loading = ref<boolean>(true)
const formRef = ref<FormInstance>();
const formState = ref<FormState>({
  _id: '',
  author: '',
  bookname: '',
  isbn: undefined,
  status: undefined,
  publish: '',
  publishtime: dayjs(),
  preview: undefined,
  type: undefined
});

const VNodes = defineComponent({
  props: {
    vnodes: {
      type: Object,
      required: true,
    },
  },
  render() {
    return this.vnodes;
  },
});

let index = 0;
const items = ref<any>([]);

const inputRef = ref();
const name = ref();

const addItem = async (e: any) => {
  e.preventDefault();
  console.log('addItem');
  if (!name.value) {
    message.error('请输入分类名称', 1.5)
    return
  }
  if (items.value.includes(name.value)) {
    message.error('该分类已存在', 1.5)
    return
  }
  items.value.push(name.value);
  try {
    await axiosInstance.post('/addtype', { type: name.value })
  } catch (error) {
    message.error(error.response.data.message, 1.5)
    console.log('error', error)
  }

  name.value = '';
  setTimeout(() => {
    inputRef.value?.focus();
  }, 0);
};
const rules: Record<string, Rule[]> = {
  author: [{ required: true, message: '请输入作者名称', trigger: 'change' }],
  bookname: [{ required: true, message: '请输入书名', trigger: 'change' }],
  publish: [{ required: true, message: '请输入出版社名称', trigger: 'change' }],
  publishtime: [{ required: true, message: '请选择发布时间', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  type: [{ required: true, message: '请选择图书类型', trigger: 'change' }],
  // preview: [{ required: true, message: '请上传预览目录图片', trigger: 'change' }],
  isbn: [{ required: true, message: '请输入ISBN号', trigger: 'change' }],
};

// let blobs: any[] = []


// for (let i = 0; i < preview.length; i++) {
//   const base64Data = preview[i].split(",")[1]
//   const contentType = ((preview[i].split(",")[0]).split(":")[1]).split(";")[0]
//   blobs.push(base64ToBlob(base64Data, contentType))
// }

// const formData = new FormData();
// blobs.forEach((blob, index) => {
//   formData.append(`image${index + 1}`, blob, `image${index + 1}.jpg`);
// });

// await instance.post('/editbook', formData)
// .then(res=> {
//   {
//   modalVisible.value = false
//   message.success('编辑成功', 1.5)
//   console.log('res', res, formState.value)
//   if (formState.value._id) {
//     for (let i = 0; i < tableData.value.length; i++) {
//       if (tableData.value[i]._id === res.data.book._id) {
//         tableData.value[i] = { key: res.data.book._id, ...res.data.book };

//       }
//     }
//   } else {
//     const temp = ref<string[]>([{ key: res.data.book._id, ...res.data.book }])
//     tableData.value = temp.value.concat(tableData.value)
//     // tableData.value.unshift(res.data.book)

//   }
//   updateTypes()

// }
// })
// .catch(error => {
//   console.log(error)
//   message.error('编辑错误', 1.5)
// });
const updateForm = () => {
  console.log('点击了')
  formRef.value?.validate().then(async () => {

    let preview: string[] = []
    console.log('aaaa', fileList.value, hasUpload.value)
    for (let i = 0; i < fileList.value?.length; i++) {

      let temp: any
      if (hasUpload.value) {
        if ('originFileObj' in fileList.value[i]) {
          temp = await getBase64(fileList.value[i].originFileObj)
        } else {
          temp = fileList.value[i].url
        }

      } else {
        temp = fileList.value[i].url
      }


      console.log('temp', temp)
      preview.push(temp)
    }
    console.log('preview', preview)
    for (let j = 0; j < preview.length; j++) {
      const base64String = preview[j];
      const chunkSize = 1024 * 8; // 每个块的大小
      const totalChunks = Math.ceil(base64String.length / chunkSize);
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, base64String.length);
        const chunk = base64String.substring(start, end);
        // 发送分块数据到后端
        fetch('/editbook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ chunk, index: i, totalChunks, listSign: j + 1, length: preview.length, isUploadDone: false }),
        });
      }
    }





    console.log('点击了1', preview, formState.value)
    await axiosInstance.post('/editbook', { book: formState.value, isUploadDone: true }).then((res) => {
      modalVisible.value = false
      message.success(`${formType.value}成功`, 1.5)
      hasUpload.value = false
      console.log('res', res, formState.value)
      if (formState.value._id) {
        for (let i = 0; i < tableData.value.length; i++) {
          if (tableData.value[i]._id === res.data.book._id) {
            tableData.value[i] = { key: res.data.book._id, ...res.data.book };

          }
        }
      } else {
        const temp = ref<string[]>([{ key: res.data.book._id, ...res.data.book }])
        tableData.value = temp.value.concat(tableData.value)
      }
      updateTypes()

    }).catch(error => {
      console.log(error)
      message.error(error.response.data.message, 1.5)
    })
    console.log('value', formState.value)
  }).catch(error => {
    console.log('error', error);
  })
}


const updateTypes = async () => {
  try {
    const { data } = await axiosInstance.get('/showtypes')
    console.log('data', data)
    let tempTypes = []
    for (let i = 0; i < data.types.length; i++) {
      tempTypes.push(data.types[i].type)
    }
    items.value = [...new Set(tempTypes)]
  } catch (error) {

    console.log(error)
  }
}







const deleteMany = async () => {
  console.log('添加', toRaw(state.selectedRowKeys))
  await axiosInstance.post('/deletebooks', { books: toRaw(state.selectedRowKeys) }).then((res) => {
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
const deleteType = async (type: string) => {
  console.log('type', type)

  await axiosInstance.post('/deletetype', { type }).then((res) => {
    console.log('res', res)
    if (res) {
      message.success('删除成功', 1.0)
      updateTypes()
    }
  })

}

const onDelete = async (key: string) => {
  console.log('key', key)
  try {
    await axiosInstance.post('/deletebook', { _id: key }).then((res) => {
      console.log('res', res)
      if (res) {
        message.loading('loading', 1.0).then(() => {
          message.success('下架成功', 1.0)
          tableData.value = tableData.value.filter(item => item.key !== key);
        })
      }
    })
  } catch (error) {
    message.error('下架失败', 1.0)
    console.log(error)
  }
}









const customHeaderRow = (conlumn) => {
  // 在这里可以在控制台看到有一个className ，如下图
  conlumn.forEach((e, index) => {
    conlumn[index].className = 'tableClass' // 给数组中的每一列加上一个类名
  })
}

const columns = [
  {
    title: '书名',
    dataIndex: 'bookname',
    key: 'bookname',
    customFilterDropdown: true,
    ellipsis: true,
    onFilter: (value, record) => record.bookname.toString().toLowerCase().includes(value.toLowerCase()),
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
    title: '作者',
    dataIndex: 'author',
    key: 'author',
    ellipsis: true,
    customFilterDropdown: true,
    onFilter: (value, record) => record.author.toString().toLowerCase().includes(value.toLowerCase()),
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
    title: '分类',
    dataIndex: 'type',
    key: 'type',
    customFilterDropdown: true,
    onFilter: (value, record) => record.type.toString().toLowerCase().includes(value.toLowerCase()),
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
    title: '发布时间',
    dataIndex: 'publishtime',
    key: 'publishtime',
    customRender: ({ text }) => {
      return dayjs(text).format('YYYY-MM-DD')
    },
    align: 'center'
  },
  {
    title: '出版社',
    dataIndex: 'publish',
    key: 'publish',
    align: 'center'
  },
  {
    title: 'ISBN',
    dataIndex: 'isbn',
    key: 'isbn',
    align: 'center'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    align: 'center',

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
  resetForm()

};
const editForm = (record: any, type: string) => {
  switch (type) {
    case 'edit':
      resetForm()
      initFormData(record)
      formType.value = '编辑'
      modalVisible.value = true
      break;
    case 'add':
      resetForm()
      formType.value = '添加'
      modalVisible.value = true
      break;
    default:
      console.error({ msg: '未知提交类型' })
  }

  console.log('record', record)

}

const initFormData = (record: any) => {

  formState.value._id = record.key
  formState.value.author = record.author
  formState.value.bookname = record.bookname
  formState.value.publish = record.publish
  formState.value.publishtime = dayjs(record.publishtime)
  formState.value.status = record.status
  formState.value.type = record.type
  formState.value.isbn = record.isbn
  console.log('length', JSON.parse(record.preview))
  JSON.parse(record.preview.replace(/'/g, '"')).map((item: string) => {
    fileList.value?.push({
      uid: item,
      name: item,
      status: 'done',
      url: item
    })
  })




}
const resetForm = () => {
  formState.value._id = ''
  formState.value.author = ''
  formState.value.bookname = ''
  formState.value.publish = ''
  formState.value.publishtime = dayjs()
  formState.value.status = undefined
  formState.value.type = undefined
  formState.value.isbn = undefined
  formState.value.preview = undefined
  fileList.value = []
}



onBeforeMount(async () => {
  try {
    reloadPage.value = true
    await axiosInstance.get('/showbooks').then((res) => {
      if (res) {
        for (let i = 0; i < res.data.books.length; i++) {
          tableData.value.push({ key: res.data.books[i]._id, ...res.data.books[i] });
        }
      }
    }).finally(() => {
      updateTypes()
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
    await axiosInstance.post('/showbooks').then((res) => {
      if (res) {
        for (let i = 0; i < res.data.books.length; i++) {
          tableData.value.push({ key: res.data.books[i]._id, ...res.data.books[i] });
        }
        updateTypes()
      }
    }).finally(() => {
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
      const { data } = await axiosInstance.get('/showbooks')
      for (let i = 0; i < data.books.length; i++) {
        tableData.value.push({ key: data.books[i]._id, ...data.books[i] });
      }
      updateTypes()
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

.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
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


.books-table {
  width: 87%;
  height: 90vh;
  margin: 20px 0 0 20px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
}
</style>