<template>
  <div v-if="reloadPage" style="width: 100vw;height: 100vh;">
    <ReloadPage style="display: flex;justify-content: center;align-items: center;"></ReloadPage>
  </div>
  <div v-else class="content">
    <TopMenu @enterFullscreen="enterFullscreen" @exitFullscreen="exitFullscreen" @reload="reload"></TopMenu>
    <div class="main-content">
      <SideBar :url="'/bookmanage'"></SideBar>
      <div class="books-table">
        <a-table :data-source="tableData" :columns="columns" :scroll="{ y: 710 }"
          :pagination="{ hideOnSinglePage: true, pageSize: 50 }" :loading="loading" :customHeaderRow="customHeaderRow">
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
              <span v-if="record.status===0">
                <a @click="borrow(record)">预约</a>
              </span>
              <span v-else>
                <a style="cursor: not-allowed;">预约</a>
              </span>
            </template>
            <template v-else-if="column.key==='status'">
              <a-tag v-if="record.status===0" color="green">可预约</a-tag>
              <a-tag v-else-if="record.status===1" color="error">已借出</a-tag>
              <a-tag v-else-if="record.status===2" >不可用</a-tag>
            </template>
          </template>
        </a-table>
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
import { ref, reactive, onBeforeMount } from 'vue';
import axios from 'axios'
import dayjs from 'dayjs'
import SideBar from '../components/SideBar.vue';
import TopMenu from '../components/TopMenu.vue';
import { SearchOutlined, UnorderedListOutlined, RedoOutlined } from '@ant-design/icons-vue';
import ReloadPage from '../components/reloadPage.vue'
import { useRouter } from 'vue-router';
const router = useRouter()
const reloadPage = ref<boolean>(false)
const customHeaderRow = (conlumn) => {

  conlumn.forEach((e, index) => {
    conlumn[index].className = 'tableClass' // 给数组中的每一列加上一个类名
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

const reload = async () => {
  try {
    reloadPage.value = true
    await axios.post('http://localhost:3000/showbooks').then((res) => {
      if (res) {
        tableData.value = res.data.books
      }
    }).finally(() => {
      reloadPage.value = false
    })

  } catch (error) {
    console.log(error)
  }
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
const tableData = ref([])

const loading = ref<boolean>(true)

onBeforeMount(async () => {
  try {
    reloadPage.value = true
    loading.value = false
    await axios.post('http://localhost:3000/showbooks').then((res) => {
      if (res) {
        tableData.value = res.data.books
      }
    }).finally(() => {
      reloadPage.value = false
    })

  } catch (error) {
    console.log(error)
  }
})
const refresh = () => {
  try {
    loading.value = true
    setTimeout(async () => {
      tableData.value = []
      const { data } = await axios.get('http://localhost:3000/showbooks')
      tableData.value = data.books
      loading.value = false
    }, 1000)

  } catch (error) {
    console.log(error)
  }
}



const state = reactive({
  searchText: '',
  searchedColumn: '',
});

const searchInput = ref();

const borrow = (record) => {
  router.push('/borrow?id=' + record._id + '&bookname=' + record.bookname + '&isbn=' + record.isbn)
}

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
  state.searchText = selectedKeys[0];
  state.searchedColumn = dataIndex;
};

const handleReset = clearFilters => {
  clearFilters({ confirm: true });
  state.searchText = '';
};
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

.books-table {
  width: 87%;
  margin: 20px;
  background-color: #fff;
}
</style>