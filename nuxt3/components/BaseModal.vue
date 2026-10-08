<script setup lang="ts">
import { ref, watch } from 'vue'

// Native <dialog>: gives us focus trapping, Esc-to-close and a backdrop for free.
const props = defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: [] }>()

const dialog = ref<HTMLDialogElement | null>(null)

watch(
  () => props.open,
  (open) => {
    if (open) dialog.value?.showModal()
    else dialog.value?.close()
  },
  { flush: 'post' },
)

// Clicks on the backdrop land on the <dialog> element itself.
function onClick(event: MouseEvent): void {
  if (event.target === dialog.value) emit('close')
}
</script>

<template>
  <dialog ref="dialog" class="modal" :aria-label="title" @cancel.prevent="emit('close')" @click="onClick">
    <div v-if="open" class="modal__panel">
      <header class="modal__header">
        <h2>{{ title }}</h2>
        <button type="button" class="modal__close" aria-label="Close" @click="emit('close')">×</button>
      </header>
      <slot />
    </div>
  </dialog>
</template>

<style scoped lang="scss">
.modal {
  width: min(520px, calc(100vw - #{$spacing * 2}));
  padding: 0;
  border: none;
  border-radius: $radius-lg;
  background: $surface;
  color: $text;
  box-shadow: $shadow-lg;

  &::backdrop {
    background: rgba(15, 23, 42, 0.45);
  }

  &__panel {
    padding: $spacing * 1.5;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing * 1.25;

    h2 {
      font-size: 1.2rem;
    }
  }

  &__close {
    @include flex-center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: $radius;
    background: transparent;
    color: $text-muted;
    font-size: 1.4rem;
    cursor: pointer;

    &:hover {
      background: $background;
      color: $text;
    }

    &:focus-visible {
      @include focus-ring;
    }
  }
}
</style>
