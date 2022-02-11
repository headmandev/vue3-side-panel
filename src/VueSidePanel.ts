import { Plugin } from 'vue';
import SidePanel from './components/SidePanel.vue';

export default {
  install(app) {
    app.component('VueSidePanel', SidePanel);
  },
} as Plugin;
