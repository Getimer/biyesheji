<template>
    <div v-if="reloadPage" style="width: 100vw;height: 100vh;">
        <ReloadPage style="display: flex;justify-content: center;align-items: center;"></ReloadPage>
    </div>
    <div v-else class="borrow-page">
        <TopMenu @enterFullscreen="enterFullscreen" @exitFullscreen="exitFullscreen" @reload="reload"></TopMenu>
        <div class="main-content">
            <SideBar :url="'/admin/borrow'"></SideBar>
            <div class="borrowform">
            </div>
            <div class="borrow-table">
                <a-table :columns="columns" :data-source="tabData"
                    :pagination="{ hideOnSinglePage: true, pageSize: 50 }" :scroll="{ y: 700 }" :loading="loading">
                    <template #headerCell="{ column }">
                        <template v-if="column.key === 'bookname'">
                            <span style="color: #1890ff">{{ column.title }}</span>
                        </template>
                    </template>

                    <template #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
                        <div style="padding: 8px">
                            <a-input ref="searchInput" :placeholder="`Search ${column.dataIndex}`"
                                :value="selectedKeys[0]" style="width: 188px; margin-bottom: 8px; display: block"
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
                        <search-outlined
                            :style="{ color: filtered ? '#108ee9' : undefined, position: 'absolute', right: 0 }" />
                    </template>

                    <template #bodyCell="{ text, column, record }">
                        <span v-if="state.searchText && state.searchedColumn === column.dataIndex">
                            <template v-for="(fragment, i) in text
        .toString()
        .split(new RegExp(`(?<=${state.searchText})|(?=${state.searchText})`, 'i'))">
                                <mark v-if="fragment.toLowerCase() === state.searchText.toLowerCase()" :key="i"
                                    class="highlight">
                                    {{ fragment }}
                                </mark>
                                <template v-else>{{ fragment }}</template>
                            </template>
                        </span>

                        <template v-else-if="column.dataIndex === 'bookname'">

                            {{ text }}

                        </template>

                        <template v-else-if="column.dataIndex === 'status'">
                            <span>
                                <a-tag :color="record.status.color">
                                    {{ record.status.status }}
                                </a-tag>
                            </span>
                        </template>

                        <template v-else-if="column.key === 'action'">

                            <span style="margin-left: 5px;">
                                <a @click="editForm(record)">提醒</a>
                                <a-divider type="vertical" />
                                <a-dropdown>
                                    <a class="ant-dropdown-link" @click.prevent>
                                        更多
                                        <DownOutlined />
                                    </a>
                                    <template #overlay>
                                        <a-menu>
                                            <a-menu-item @click="onClick(record, '借阅')"
                                                :disabled="record.status.status !== '已预约'">借阅</a-menu-item>
                                            <a-menu-item @click="onClick(record, '归还')"
                                                :disabled="!['已逾期', '借阅中'].includes(record.status.status)">归还</a-menu-item>
                                        </a-menu>
                                    </template>
                                </a-dropdown>
                            </span>
                        </template>
                    </template>
                </a-table>
                <a-modal :open="modalVisible" title="发送提醒" centered @cancel="cancelModal">
                    <a-form ref="formRef" name="custom-validation" labelAlign="left" :model="formState" :rules="rules"
                        v-bind="layout">

                        <a-form-item label="接收人" name="target">
                            <a-input v-model:value="formState.target" type="text" disabled autocomplete="off" />
                        </a-form-item>
                        <a-form-item label="类型" name="type">
                            <a-select v-model:value="formState.type" show-search :disabled="selectType"
                                placeholder="选择一个类型" style="width: 200px" :options="options"
                                :filter-option="filterOption"></a-select>
                        </a-form-item>
                        <a-form-item label="标题" name="title">
                            <a-input v-model:value="formState.title" type="text" autocomplete="off" />
                        </a-form-item>
                        <a-form-item label="内容" name="content">
                            <a-textarea v-model:value="formState.content" allow-clear show-count />
                        </a-form-item>

                    </a-form>

                    <template #footer>
                        <a-button @click="cancelModal">取消</a-button>
                        <a-button type="primary" @click="updateForm">发送</a-button>
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

