<script lang="ts">
import {
  defineComponent,
  onBeforeMount,
  onBeforeUnmount,
  PropType,
  watch,
  ref,
  computed,
  onMounted,
  nextTick,
} from 'vue';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import SidePanelCloseButton from './SidePanelCloseButton.vue';

export default defineComponent({
  name: 'VueSidePanel',
  components: {
    SidePanelCloseButton,
  },
  props: {
    idName: {
      type: String as PropType<string>,
      default: 'vsp-container',
    },
    hideCloseBtn: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    noClose: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    side: {
      type: String as PropType<string>,
      validator: (value: string) => ['top', 'right', 'bottom', 'left'].includes(value),
      default: 'right',
    },
    rerender: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    zIndex: {
      type: [Number, String] as PropType<number | 'auto' | undefined>,
      default: 'auto',
    },
    width: {
      type: String as PropType<string>,
      default: 'auto',
    },
    height: {
      type: String as PropType<string>,
      default: 'auto',
    },
    lockScroll: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    lockScrollHtml: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
    modelValue: {
      type: Boolean as PropType<boolean>,
      default: false,
      required: true,
    },
    overlayColor: {
      type: String as PropType<string>,
      default: 'black',
    },
    overlayOpacity: {
      type: Number as PropType<number>,
      default: 0.5,
    },
    overlayDuration: {
      type: Number as PropType<number>,
      default: 500,
    },
    panelColor: {
      type: String as PropType<string>,
      default: 'white',
    },
    panelDuration: {
      type: Number as PropType<number>,
      default: 300,
    },
    transitionName: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    headerClass: {
      type: String as PropType<string>,
      default: '',
    },
    bodyClass: {
      type: String as PropType<string>,
      default: '',
    },
    footerClass: {
      type: String as PropType<string>,
      default: '',
    },
  },
  emits: ['update:modelValue', 'closed', 'opened'],
  setup(props, { emit, attrs }) {
    let teleportContainer = undefined as HTMLDivElement | undefined;
    const panel = ref<HTMLElement | null>(null);
    const overlay = ref<HTMLElement | null>(null);
    const footer = ref<HTMLElement | null>(null);
    const header = ref<HTMLElement | null>(null);
    const body = ref<HTMLElement | null>(null);
    const footerHeight = ref(0);
    const bodyScrollHeight = ref(0);
    const headerHeight = ref(0);
    const panelHeight = ref(0);
    const windowHeight = ref(0);
    const zIndex = ref<number>();
    const isBodyAlreadyLocked = ref(false);

    const calculateRightSize = async () => {
      if (window?.innerHeight > 0) windowHeight.value = window.innerHeight;

      footerHeight.value = footer.value ? footer.value.clientHeight : 0;
      headerHeight.value = header.value ? header.value.clientHeight : 0;
      bodyScrollHeight.value = body.value ? body.value.scrollHeight : 0;
      panelHeight.value = panel.value ? panel.value.clientHeight : 0;
    };

    const closePanel = () => emit('update:modelValue', false);

    const lockUnlockBodyScroll = (elem: HTMLElement, lock: boolean) => {
      if (lock) {
        setTimeout(() => {
          disableBodyScroll(elem, { reserveScrollBarGap: true });
          if (props.lockScrollHtml) document.documentElement.style.overflow = 'hidden';
        }, 0);
        return;
      }

      enableBodyScroll(elem);
      if (props.lockScrollHtml) document.documentElement.style.removeProperty('overflow');
    };

    const getMaxZIndex = () =>
      Math.max(
        ...Array.from(document.querySelectorAll('body *'), (el) =>
          parseFloat(window.getComputedStyle(el).zIndex),
        ).filter((zIndex) => !Number.isNaN(zIndex)),
        0,
      );

    onMounted(() => {
      zIndex.value = props.zIndex === 'auto' ? getMaxZIndex() : props.zIndex;
    });

    onBeforeMount(() => {
      const alreadyCreatedTarget = document.getElementById(props.idName);
      if (!!alreadyCreatedTarget) return;
      teleportContainer = document.createElement('div');
      teleportContainer.setAttribute('id', props.idName);
      document.body.appendChild(teleportContainer);
    });

    onBeforeUnmount(() => {
      const { modelValue, lockScroll } = props;
      if (lockScroll && panel.value && modelValue) lockUnlockBodyScroll(panel.value, false);
      if (teleportContainer) document.body.removeChild(teleportContainer);
      window.removeEventListener('resize', calculateRightSize);
    });

    watch(
      () => [header.value, footer.value, props.height, props.width, props.side, props.modelValue],
      () => {
        nextTick(() => calculateRightSize());
      },
    );

    watch(
      () => [props.modelValue, panel.value],
      (newP, oldP) => {
        const wasShown = oldP ? (oldP[0] as boolean) : false;
        const [isShown, panelEl] = newP as [boolean, HTMLElement | null];
        const isOpening = isShown;
        const isClosing = wasShown && !isShown;
        if (!panelEl) return;
        if (isOpening) isBodyAlreadyLocked.value = !!document.body.style.overflow;

        if (isShown) {
          if (props.lockScroll) lockUnlockBodyScroll(panelEl, true);
          calculateRightSize();
          window.addEventListener('resize', calculateRightSize);
          return;
        }

        if (!props.lockScroll || !isClosing || isBodyAlreadyLocked.value) return;

        setTimeout(() => {
          if (panelEl) lockUnlockBodyScroll(panelEl, false);
        }, props.panelDuration);
        window.removeEventListener('resize', calculateRightSize);
      },
      { immediate: true },
    );

    const bodyHeight = computed<number | undefined>(() => {
      if (!panelHeight.value) return;

      const panelMaxHeight = bodyScrollHeight.value + headerHeight.value + footerHeight.value;
      let height = panelHeight.value - headerHeight.value - footerHeight.value;

      if (['top', 'bottom'].includes(props.side) && props.height === 'auto') {
        height =
          windowHeight.value >= panelMaxHeight
            ? bodyScrollHeight.value
            : windowHeight.value - headerHeight.value - footerHeight.value;
      }

      return height;
    });

    const overlayStyles = computed(() => ({
      zIndex: zIndex.value,
      animationDuration: `${props.overlayDuration}ms`,
      '--overlay-opacity': props.overlayOpacity,
      opacity: props.modelValue ? props.overlayOpacity : 0,
      backgroundColor: props.overlayColor,
      pointerEvents: !props.modelValue ? 'none' : 'all',
    }));

    const panelStyles = computed(() => ({
      width: ['left', 'right'].includes(props.side) ? props.width : undefined,
      maxWidth: '100%',

      ...(['top', 'bottom'].includes(props.side)
        ? {
            // minHeight: props.height,
            height: props.height,
            maxHeight: '100%',
          }
        : {}),

      zIndex: zIndex.value,
      backgroundColor: props.panelColor,
      animationDuration: `${props.panelDuration}ms`,

      ...Object.assign({}, attrs.style),
    }));

    return {
      body,
      panel,
      overlay,
      overlayStyles,
      header,
      footer,
      closePanel,
      panelStyles,
      bodyHeight,
    };
  },
});
</script>

