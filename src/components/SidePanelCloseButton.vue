<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SidePanelCloseButton',
  emits: ['close'],
});
</script>

<template>
  <div class="vsp-close" @click="$emit('close')">
    <span class="vsp-close__x" />
  </div>
</template>

<style lang="scss">
.vsp-close {
  $this: &;

  position: absolute;
  top: 24px;
  right: 24px;
  display: inline-block;
  width: 36px;
  height: 36px;
  text-align: center;
  cursor: pointer;
  background: white;
  border-radius: 50%;
  transition: background-color 0.1s;

  &:hover {
    background: #f7f7f7;
  }

  &__x {
    position: relative;
    top: 8px;
    left: -1px;
    display: inline-block;
    width: 20px;
    height: 20px;

    &::before,
    &::after {
      position: absolute;
      width: 2px;
      height: 20px;
      content: ' ';
      background-color: #777;
    }

    &::before {
      transform: rotate(-45deg);
    }

    &::after {
      transform: rotate(45deg);
    }

    #{$this}:active & {
      top: 9px;
      left: -1px;
    }
  }

  &:active {
    top: 23px;
    right: 23px;
    width: 38px;
    height: 38px;
    background: #f1f1f1;
  }
}
</style>
