<template>
    <div v-if="reloadPage" style="width: 100vw;height: 100vh;">
        <ReloadPage style="display: flex;justify-content: center;align-items: center;"></ReloadPage>
    </div>
    <div v-else class="borrow-page">
        <TopMenu @enterFullscreen="enterFullscreen" @exitFullscreen="exitFullscreen" @reload="reload"></TopMenu>
        <div class="main-content">
            <SideBar :url="'/borrow'"></SideBar>

            <div class="borrowform">
                <div v-if="btnVisibile" class="overlay" @click.stop></div>
                <div class="card-container" v-if="preview">
                    <a-button type="primary" style="position: absolute;left: 42.5%;top: 13%;z-index: 999"
                        @click="previewBook(formState.id)"
                        :disabled="!(formState.bookName && formState.isbn && formState.date1)">在线预览</a-button>
                    <a-tabs v-model:activeKey="activeKey" type="card" @change="backBookReset">
                        <a-tab-pane key="1" tab="预约图书" style="width: 50%;">
                            <a-form style="width: 100%;height: 50%;margin:50% 0 0 50%;" ref="formRef" :model="formState"
                                :label-col="labelCol" :wrapper-col="wrapperCol">
                                <a-form-item ref="bookName" label="书名：" name="bookName">
                                    <a-input v-model:value="formState.bookName" />
                                </a-form-item>
                                <a-form-item ref="isbn" label="ISBN：" name="isbn">
                                    <a-input v-model:value="formState.isbn" />
                                </a-form-item>

                                <a-form-item label="还书日期：" name="date1">
                                    <a-date-picker v-model:value="formState.date1" type="date" placeholder="Pick a date"
                                        style="width: 100%" />

                                </a-form-item>
                                <a-form-item :wrapper-col="{ span: 14, offset: 8 }">
                                    <a-button type="primary" :disabled="!(formState.bookName && formState.isbn && formState.date1)" @click="onSubmit('借阅')">预约</a-button>
                                    <a-button style="margin-left: 50px" @click="resetForm">重置</a-button>

                                </a-form-item>
                            </a-form>

                        </a-tab-pane>
                        <!-- <a-tab-pane key="2" tab="还书" style="width: 50%;">
                            <a-form style="width: 100%;height: 50%;margin:50% 0 0 50%;" ref="formRef" :model="formState"
                                :label-col="labelCol" :wrapper-col="wrapperCol">
                                <a-form-item ref="bookName" label="书名：" name="bookName">
                                    <a-input v-model:value="formState.bookName" />
                                </a-form-item>
                                <a-form-item ref="isbn" label="ISBN：" name="isbn">
                                    <a-input v-model:value="formState.isbn" />
                                </a-form-item>
                                <a-form-item :wrapper-col="{ span: 14, offset: 8 }">
                                    <a-button type="primary" @click="onSubmit('还书')">还书</a-button>
                                    <a-button style="margin-left: 50px" @click="resetForm">重置</a-button>
                                </a-form-item>
                            </a-form>
                        </a-tab-pane> -->

                    </a-tabs>
                </div>
                <div class="card-container" v-else>
                    <a-spin style="position: absolute;top: 50%;left: 30%;z-index: 9999;"
                        v-show="previewLoading"></a-spin>
                    <a-button type="primary" style="position: absolute;left: 42.5%;top: 13%;z-index: 999"
                        @click="preview = true">返回</a-button>
                    <div class="scroll-container" v-show="!previewLoading">
                        <div class="scroll-content">
                            <div v-for="(pre, index) in previewList" :key="index" style="width: 100%;">
                                <img :src="pre" style="width: 91%;" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="borrow-table">
                <a-table :columns="columns" :data-source="tabData"
                    :pagination="{ hideOnSinglePage: true, pageSize: 50 }" :scroll="{ y: 700 }" :loading="loading">
                    <template #bodyCell="{ text, column, record }">
                        <template v-if="column.dataIndex === 'bookname'">
                            {{ text }}
                        </template>
                        <template v-else-if="column.dataIndex === 'status'">
                            <span>
                                <a-tag :color="record.status.color">
                                    {{ record.status.status }}
                                </a-tag>
                            </span>
                        </template>
                    </template>

                </a-table>
            </div>

        </div>
        <a-float-button-group trigger="hover" type="primary" :style="{ right: '380px', bottom: '30px' }">

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
import { onBeforeMount } from 'vue';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { reactive, ref, toRaw } from 'vue';
import type { UnwrapRef } from 'vue';
import { useRouter } from 'vue-router'
import axios from 'axios';
import { useStore } from 'vuex';
import { message } from 'ant-design-vue';
import { UnorderedListOutlined, RedoOutlined } from '@ant-design/icons-vue';
import ReloadPage from '../components/reloadPage.vue'
interface FormState {
    bookName: string | undefined;
    date1: Dayjs | undefined;
    isbn: string | undefined;
    id: string | undefined;
}
interface TabData {
    key: number,
    bookname: string | undefined,
    isbn: string | undefined,
    bperson: string | undefined,
    borrowtime: Date | undefined,
    backtime: Date | undefined,
    status: number
}
const store = useStore()
const formRef = ref();
const preview = ref(true)
const previewLoading = ref(true)

