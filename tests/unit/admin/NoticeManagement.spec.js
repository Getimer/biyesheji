import { shallowMount } from '@vue/test-utils'
import NoticeManagement from '@/views/admin/NoticeManagement.vue'

describe('NoticeManagement.vue', () => {
  it('renders correctly', async () => {
    const wrapper = shallowMount(NoticeManagement)
    expect(wrapper.element).toMatchSnapshot();
  })
})
