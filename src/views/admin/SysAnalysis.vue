<template>
    <div v-show="reloadPage" style="width: 100vw;height: 100vh;position: absolute;z-index: 9999;">
        <ReloadPage style="display: flex;justify-content: center;align-items: center;"></ReloadPage>
    </div>
    <div class="content">
        <TopMenu @enterFullscreen="enterFullscreen" @exitFullscreen="exitFullscreen" @reload="reload"></TopMenu>
        <div class="main-content">
            <SideBar :url="'/admin/analysis'"></SideBar>
            <div class="userinfo">
                <div style="background-color: #f0f2f5; padding-bottom: 20px">
                    <a-row :gutter="16">
                        <a-col :span="8">
                            <a-card title="用户数量" :bordered="false">
                                <p>{{ userCount }}<text> 人</text></p>
                            </a-card>
                        </a-col>
                        <a-col :span="8">
                            <a-card title="图书数量" :bordered="false">
                                <p>{{ bookCount }}<text> 本</text></p>
                            </a-card>
                        </a-col>
                        <a-col :span="8">
                            <a-card title="用户借阅数量" :bordered="false">
                                <p>{{ borrowCount }}<text> 本</text></p>
                            </a-card>
                        </a-col>
                    </a-row>
                </div>



                <div style="width: 100%;display: flex;background-color: #fff;padding: 10px;border-radius: 8px;">
                    <a-range-picker v-model:value="timeRange" style="width: 300px;margin-right: 5px;" :locale="locale"
                        :placeholder="['开始时间', '结束时间']" />
                    <a-button style="margin-right: 5px;" @click="initChart">查询</a-button>
                    <a-button @click="resetTime">重置</a-button>
                </div>

                <div class="countmessage" ref="countmessage">

                </div>
                <a-spin style="position: absolute;top:55%;left: 55%;" size="large" v-show="loading" tip="加载中···" />
            </div>
        </div>


    </div>
</template>

<script lang="ts" setup>
import SideBar from './components/SideBar.vue';
import TopMenu from './components/TopMenu.vue';
import { ref, onMounted, onBeforeUnmount } from 'vue';
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
import dayjs from 'dayjs';
import { message } from 'ant-design-vue';

import ReloadPage from '../../components/reloadPage.vue'
import * as echarts from 'echarts/core';
import { TooltipComponent, LegendComponent, GridComponent, TitleComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import type { Dayjs } from 'dayjs';
import axiosInstance from '../../axiosInstance';
type RangeValue = [Dayjs, Dayjs];
const timeRange = ref<RangeValue>([dayjs().subtract(20, 'day'), dayjs()]);
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
const countmessage = ref()
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

let myChart2: any = null
const userCount = ref<number>(0)
const bookCount = ref<number>(0)
const borrowCount = ref<number>(0)
const loading = ref(false)
const resetTime = () => {
    timeRange.value = [dayjs().subtract(20, 'day'), dayjs()];
    initChart()
}

const reload = async () => {
    try {
        reloadPage.value = true
        let timeArray: any[] = []
        let dataArray: number[] = []
        let timeLength = timeRange.value[1].diff(timeRange.value[0]) / 24 / 60 / 60 / 1000
        for (let i = 0; i <= timeLength; i++) {
            timeArray.push(timeRange.value[0].add(i, 'day').format('YYYY-MM-DD'))
        }
        let data1: any = {}, data2: any = {}, data3: any = {}
        try {
            data1 = (await axiosInstance.get('/showusers?delay=false')).data
            data2 = (await axiosInstance.get('/showbooks?delay=false')).data
            data3 = (await axiosInstance.get('/showborrowlist?delay=false')).data

        } catch (error) {
            const errors: any = error
            message.error(errors, 1.0)
        }
        for (let i = 0; i < timeArray.length; i++) {
            let tempArray = data3.records.filter((item: any) => {
                return dayjs(item.createdAt).format('YYYY-MM-DD') === timeArray[i]
            })
            dataArray.push(tempArray.length)
        }
        let option2 = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    lineStyle: {
                        width: 1,
                        color: '#019680',
                    },
                },
            },
            legend: {
                data: ['用户借阅数'],
                top: '10px'
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: timeArray,
                splitLine: {
                    show: false
                },
                axisTick: {
                    show: false,
                },
            },
            yAxis: [
                {
                    type: 'value',
                    splitNumber: 4,
                    axisTick: {
                        show: false,
                    },
                    splitArea: {
                        show: true,
                        areaStyle: {
                            color: ['rgba(255,255,255,0.2)', 'rgba(226,226,226,0.2)'],
                        },
                    },
                },
            ],
            grid: { left: '4%', right: '4%', top: '2%', bottom: 0, containLabel: true },
            series: [
                {
                    smooth: true,
                    name: '用户借阅数',
                    data: dataArray,
                    type: 'line',
                    areaStyle: {},
                    itemStyle: {
                        color: '#5ab1ef',
                    },
                },
            ],
        }
        setTimeout(() => {
            reloadPage.value = false
            animateNumberToUser(data1.users.length)
            animateNumberToBook(data2.books.length)
            animateNumberToRecord(data3.records.length)
            option2 && myChart2.setOption(option2);

        }, 1500)

    } catch (error) {
        console.log(error)
    }
}



