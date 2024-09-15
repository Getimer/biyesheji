<template>
    <div class="sidebar">
        <div class="sideitem" v-for="(item, index) in items" :key="index" :class="{ selected: item.selected }">
            <router-link :to="item.url">
                <div class="fonts" :class="{ selectedfont: item.selected }">
                    <img :src="item.image" />
                    <span style="margin-left: 5px;">{{ item.text }}</span>
                </div>
            </router-link>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue';
import bookImage from '@/assets/book.png'
import userImage from '@/assets/user.png'
import borrowImage from '@/assets/borrow.png'
import noticeImage from '@/assets/notice.png'
import analysisImage from '@/assets/analysis.png'
const props = defineProps({
    url: {
        type: String,
        require: true
    }
})
interface Item {
    id: number;
    text: string;
    url: string;
    selected: boolean;
    image: string;
}
const items = ref<Item[]>([
    {
        id: 4,
        text: '数据分析',
        url: '/admin/analysis',
        selected: false,
        image: analysisImage
    },
    {
        id: 1,
        text: '图书管理',
        url: '/admin/bookmanage',
        selected: false,
        image: bookImage
    },
    {
        id: 2,
        text: '用户管理',
        url: '/admin/user',
        selected: false,
        image: userImage
    },
    {
        id: 3,
        text: '借阅管理',
        url: '/admin/borrow',
        selected: false,
        image: borrowImage
    },
    {
        id: 4,
        text: '通知提醒',
        url: '/admin/notice',
        selected: false,
        image: noticeImage
    }
])
onBeforeMount(() => {
    items.value.forEach(item => {
        if (item.url === props.url) {
            item.selected = true
        }
    });
})


</script>
<style lang="scss" scoped>
.sidebar {
    width: 197px;
    height: 94vh;
    border-right: 1px solid #f6f6f6;
    background-color: #fff;
    z-index: 999;
}

.sideitem {

    width: 90%;
    height: 30px;
    //padding: 5px;
    margin: 10px;
    border-radius: 4px;

}

.selected {

    background: rgb(64, 158, 255);
    background: linear-gradient(142deg, rgba(64, 158, 255, 0.7147233893557423) 0%, rgba(64, 158, 255, 0.9416141456582633) 100%);
}

.fonts {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-left: 30px;
    color: black;
    position: relative;

    >img {
        position: absolute;
        width: 16px;
        height: 16px;
        left: -25px;
        margin-left: 10px;
    }
}

.selectedfont {
    color: #fff
}
</style>