import SideBar from './components/SideBar.vue';
import TopMenu from './components/TopMenu.vue';
import { onBeforeMount } from 'vue';
import axiosInstance from '../../axiosInstance';
import dayjs from 'dayjs';
import { reactive, ref } from 'vue';
import type { UnwrapRef } from 'vue';

import { message } from 'ant-design-vue';
import { SearchOutlined, UnorderedListOutlined, RedoOutlined, DownOutlined } from '@ant-design/icons-vue';
import type { Rule } from 'ant-design-vue/es/form';
import type { SelectProps } from 'ant-design-vue';
import ReloadPage from '../../components/reloadPage.vue'


const onClick = async (record: any, type: string) => {
    try {
        console.log('record1', record)
        if (type === '借阅') {
            //借阅逻辑
            await axiosInstance.post('/updateborrowstatus', { record }).then((res) => {
                if (res.data) {
                    message
                        .loading('loading..', 1.5)
                        .then(
                            () => {

                                message.success('借阅成功', 1.0)
                                refresh()
                            }
                        )
                }
            });
        } else {
            //归还逻辑

            await axiosInstance.post('/updatebackstatus', { record }).then((res) => {
                if (res.data) {
                    message
                        .loading('loading..', 1.5)
                        .then(
                            () => {
                                message.success('归还成功', 1.0)
                                refresh()
                            }
                        )
                }
            });
        }
    } catch (error) {
        console.log(error);
    }

}
interface FormState {
    target: string | undefined;
    content: string | undefined;
    type: string | undefined;
    title: string | undefined;
    id: string;
    userId: string;
}

const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 18 },
};

