<template>
    <div class="login-page">
        <div class="login">
            <img src="../assets/login-bg1.jpg" />
            <div class="login-wrapper">
                <div class="part1" v-if="contentType === 'login'">
                    <a-form :model="formState" name="normal_login" style="width: 50%;margin: 50% auto 0 auto;"
                        class="login-form" @finish="login" @finishFailed="onFinishFailed">
                        <a-form-item label="账户：" name="username"
                            :rules="[{ required: true, message: 'Please input your username!' }]">
                            <a-input v-model:value="formState.username">
                                <template #prefix>
                                    <UserOutlined class="site-form-item-icon" />
                                </template>
                            </a-input>
                        </a-form-item>

                        <a-form-item label="密码：" name="password"
                            :rules="[{ required: true, message: 'Please input your password!' }]">
                            <a-input-password v-model:value="formState.password">
                                <template #prefix>
                                    <LockOutlined class="site-form-item-icon" />
                                </template>
                            </a-input-password>
                        </a-form-item>

                        <a-form-item>
                            <a-form-item name="remember" no-style>
                                <a-checkbox v-model:checked="formState.remember"
                                    style="margin-right: 50px;">记住我</a-checkbox>
                            </a-form-item>
                            <a class="login-form-forgot" @click="contentType = 'forget'"
                                style="margin-left: 70px;">忘记密码</a>
                        </a-form-item>

                        <a-form-item>
                            <a-button :disabled="disabled" type="primary" style="margin-right: 20px;" html-type="submit"
                                class="login-form-button">
                                登录
                            </a-button>
                            <a-button type="primary" @click="contentType = 'register'" style="margin-left: 20px;">
                                注册
                            </a-button>

                        </a-form-item>
                    </a-form>
                </div>
                <div class="part2" v-else-if="contentType === 'forget'">
                    <a-form :model="forgetState" name="normal_login" style="width: 50%;margin: 50% auto 0 auto;"
                        class="login-form" @finish="forgetPassword" @finishFailed="onFinishFailed">
                        <a-form-item label="邮箱：" name="email"
                            :rules="[{ required: true, message: 'Please input your email!' }]">
                            <a-input v-model:value="forgetState.email">
                                <template #prefix>
                                    <MailOutlined class="site-form-item-icon" />
                                </template>
                            </a-input>
                        </a-form-item>

                        <a-form-item label="验证码：" name="captcha"
                            :rules="[{ required: true, message: 'Please input your captcha!' }]">
                            <a-input-search v-model:value="forgetState.captcha" size="middle">
                                <template #enterButton>
                                    <a-button :disabled="forgetState.email ? false : true">
                                        <a-statistic-countdown v-show="showText" :valueStyle="{ fontSize: '12px' }"
                                            :value="deadline" @finish="onFinishCaptcha" format="s 秒" />
                                        <span v-show="!showText" @click="getCaptcha('forget')">获取验证码</span>
                                    </a-button>
                                </template>
                            </a-input-search>
                        </a-form-item>
                        <a-form-item label="密码：" name="password"
                            :rules="[{ required: true, message: 'Please input your password!' }]">
                            <a-input-password v-model:value="forgetState.password">
                                <template #prefix>
                                    <LockOutlined class="site-form-item-icon" />
                                </template>
                            </a-input-password>
                        </a-form-item>
                        <a-form-item label="确认密码：" name="confirm"
                            :rules="[{ required: true, message: 'Please input your password again!' }]">
                            <a-input-password v-model:value="forgetState.confirm">
                                <template #prefix>
                                    <LockOutlined class="site-form-item-icon" />
                                </template>
                            </a-input-password>
                        </a-form-item>


                        <a-form-item>
                            <a-button style="margin-right: 20px;" class="login-form-button"
                                @click="contentType = 'login'">
                                返回
                            </a-button>
                            <a-button type="primary" :disabled="disabled1" style="margin-left: 20px;"
                                html-type="submit">
                                确认
                            </a-button>
                        </a-form-item>
                    </a-form>
                </div>
                <div class="part3" v-else>
                    <a-form :model="registerState" name="normal_login" style="width: 50%;margin: 50% auto 0 auto;"
                        class="login-form" @finish="register" @finishFailed="onFinishFailed">
                        <a-form-item label="邮箱：" name="email"
                            :rules="[{ required: true, message: 'Please input your email!' }]">
                            <a-input v-model:value="registerState.email">
                                <template #prefix>
                                    <MailOutlined class="site-form-item-icon" />
                                </template>
                            </a-input>
                        </a-form-item>

                        <a-form-item label="验证码：" name="captcha"
                            :rules="[{ required: true, message: 'Please input your captcha!' }]">
                            <a-input-search v-model:value="registerState.captcha" size="middle">
                                <template #enterButton>
                                    <a-button :disabled="registerState.email ? false : true">
                                        <a-statistic-countdown v-show="showText" :valueStyle="{ fontSize: '12px' }"
                                            :value="deadline" @finish="onFinishCaptcha" format="s 秒" />
                                        <span v-show="!showText" @click="getCaptcha('register')">获取验证码</span>
                                    </a-button>
                                </template>
                            </a-input-search>
                        </a-form-item>
                        <a-form-item label="账户：" name="username"
                            :rules="[{ required: true, message: 'Please input your username!' }]">
                            <a-input v-model:value="registerState.username">
                                <template #prefix>
                                    <UserOutlined class="site-form-item-icon" />
                                </template>
                            </a-input>
                        </a-form-item>
                        <a-form-item label="密码：" name="password"
                            :rules="[{ required: true, message: 'Please input your password!' }]">
                            <a-input-password v-model:value="registerState.password">
                                <template #prefix>
                                    <LockOutlined class="site-form-item-icon" />
                                </template>
                            </a-input-password>
                        </a-form-item>


                        <a-form-item>
                            <a-button style="margin-right: 20px;" class="login-form-button"
                                @click="contentType = 'login'">
                                返回
                            </a-button>
                            <a-button type="primary" :disabled="disabled2" style="margin-left: 20px;"
                                html-type="submit">
                                注册
                            </a-button>
                        </a-form-item>
                    </a-form>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import axios from 'axios';