<template>
  <teleport :to="`#${idName}`">
    <div class="vsp-wrapper" :class="[modelValue && 'vsp-wrapper--active']">
      <Transition name="overlay">
        <div
          v-show="modelValue"
          ref="overlay"
          class="vsp-overlay"
          :style="overlayStyles"
          @click="() => (noClose ? undefined : closePanel())"
        />
      </Transition>
      <Transition :name="transitionName || `slide-${side}`" @after-enter="$emit('opened')" @after-leave="$emit('closed')">
        <div
          v-if="rerender ? modelValue : true"
          v-show="rerender ? true : modelValue"
          ref="panel"
          class="vsp"
          :class="[`vsp--${side}-side`, $attrs.class]"
          :style="panelStyles"
        >
          <div v-if="!!$slots.header" ref="header" :class="[headerClass, 'vsp__header']">
            <slot name="header" :close="closePanel" />
          </div>
          <div ref="body" :class="[bodyClass, 'vsp__body']" :style="{ height: `${bodyHeight}px` }">
            <slot name="default" :close="closePanel" />
            <SidePanelCloseButton v-if="!hideCloseBtn" @close="closePanel" />
          </div>
          <div v-if="!!$slots.footer" ref="footer" :class="[footerClass, 'vsp__footer']">
            <slot name="footer" />
          </div>
        </div>
      </Transition>
    </div>
  </teleport>
</template>

<style lang="scss">
.vsp-wrapper {
  .vsp-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .vsp {
    position: fixed;

    &--right-side,
    &--left-side {
      top: 0;
      height: 100%;
    }

    &--right-side {
      right: 0;
      left: unset;
    }

    &--left-side {
      right: unset;
      left: 0;
    }

    &--bottom-side,
    &--top-side {
      left: 0;
      width: 100%;
    }

    &--bottom-side {
      bottom: 0;
    }

    &--top-side {
      top: 0;
    }

    &__header,
    &__body,
    &__footer {
      overflow: auto;
    }

    &__body {
      position: relative;
    }
  }

  .overlay-enter-active,
  .overlay-leave-active {
    animation: overlay-transition;
  }

  .overlay-leave-active {
    animation-direction: reverse;
  }

  .slide-right-enter-active,
  .slide-right-leave-active {
    animation: slide-right;
  }

  .slide-right-leave-active {
    animation-direction: reverse;
  }

  .slide-left-enter-active,
  .slide-left-leave-active {
    animation: slide-left;
  }

  .slide-left-leave-active {
    animation-direction: reverse;
  }

  .slide-top-enter-active,
  .slide-top-leave-active {
    animation: slide-left;
  }

  .slide-top-leave-active {
    animation-direction: reverse;
  }

  .slide-top-enter-active,
  .slide-top-leave-active {
    animation: slide-top;
  }

  .slide-top-leave-active {
    animation-direction: reverse;
  }

  .slide-bottom-enter-active,
  .slide-bottom-leave-active {
    animation: slide-bottom;
  }

  .slide-bottom-leave-active {
    animation-direction: reverse;
  }

  @keyframes slide-right {
    0% {
      transform: translateX(100%);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slide-left {
    0% {
      transform: translateX(-100%);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slide-bottom {
    0% {
      transform: translateY(100%);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slide-top {
    0% {
      transform: translateY(-100%);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slide-top {
    0% {
      transform: translateY(-100%);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes overlay-transition {
    0% {
      opacity: 0;
    }
    100% {
      opacity: var(--overlay-opacity);
    }
  }
}
</style>
