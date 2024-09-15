// src/axiosInstance.js
import axios from 'axios';

// 创建一个axios实例
const headUrl = 'http://localhost:3000'
const instance = axios.create({
    baseURL: '/', // 你的API基础URL
    timeout: 1000, // 请求超时时间
});

// 请求拦截器
instance.interceptors.request.use(
    config => {

        config.url = headUrl + config.url;

        return config;
    },
    error => {
        // 对请求错误做些什么
        return Promise.reject(error);
    }
);



export default instance;
