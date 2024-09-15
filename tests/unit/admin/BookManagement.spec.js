import { shallowMount } from '@vue/test-utils'
import BookManagement from '@/views/BookManagement.vue'

describe('BookManagement.vue', () => {
  const wrapper = shallowMount(BookManagement)
  it('renders correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  })
})
