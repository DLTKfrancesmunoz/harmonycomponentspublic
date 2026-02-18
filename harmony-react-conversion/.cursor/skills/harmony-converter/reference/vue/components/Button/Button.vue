<script setup lang="ts">
import { computed, useSlots } from 'vue'
import ButtonIcons from './ButtonIcons.vue'
import SpinnerIcon from './SpinnerIcon.vue'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'dela'
  | 'dela-pill'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'
export type ButtonType = 'theme' | 'pageHeader'

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    buttonType?: ButtonType
    size?: ButtonSize
    orientation?: 'horizontal' | 'vertical'
    disabled?: boolean
    loading?: boolean
    loadingText?: string
    icon?: string
    iconPosition?: 'left' | 'right'
    type?: 'button' | 'submit' | 'reset'
    fullWidth?: boolean
    href?: string
    ariaLabel?: string
  }>(),
  {
    variant: 'primary',
    buttonType: 'theme',
    size: 'md',
    orientation: 'horizontal',
    disabled: false,
    loading: false,
    iconPosition: 'left',
    type: 'button',
    fullWidth: false,
  }
)

const emit = defineEmits<{ click: [] }>()

const hasContent = computed(() => !!useSlots().default?.())
const isIconOnly = computed(() => !!props.icon && !hasContent.value && !props.loading)
const isDelaVariant = computed(() => props.variant === 'dela' || props.variant === 'dela-pill')

const buttonClasses = computed(() =>
  [
    'btn',
    `btn--${props.variant}`,
    props.buttonType === 'pageHeader' && !isDelaVariant.value && 'btn--page-header',
    isIconOnly.value ? `btn--icon-${props.size}` : `btn--${props.size}`,
    props.orientation === 'vertical' && 'btn--vertical',
    (props.disabled || props.loading) && 'btn--disabled',
    props.loading && 'btn--loading',
    props.fullWidth && 'btn--full',
  ]
    .filter(Boolean)
    .join(' ')
)

function handleClick(e: Event) {
  if (props.href) e.preventDefault()
  emit('click')
}
</script>

<template>
  <a
    v-if="href"
    :href="href"
    :class="buttonClasses"
    :aria-busy="loading || undefined"
    :aria-label="ariaLabel"
    @click="handleClick"
  >
    <template v-if="loading">
      <SpinnerIcon />
      <span v-if="loadingText">{{ loadingText }}</span>
    </template>
    <template v-else>
      <img v-if="isDelaVariant" src="/Stars.svg" alt="" class="btn__dela-stars" />
      <ButtonIcons v-if="icon && iconPosition === 'left'" :name="icon" />
      <slot />
      <ButtonIcons v-if="icon && iconPosition === 'right'" :name="icon" />
    </template>
  </a>
  <button
    v-else
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    :aria-label="ariaLabel"
    @click="emit('click')"
  >
    <template v-if="loading">
      <SpinnerIcon />
      <span v-if="loadingText">{{ loadingText }}</span>
    </template>
    <template v-else>
      <img v-if="isDelaVariant" src="/Stars.svg" alt="" class="btn__dela-stars" />
      <ButtonIcons v-if="icon && iconPosition === 'left'" :name="icon" />
      <slot />
      <ButtonIcons v-if="icon && iconPosition === 'right'" :name="icon" />
    </template>
  </button>
</template>
