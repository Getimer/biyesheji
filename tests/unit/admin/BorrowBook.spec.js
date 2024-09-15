import { shallowMount } from '@vue/test-utils'
import BorrowBook from '@/views/admin/BorrowBook.vue'


describe('BorrowBook.vue', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(BorrowBook)
    expect(wrapper.element).toMatchSnapshot();
  })
})