const options = ref<SelectProps['options']>([
    { value: '提醒', label: '提醒' },
    { value: '公告', label: '公告' },
    { value: '通知', label: '通知' },
]);
const filterOption = (input: string, option: any) => {
    return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
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



const formRef = ref();
const modalVisible = ref<boolean>(false)
const selectType = ref<boolean>(true)
const cancelModal = () => {
    formState.content = ''
    modalVisible.value = false
}
const editForm = (record: any) => {
    formState.type = '提醒'
    console.log('status', record)
    formState.id = record.id
    formState.userId = record.userId
    switch (record.status.status) {
        case '借阅中':
            selectType.value = false
            formState.title = '图书借阅通知';
            formState.type = '通知'
            break;
        case '已归还':
            selectType.value = true
            formState.title = '图书归还通知';
            formState.type = '通知'
            break;
        case '已逾期':
            selectType.value = true
            formState.title = '图书逾期通知';
            formState.type = '通知'
            break;
        default:
            console.error('未知状态')
    }
    formState.target = record.bperson
    modalVisible.value = true
}



const rules: Record<string, Rule[]> = {
    target: [{ required: true, message: '请输入接收者', trigger: 'change' }],
    content: [{ required: true, message: '请输入内容', trigger: 'change' }],
    type: [{ required: true, message: '请选择类型', trigger: 'change' }],
    title: [{ required: true, message: '请输入标题', trigger: 'change' }],
};
const formState: UnwrapRef<FormState> = reactive({
    id: '',
    userId: '',
    target: '',
    content: '',
    type: '',
    title: ''
});
const updateForm = () => {
    console.log('点击了')
    formRef.value?.validate().then(async () => {
        console.log('点击了1', formState)
        await axiosInstance.post('/addnotice', { notice: formState }).then((res) => {
            if (res) {
                message.loading('loading', 1.5).then(() => {
                    modalVisible.value = false
                    message.success('发送成功', 1.0)
                })
            }
        })

    }).catch((error) => {
        console.log('error', error)
    })
}


let statusList: any = ref([
    {
        status: '已预约',
        color: 'green'
    },
    {
        status: '已归还',
        color: 'geekblue'
    },
    {
        status: '已逾期',
        color: 'volcano'
    },
    {
        status: '借阅中',
        color: 'cyan'
    }
])

let tabData: any = ref([])
const loading = ref<boolean>(true)
const reloadPage = ref<boolean>(false)
onBeforeMount(async () => {
    try {
        reloadPage.value = true
        await axiosInstance.get('/showborrowlist').then(async (res) => {
            if (res) {
                const tempList = []
                console.log('tempList', tempList)
                for (let i = 0; i < res.data.records.length; i++) {
                    if (res.data.records[i].status === 3) {
                        tempList.push(res.data.records[i])
                    }
                }
                for (let i = 0; i < tempList.length; i++) {
                    //当前日期=归还日期+1 更改状态 为已逾期 
                    if (dayjs(tempList[i].backAt).isBefore(dayjs())) {
                        await axiosInstance.post('/updateborrow', { record: tempList[i] }).then(() => {
                            reload()
                        })
                    }
                }
                console.log('res222', res.data.records)

                tabData.value = [...res.data.records].map((item, index) => ({
                    key: index,
                    recordId: item._id,
                    id: item.book._id,
                    bookname: item.book.bookname,
                    isbn: item.book.isbn,
                    userId: item.user._id,
                    bperson: item.user.username,
                    realBackTime: item.realBackTime ? (dayjs(item.realBackTime).format('YYYY-MM-DD hh:mm:ss')) : '暂无',
                    borrowtime: dayjs(item.createdAt).format('YYYY-MM-DD'),
                    backtime: dayjs(item.backAt).format('YYYY-MM-DD'),
                    status: statusList.value[item.status]
                }));
                console.log('tabData', tabData.value)
            }
        }).finally(() => {

            loading.value = false
            reloadPage.value = false
        })
    } catch (error) {
        console.log('error', error)
    }

})
const reload = async () => {
    try {
        reloadPage.value = true
        await axiosInstance.get('/showborrowlist').then(async (res) => {
            if (res) {
                const tempList = []
                for (let i = 0; i < res.data.records.length; i++) {
                    if (res.data.records[i].status === 0) {
                        tempList.push(res.data.records[i])
                    }
                }
                for (let i = 0; i < tempList.length; i++) {
                    //当前日期=归还日期+1 更改状态 为已逾期 
                    if (dayjs(tempList[i].backAt).isBefore(dayjs())) {
                        await axiosInstance.post('/updateborrow', { record: tempList[i] })
                    }
                }
                updateBorrow('init')
            }
        }).finally(() => {
            reloadPage.value = false
        })
    } catch (error) {
        console.log('error', error)
    }

}


const refresh = () => {
    try {
        loading.value = true
        setTimeout(async () => {
            const { data } = await axiosInstance.get('/showborrowlist')
            console.log('test', data.records)
            const tempList = []
            for (let i = 0; i < data.records.length; i++) {
                if (data.records[i].status === 0) {
                    tempList.push(data.records[i])
                }
            }
            console.log('test1', dayjs('2024-01-16').isBefore(dayjs()))
            for (let i = 0; i < tempList.length; i++) {
                //当前日期=归还日期+1 更改状态 为已逾期 
                if (dayjs(tempList[i].backAt).isBefore(dayjs())) {
                    await axiosInstance.post('/updateborrow', { record: tempList[i] })
                }
            }
            updateBorrow('init')
            loading.value = false
        }, 1000)

    } catch (error) {
        console.log(error)
    }
}




const columns = [
    {
        title: '书名',
        dataIndex: 'bookname',
        key: 'bookname',
        width: 150,
        ellipsis: true,
        customFilterDropdown: true,
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
        title: 'ISBN',
        dataIndex: 'isbn',
        key: 'isbn',
        ellipsis: true,
        customFilterDropdown: true,
        onFilter: (value, record) => record.isbn.toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownOpenChange: visible => {
            if (visible) {
                setTimeout(() => {
                    searchInput.value.focus();
                }, 100);
            }
        },
        width: 150,
        align: 'center'
    },
    {
        title: '借阅人',
        dataIndex: 'bperson',
        key: 'bperson',
        ellipsis: true,
        customFilterDropdown: true,
        onFilter: (value, record) => record.bperson.toString().includes(value),
        onFilterDropdownOpenChange: visible => {
            if (visible) {
                setTimeout(() => {
                    searchInput.value.focus();
                }, 100);
            }
        },
        width: 100,
        align: 'center'
    },
    {
        title: '借阅日期',
        dataIndex: 'borrowtime',
        key: 'borrowtime',
        width: 150,
        align: 'center'
    },
    {
        title: '还书日期',
        dataIndex: 'backtime',
        key: 'backtime',
        width: 150,
        align: 'center'
    },
    {
        title: '实际还书日期',
        dataIndex: 'realBackTime',
        key: 'realBackTime',
        width: 150,
        align: 'center'
    },
    {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        align: 'center'
    },
    {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        width: 100,
        align: 'center'
    },
];





const updateBorrow = async (action: string) => {
    try {
        const { data } = await axiosInstance.get('/showborrowlist')
        if (action === 'init') {
            tabData.value = [...data.records].map((item, index) => ({
                key: index,
                id: item.book._id,
                recordId: item._id,
                bookname: item.book.bookname,
                isbn: item.book.isbn,
                userId: item.user._id,
                bperson: item.user.username,
                borrowtime: dayjs(item.createdAt).format('YYYY-MM-DD'),
                realBackTime: item.realBackTime ? (dayjs(item.realBackTime).format('YYYY-MM-DD hh:mm:ss')) : '暂无',
                backtime: dayjs(item.backAt).format('YYYY-MM-DD'),
                status: statusList.value[item.status]
            }));
        }

    } catch (error) {
        const errors: any = error
        message
            .loading('loading..', 1.0)
            .then(
                () => message.error(errors.response.data.errors[0].msg, 2.0),
            )
    }

}


const state = reactive({
    searchText: '',
    searchedColumn: '',
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

</script>

<style lang="scss" scoped>
.card-container {
    width: 100%;
}

.card-container>.ant-tabs-card .ant-tabs-content {
    height: 120px;
    margin-top: -16px;
}

.card-container>.ant-tabs-card .ant-tabs-content>.ant-tabs-tabpane {
    padding: 16px;
    background: #fff;
}

.card-container>.ant-tabs-card>.ant-tabs-nav::before {
    display: none;
}

.card-container>.ant-tabs-card .ant-tabs-tab,
[data-theme='compact'] .card-container>.ant-tabs-card .ant-tabs-tab {
    background: transparent;
    border-color: transparent;
}

.card-container>.ant-tabs-card .ant-tabs-tab-active,
[data-theme='compact'] .card-container>.ant-tabs-card .ant-tabs-tab-active {
    background: #fff;
    border-color: #fff;
}

#components-tabs-demo-card-top .code-box-demo {
    padding: 24px;
    overflow: hidden;
    background: #f5f5f5;
}

[data-theme='compact'] .card-container>.ant-tabs-card .ant-tabs-content {
    height: 120px;
    margin-top: -8px;
}

[data-theme='dark'] .card-container>.ant-tabs-card .ant-tabs-tab {
    background: transparent;
    border-color: transparent;
}

[data-theme='dark'] #components-tabs-demo-card-top .code-box-demo {
    background: #000;
}

[data-theme='dark'] .card-container>.ant-tabs-card .ant-tabs-content>.ant-tabs-tabpane {
    background: #141414;
}

[data-theme='dark'] .card-container>.ant-tabs-card .ant-tabs-tab-active {
    background: #141414;
    border-color: #141414;
}

.borrow-page {
    width: 100%;
    display: flex;
    flex-direction: column;

}

.borrow-table {
    width: 87%;

    background-color: #fff;
    border-radius: 8px;
    margin: 20px;
}

.main-content {
    display: flex;
    flex-direction: row;
    background-color: #f0f2f5;

}
</style>