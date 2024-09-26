<template>
  <el-form ref="form" v-bind="$attrs" :model="formInfo" :label-width="labelWidth" :rules="rules">
    <div v-if="config.isDev && showTips">
      {{ formInfo }}
    </div>
    <div v-if="config.isDev && showRules">
      {{ rules }}
    </div>
    <el-row>
      <slot />
    </el-row>
    <div class="d-flex a-center j-center">
      <slot name="operation" />
    </div>
  </el-form>
</template>

<script lang="ts">
import { defineComponent, VNode } from 'vue'

import { config } from '@/../config/config'
import initRules from './composables/rules'
import { forEachForest, getTextWidth } from '@/helper';
import { FormInstance } from 'element-plus';

export default defineComponent({
  provide() {
    return {
      formInfo: this.formInfo, //将formInfo注入到item中
    };
  },
  props: {
    /**
         * 表单数据
         */
    editData: {
      type: Object,
      default: () => ({})
    },
    /**
         * 是否formInfo打印,生产环境不生效
         */
    showTips: {
      type: Boolean,
      default: false,
    },
    /**
         * 展示rules,生产环境无效
         */
    showRules: {
      type: Boolean,
      default: false,
    },
  },
  setup(_, context) {
    const rules = initRules(context.slots);
    return {
      rules
    };
  },
  data() {
    return {
      formInfo: {} as Record<string, unknown>, //---搜索参数
      config, //------------------------------------配置信息
      labelWidth: '100px', //-----------------------表单label宽度
    };
  },
  watch: {
    editData: {
      handler(data) {
        Object.keys(data).forEach((key) => {
          this.formInfo[key] = data[key]
        });
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    this.initLabelWidth(); //初始化label的宽度
    this.initFormData(); //初始化表单数据绑定
  },
  methods: {
    //初始化label的宽度
    initLabelWidth() {
      const formItems: VNode[] = [];
      if (this.$slots.default) {
        const allSlots = this.$slots.default();
        forEachForest<VNode>(allSlots, (slot: VNode) => {
          const slotType = slot.type;
          if (typeof slotType === 'object' && (slotType as Record<string, unknown>).name) {
            formItems.push(slot);
          }
        })
      }
      const formDom: HTMLElement = this.$el;
      const labelDom = formDom.querySelector('.el-form-item__label') || document.body;
      const styleList = window.getComputedStyle(labelDom);
      const { font } = styleList;
      // eslint-disable-next-line prefer-spread
      const maxLabelWidth = Math.max.apply(Math, formItems.map((val) => {
        const { props } = val;
        const label: string = props ? (props.label || '') : '';
        const labelWidth = getTextWidth(label, font)
        return labelWidth;
      }));
      const realWidth = maxLabelWidth < 100 ? 100 : maxLabelWidth;
      this.labelWidth = `${Math.ceil(realWidth)}px`
    },
    //初始化表单参数
    initFormData() {
      if (this.$slots.default) {
        const allSlots = this.$slots.default();
        forEachForest<VNode>(allSlots, (slot: VNode) => {
          const slotType = slot.type;
          const { props } = slot;
          if (typeof slotType === 'object' && (slotType as Record<string, unknown>).name) {
            if (props && props.prop && !this.formInfo[props.prop]) {
              this.formInfo[props.prop] = null;
            }
          }
        })
      }
    },
    //手动校验
    validate(fn: () => void) {
      (this.$refs.form as FormInstance).validate(fn);
    },
  },
})
</script>

<style lang="scss" scoped></style>