const previewList = ref([])
const previewBook = async (bookId: string | undefined) => {
    console.log('bookid', bookId)
    preview.value = false
    setTimeout(async () => {
        previewLoading.value=false
        if (bookId) {
            await axios.get('http://localhost:3000/getbookprebyid?bookId=' + bookId).then((res) => {
                if (res.status === 200) {
                    previewList.value = JSON.parse(res.data.preview.replace(/'/g, '"'))
                }
            })
        } else {
            await axios.get('http://localhost:3000/getbookprebyisbn?isbn=' + formState.isbn).then((res) => {
                if (res.status === 200) {
                    previewList.value = JSON.parse(res.data.preview.replace(/'/g, '"'))
                }
            })
        }
    }, 1000)


}


const labelCol = { span: 7 };
const wrapperCol = { span: 15 };
const activeKey = ref('1');
const formState: UnwrapRef<FormState> = reactive({
    bookName: '',
    date1: undefined,
    isbn: '',
    id: ''
});
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
        await axios.get('http://localhost:3000/showborrowlist?userId=' + store.state.user._id).then(async (res) => {
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
                        await axios.post('http://localhost:3000/updateborrow', { record: tempList[i] })
                    }
                }
                updateBorrow('init')
            }
        }).finally(() => {
            reloadPage.value = false
        })

    } catch (error) {
        console.log(error)
    }
}


const router = useRouter()
let tabData: any = ref([])
const loading = ref<boolean>(true)
onBeforeMount(async () => {
    formState.bookName = router.currentRoute.value.query.bookname?.toString()
    formState.isbn = router.currentRoute.value.query.isbn?.toString()
    formState.id = router.currentRoute.value.query.id?.toString()
    loading.value = false
    reloadPage.value = true
    await axios.get('http://localhost:3000/showborrowlist?userId=' + store.state.user._id).then(async (res) => {
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
                    await axios.post('http://localhost:3000/updateborrow', { record: tempList[i] })
                }
            }
            updateBorrow('init')
        }
    }).finally(() => {
        reloadPage.value = false
    })

})

