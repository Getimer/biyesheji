import { createStore } from 'vuex'

export default createStore({
  state: {

    isLogin: false,
    user: {}
  },
  getters: {
  },
  mutations: {
    setLoginStatus(state,status) {
      state.isLogin = status
      console.log('isLogin', state.isLogin)
    },
    setUser(state, value) {
      state.user = value
      console.log('value:', value)
    },
    logout(state) {
      state.user = ''
      window.location.replace('/')
    }
  },
  actions: {
  },
  modules: {
  }
})