import { computed, ref, onBeforeMount, onMounted } from 'vue';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons-vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';

import axiosInstance from '../axiosInstance';





const store = useStore()
const router = useRouter()
let contentType = ref<string>('login')
let showText = ref<boolean>(false)
interface FormState {
    username: string;
    password: string;
    remember: boolean;
}
interface ForgetState {
    email: string;
    captcha: string;
    password: string;
    confirm: string;
}
interface RegisterState {
    email: string;
    captcha: string;
    username: string;
    password: string;

}
const forgetState = ref<ForgetState>({
    email: '',
    captcha: '',
    password: '',
    confirm: '',
})
const formState = ref<FormState>({
    username: '',
    password: '',
    remember: true,
});
const registerState = ref<RegisterState>({
    email: '',
    captcha: '',
    username: '',
    password: ''
})
onBeforeMount(() => {
    if (localStorage.getItem('user')) {
        store.commit('setUser', JSON.parse(localStorage.getItem('user')!))
        formState.value.remember = true
        formState.value.username = JSON.parse(localStorage.getItem('user')!).username
        formState.value.password = JSON.parse(localStorage.getItem('user')!).password
        message
            .loading('loading..', 2.5)
            .then(
                () => message.success('登录成功', 1.5)
            )
            .then(() => {
                console.log('1111', store.state.user.identity)
                if (store.state.user.identity === 0) {
                    router.push({
                        path: '/bookmanage'
                    })
                } else if (store.state.user.identity === 1) {
                    router.push({
                        path: '/admin/bookmanage'
                    })
                }


            })
    }

})



let captcha = ''
const deadline = ref<number>()
const login = async (values: any) => {
    console.log('Success:', values);
    try {
        const { data } = await axiosInstance.post('/login', {
            user: {
                username: values.username,
                password: values.password,
            }
        })
        console.log('data', data)
        console.log('user', data.user)
        if (values.remember) {
            localStorage.setItem('user', JSON.stringify(data.user))
        } else {
            localStorage.removeItem('user')
        }
        store.commit('setUser', data.user)
        store.commit('setLoginStatus', true)
        message
            .loading('loading..', 2.5)
            .then(
                () => message.success('登录成功', 1.5)

            )
            .then(() => {
                console.log('store.state.user.role.identity', store.state.user.role.identity)
                if (store.state.user.role.identity === 0) {
                    router.push({
                        path: '/bookmanage'
                    })
                } else if (store.state.user.role.identity === 1) {
                    router.push({
                        path: '/admin/analysis'
                    })
                }
            })

    } catch (error) {
        const errors: any = error
        message
            .loading('loading..', 2.5)
            .then(
                () => message.error(errors.response.data.errors[0].msg, 2.5),
            )
    }


};

