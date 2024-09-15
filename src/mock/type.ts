import Mock from 'mockjs'
import { addBaseUrl } from './utils'
Mock.mock(addBaseUrl('/showtypes'), 'get', {
    return: {

    }
})