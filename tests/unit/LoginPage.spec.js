import { shallowMount } from '@vue/test-utils'
import LoginPage from '@/views/LoginPage.vue'

describe('LoginPage.vue', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(LoginPage)
    expect(wrapper.element).toMatchSnapshot();
  })
})