const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
};
const disabled = computed(() => {
    return !(formState.value.username && formState.value.password);
});
const disabled1 = computed(() => {
    return !(forgetState.value.email && forgetState.value.password && forgetState.value.confirm && forgetState.value.captcha);
});
const disabled2 = computed(() => {
    return !(registerState.value.email && registerState.value.password && registerState.value.username && registerState.value.captcha);
});
const onFinishCaptcha = () => {
    showText.value = false
    console.log('finished!');
};
const forgetPassword = async (values: any) => {
    console.log('values', values)
    console.log('values', captcha)
    if (captcha === forgetState.value.captcha) {
        if (forgetState.value.password === forgetState.value.confirm) {
            try {
                const { data } = await axiosInstance.post('/updatepassword', {
                    email: forgetState.value.email,
                    password: forgetState.value.password
                })
                if (data.msg === 'success') {
                    message.loading('loading', 1.5).then(() => {
                        message.success('重置密码成功！', 1.5)
                        router.push({
                            path: '/'
                        })
                    })

                }
            } catch (error) {
                const errors: any = error
                message.error(errors.response.data.errors, 1.5)
            }

        } else {
            message.error('两次输入的密码不一致', 1.5)
        }

    } else {
        message.error('验证码错误', 1.3)
    }

}
const register = async (values: any) => {
    console.log('values', values)
    console.log('values', captcha)
    if (captcha === registerState.value.captcha) {
        try {
            const { data } = await axiosInstance.post('/register', {
                email: registerState.value.email,
                username: registerState.value.username,
                password: registerState.value.password,

            })
            if (data.msg === 'success') {
                message.loading('loading', 1.5).then(() => {
                    message.success('注册成功！', 2.0)
                }).then(() => {
                    contentType.value = 'login'
                })
            }
        } catch (error) {
            const errors: any = error
            message.error(errors.response.data, 1.5)
        }
    } else {
        message.error('验证码错误', 1.3)
    }

}
const getCaptcha = async (type: string) => {
    if (type === 'forget') {
        if (forgetState.value.email) {
            try {
                const { data } = await axiosInstance.post('http://localhost:3000/getCaptcha', {
                    email: forgetState.value.email,
                    type: '修改密码'
                })
                captcha = data.captcha
                deadline.value = Date.now() + 21 * 60 * 24;
                showText.value = true
            } catch (error) {
                const errors: any = error
                message.error(errors.response.data.errors, 1.5)
            }

        } else {
            message.error('请先输入邮箱', 1.2)
        }
    } else if (type === 'register') {
        if (registerState.value.email) {
            try {
                const { data } = await axiosInstance.post('http://localhost:3000/getCaptcha', {
                    email: registerState.value.email,
                    type: '注册账号',
                })
                captcha = data.captcha
                deadline.value = Date.now() + 21 * 60 * 24;
                showText.value = true
            } catch (error) {
                const errors: any = error
                message.error(errors.response.data.errors, 1.5)
            }

        } else {
            message.error('请先输入邮箱', 1.2)
        }
    }

}

</script>

<style lang="scss" scoped>
.login-page {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: rgb(227, 212, 191);
    background: linear-gradient(142deg, rgba(227, 212, 191, 1) 0%, rgba(243, 232, 216, 1) 100%);
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

    >.login {
        width: 60%;
        height: 650px;
        display: flex;
        flex-direction: row;
        background-color: #fff;
        border-radius: 10px;
        box-shadow: 2px 2px 14px rgba(0, 0, 0, 0.2);

        >img {
            width: 50%;
            border-radius: 10px 0 0 10px;
        }

        >.login-wrapper {
            @keyframes gradient {
                0% {
                    background-position: 0 12%;
                }

                50% {
                    background-position: 100% 100%;
                }

                100% {
                    background-position: 0 12%;
                }
            }


            //background: rgb(135,206,235);
            background: linear-gradient(142deg, rgba(135, 206, 235, 0.3) 0%, rgba(211, 211, 211, 0.3) 33%, rgba(152, 251, 152, 0.3) 54%, rgba(218, 129, 129, 0.3) 75%, rgba(247, 187, 97, 0.3) 100%);
            background-size: 200% 200%;
            border-radius: 0 10px 10px 0;
            animation: gradient 8s ease infinite;

            width: 50%;
            height: 100%;

        }

        >.login-btn {
            margin: 5px;
            width: 60px;
            background-color: #f8f8f8;
        }
    }
}

.part2 {
    margin-top: -10px;
}
</style>