const refresh = () => {
    try {
        loading.value = true
        setTimeout(async () => {
            const { data } = await axios.get('http://localhost:3000/showborrowlist?userId=' + store.state.user._id)
            const tempList = []
            for (let i = 0; i < data.records.length; i++) {
                if (data.records[i].status === 0) {
                    tempList.push(data.records[i])
                }
            }
            for (let i = 0; i < tempList.length; i++) {
                console.log('test1', data.records[i].status)
                //当前日期=归还日期+1 更改状态 为已逾期 
                if (dayjs(tempList[i].backAt).isBefore(dayjs())) {
                    await axios.post('http://localhost:3000/updateborrow', { record: tempList[i] })
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
        width: 150,
    },
    {
        title: 'ISBN',
        dataIndex: 'isbn',
        width: 150,
    },
    {
        title: '借阅人',
        dataIndex: 'bperson',
        width: 100,
    },
    {
        title: '借阅日期',
        dataIndex: 'borrowtime',
        width: 150,
    },
    {
        title: '还书日期',
        dataIndex: 'backtime',
        width: 150,
    },
    {
        title: '状态',
        dataIndex: 'status',
        width: 100,
    },

];


const onSubmit = async (type: string) => {
    console.log('ffff',formState)
    btnVisibile.value=true
    if (type === '借阅') {
        try {
            if (isExist(formState.id, undefined)) {
                message.error('这本书你已经预约或借过了', 1.5)
                btnVisibile.value=false
            } else {
                let record
                if (router.currentRoute.value.query.id) {
                    record = {
                        book: router.currentRoute.value.query.id,
                        backAt: formRef.value.getFieldsValue().date1.$d,
                        isbn: formState.isbn,
                        user: store.state.user._id
                    }
                    console.log('record:', record)
                    await axios.post('http://localhost:3000/addborrow', { record, haveId: true })
                    updateBorrow('update')
                } else {
                    record = {
                        backAt: formRef.value.getFieldsValue().date1.$d,
                        isbn: formState.isbn,
                        user: store.state.user._id
                    }
                    const { data } = await axios.get('http://localhost:3000/showborrowlist?userId=' + store.state.user._id)
                    let flag
                    data.records.forEach((item: any) => {

                        if (item.book.isbn.toString() === formState.isbn && (item.status === 0 || item.status === 2)) {
                            flag = true
                        } else {
                            flag = false
                        }

                    })

                    if (flag) {
                        message.error('这本书你已经预约或借过了', 1.0)
                        btnVisibile.value=false
                    } else {
                        await axios.post('http://localhost:3000/addborrow', { record, haveId: false })
                        updateBorrow('update')
                    }
                }

            }
        } catch (error) {
            console.log('error', error)
            message.error('请检查所填信息是否正确', 1.5)
        }
    } else if (type === '还书') {
        if (isExist(undefined, formState.isbn)) {
            const record = {
                isbn: formState.isbn,
                user: store.state.user._id,
                status: 1
            }
            const { data } = await axios.post('http://localhost:3000/addback', { record })
            updateBorrow('back')
        } else {
            message.error('未查到借阅信息', 1.0)
        }
    }

};

const backBookReset = (e: string) => {
    console.log('e', typeof e)
    if (e === '2') {
        formRef.value.resetFields();
        formState.bookName = ''
        formState.isbn = ''
    } else {
        formState.isbn = router.currentRoute.value.query.isbn?.toString() || ""
        formState.bookName = router.currentRoute.value.query.bookname?.toString() || ""
    }

}
const resetForm = () => {
    console.log('重置了')
    formRef.value.resetFields();
    formState.bookName = ''
    formState.isbn = ''
};
const onBack = (key: number) => {
    console.log('key', key)
}
const btnVisibile=ref(false)
const updateBorrow = async (action: string) => {
    try {
       
        const { data } = await axios.get('http://localhost:3000/showborrowlist?userId=' + store.state.user._id)
        if (action === 'init') {
            console.log('status', statusList.value[0])
            tabData.value = [...data.records].map((item, index) => ({
                key: index,
                id: item.book._id,
                bookname: item.book.bookname,
                isbn: item.book.isbn,
                bperson: item.user.username,
                borrowtime: dayjs(item.createdAt).format('YYYY-MM-DD'),
                backtime: dayjs(item.backAt).format('YYYY-MM-DD'),
                status: statusList.value[item.status]
            }));
            btnVisibile.value=false
        } else if (action === 'update') {
            message
                .loading('loading..', 1.5)
                .then(
                    () => message.success('预约成功', 1.0)
                ).then(() => {
                    router.push('/borrow')
                    tabData.value = [...data.records].map((item, index) => ({
                        key: index,
                        bookname: item.book.bookname,
                        isbn: item.book.isbn,
                        bperson: item.user.username,
                        borrowtime: dayjs(item.createdAt).format('YYYY-MM-DD'),
                        backtime: dayjs(item.backAt).format('YYYY-MM-DD'),
                        status: statusList.value[item.status]
                    }));
                    resetForm()
                    btnVisibile.value=false
                })
        } else if (action === 'back') {
            message
                .loading('loading..', 1.5)
                .then(
                    () => message.success('归还成功', 1.0)
                ).then(() => {
                    tabData.value = [...data.records].map((item, index) => ({
                        key: index,
                        bookname: item.book.bookname,
                        isbn: item.book.isbn,
                        bperson: item.user.username,
                        borrowtime: dayjs(item.createdAt).format('YYYY-MM-DD'),
                        backtime: dayjs(item.backAt).format('YYYY-MM-DD'),
                        status: statusList.value[item.status]
                    }));
                    btnVisibile.value=false
                })
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

const isExist = (id: string | undefined, isbn: string | undefined) => {
    console.log('1122', id)
    console.log('22222', tabData.value)
    if (id) {
        for (let i = 0; i < tabData.value.length; i++) {
            if (tabData.value[i].id === id && tabData.value[i].status.status !== '已归还') {
                return true
            }
        }
    } else {
        for (let i = 0; i < tabData.value.length; i++) {
            if (tabData.value[i].isbn.toString() === isbn && tabData.value[i].status.status !== '已归还') {
                return true
            }
        }
    }



    return false

}
</script>

<style lang="scss" scoped>
.scroll-container {
    height: 850px;
    /* 设置容器高度 */
    overflow: hidden;
    /* 隐藏原生滚动条 */
    position: relative;
    /* 相对定位 */
}

.scroll-content {
    height: 100%;
    /* 设置内容高度为容器高度 */
    overflow-y: auto;
    /* 显示内容的垂直滚动条 */
    padding-right: 17px;
    /* 留出滚动条的空间 */
}

.scroll-content::-webkit-scrollbar {
    width: 0;
    /* 隐藏滚动条 */
}

.scroll-content::-webkit-scrollbar-track {
    display: none;
    /* 隐藏滚动条轨道 */
}

.scroll-content::-webkit-scrollbar-thumb {
    display: none;
    /* 隐藏滚动条手柄 */
}
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99999;
  background-color: rgba(255, 255, 255, 0.2); /* 半透明黑色背景 */
}
.scroll-content:before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 10px;
    /* 模拟滚动条宽度 */
    height: 100%;
    background: #fff;
    /* 模拟滚动条背景色 */
}






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

.borrowform {
    width: 36%;

    display: flex;
    flex-direction: column;

    font-size: 40px;

    background-color: #fff;
    border-radius: 10px;
    margin: 20px;

    >button {
        border: none;
        border-radius: 4px;
        margin-top: 20px;
        padding: 5px 10px;
        background-color: #1890FF;
        color: white;
        width: 10%;
    }
}

.borrow-table {
    width: 50%;

    background-color: #fff;
    border-radius: 10px;
    margin: 20px 20px 20px 0;
}

.main-content {
    display: flex;
    flex-direction: row;
    background-color: #f0f2f5;

}
</style>