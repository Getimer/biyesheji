/* eslint-disable */

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.png' {
  const src: string;
  export default src;
}
declare module 'vue-quill-editor'{
  const vueQuillEditor: any;
  export default vueQuillEditor;
}

