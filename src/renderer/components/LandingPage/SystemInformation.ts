import Vue from 'vue'
import Component from 'vue-class-component'
import {remote} from 'electron'
import ModuleService from '../../../main/services/module/module.service';

@Component
export default class SystemInformation extends Vue {
    electron = process.versions.electron;
    name = 'landing-page';
    node = process.versions.node;
    path = '/';
    platform = require('os').platform();
    vue = require('vue/package.json').version;
    modules = this.$container.get<ModuleService>(ModuleService.name).getAll();
    module = this.$container.get<ModuleService>(ModuleService.name).get('module-template', '2.0.0');

    mounted() {
        console.log(this.module);
        this.module.init();
    }
}