const initChart = async () => {
    loading.value = true
    let timeArray: any[] = []
    let dataArray: number[] = []
    let timeLength = timeRange.value[1].diff(timeRange.value[0]) / 24 / 60 / 60 / 1000
    for (let i = 0; i <= timeLength; i++) {
        timeArray.push(timeRange.value[0].add(i, 'day').format('YYYY-MM-DD'))
    }
    let data3: any = {}
    try {
        data3 = (await axiosInstance.get('/showborrowlist?delay=false')).data
    } catch (error) {
        const errors: any = error
        message.error(errors, 1.0)
    }
    for (let i = 0; i < timeArray.length; i++) {
        let tempArray = data3.records.filter((item: any) => {
            return dayjs(item.createdAt).format('YYYY-MM-DD') === timeArray[i]
        })
        dataArray.push(tempArray.length)
    }
    let option2 = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                lineStyle: {
                    width: 1,
                    color: '#019680',
                },
            },
        },
        legend: {
            data: ['用户借阅数'],
            top: '10px'
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: timeArray,
            splitLine: {
                show: false
            },
            axisTick: {
                show: false,
            },
        },
        yAxis: [
            {
                type: 'value',
                splitNumber: 4,
                axisTick: {
                    show: false,
                },
                splitArea: {
                    show: true,
                    areaStyle: {
                        color: ['rgba(255,255,255,0.2)', 'rgba(226,226,226,0.2)'],
                    },
                },
            },
        ],
        grid: { left: '4%', right: '4%', top: '2%', bottom: 0, containLabel: true },
        series: [
            {
                smooth: true,
                name: '用户借阅数',
                data: dataArray,
                type: 'line',
                areaStyle: {},
                itemStyle: {
                    color: '#5ab1ef',
                },
            },
        ],
    }
    setTimeout(() => {

        loading.value = false
        option2 && myChart2.setOption(option2);
    }, 1500)


}



onMounted(async () => {
    reloadPage.value = true
    myChart2 = echarts.init(countmessage.value);
    let timeArray: any[] = []
    let dataArray: number[] = []
    let timeLength = timeRange.value[1].diff(timeRange.value[0]) / 24 / 60 / 60 / 1000
    for (let i = 0; i <= timeLength; i++) {
        timeArray.push(timeRange.value[0].add(i, 'day').format('YYYY-MM-DD'))
    }
    let data1: any = {}, data2: any = {}, data3: any = {}
    try {
        data1 = (await axiosInstance.get('/showusers?delay=false')).data
        data2 = (await axiosInstance.get('/showbooks?delay=false')).data
        data3 = (await axiosInstance.get('/showborrowlist?delay=false')).data

    } catch (error) {
        const errors: any = error
        message.error(errors, 1.0)
    }
    for (let i = 0; i < timeArray.length; i++) {
        let tempArray = data3.records.filter((item: any) => {
            return dayjs(item.createdAt).format('YYYY-MM-DD') === timeArray[i]
        })
        dataArray.push(tempArray.length)
    }
    let option2 = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                lineStyle: {
                    width: 1,
                    color: '#019680',
                },
            },
        },
        legend: {
            data: ['用户借阅数'],
            top: '10px'
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: timeArray,
            splitLine: {
                show: false
            },
            axisTick: {
                show: false,
            },
        },
        yAxis: [
            {
                type: 'value',
                splitNumber: 4,
                axisTick: {
                    show: false,
                },
                splitArea: {
                    show: true,
                    areaStyle: {
                        color: ['rgba(255,255,255,0.2)', 'rgba(226,226,226,0.2)'],
                    },
                },
            },
        ],
        grid: { left: '4%', right: '4%', top: '2%', bottom: 0, containLabel: true },
        series: [
            {
                smooth: true,
                name: '用户借阅数',
                data: dataArray,
                type: 'line',
                areaStyle: {},
                itemStyle: {
                    color: '#5ab1ef',
                },
            },
        ],
    }
    setTimeout(() => {
        reloadPage.value = false
        animateNumberToUser(data1.users.length)
        animateNumberToBook(data2.books.length)
        animateNumberToRecord(data3.records.length)
        option2 && myChart2.setOption(option2);
    }, 1500)
})
const animateNumberToUser = (targetNumber: number) => {
    const interval = setInterval(() => {

        if (userCount.value < targetNumber) {
            userCount.value++;
        } else {
            clearInterval(interval);
        }
    }, 10);
}

const animateNumberToBook = (targetNumber: number) => {
    const interval = setInterval(() => {

        if (bookCount.value < targetNumber) {
            bookCount.value++;
        } else {
            clearInterval(interval);
        }
    }, 10);
}
const animateNumberToRecord = (targetNumber: number) => {
    const interval = setInterval(() => {

        if (borrowCount.value < targetNumber) {
            borrowCount.value++;
        } else {
            clearInterval(interval);
        }
    }, 10);
}

onBeforeUnmount(() => {
    if (myChart2) {

        myChart2.dispose()
    }
})
</script>
<style lang="scss" scoped>
/* you can make up upload button and sample style by using stylesheets */


.userinfo {
    width: 87%;
    background-color: #f8f8f8;
    height: 89vh;
    display: flex;
    flex-direction: column;
    margin: 20px;
    border-radius: 8px;

    >.countmessage {
        width: 100%;
        height: 100%;
        padding: 50px;
        //   margin-top: 32px;
        background-color: #fff;
        border-radius: 8px;
        overflow: hidden;
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