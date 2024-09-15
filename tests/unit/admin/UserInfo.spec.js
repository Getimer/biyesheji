import { shallowMount } from '@vue/test-utils'
import UserInfo from '@/views/admin/UserInfo.vue'


describe('UserInfo.vue', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(UserInfo)
    expect(wrapper.element).toMatchSnapshot();
  })
})
