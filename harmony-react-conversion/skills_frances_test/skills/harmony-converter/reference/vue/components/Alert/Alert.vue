<script setup lang="ts">
import { computed } from 'vue'
import AlertIcons from './AlertIcons.vue'
import XMarkIcon from './XMarkIcon.vue'

export type AlertVariant = 'info' | 'success' | 'warning' | 'error'
export type AlertStyle = 'default' | 'enhanced'
export interface AlertButtonConfig {
  text: string
  href?: string
  onClick?: () => void
}

const props = withDefaults(
  defineProps<{
    variant?: AlertVariant
    alertStyle?: AlertStyle
    title?: string
    dismissible?: boolean
    icon?: string
    primaryButton?: AlertButtonConfig
    secondaryButton?: AlertButtonConfig
    linkText?: string
    linkHref?: string
    progressValue?: number
  }>(),
  {
    variant: 'info',
    alertStyle: 'default',
    dismissible: false,
  }
)

const emit = defineEmits<{ dismiss: [] }>()

const DEFAULT_ICONS: Record<AlertVariant, string> = {
  info: 'information-circle',
  success: 'check-circle',
  warning: 'exclamation-triangle',
  error: 'exclamation-circle',
}

const iconName = computed(() => props.icon ?? DEFAULT_ICONS[props.variant])
const hasActions = computed(
  () => props.primaryButton || props.secondaryButton || (props.linkText && props.linkHref)
)

const alertClasses = computed(() =>
  [
    'alert',
    `alert--${props.variant}`,
    props.alertStyle === 'enhanced' && 'alert--enhanced',
  ]
    .filter(Boolean)
    .join(' ')
)

const progressValueClamped = computed(() =>
  props.progressValue != null ? Math.min(100, Math.max(0, props.progressValue)) : null
)

function handleClose() {
  emit('dismiss')
}
</script>

<template>
  <div :class="alertClasses" role="alert">
    <div v-if="alertStyle === 'enhanced'" class="alert__border" />
    <template v-if="alertStyle === 'enhanced'">
      <div class="alert__content">
        <div class="alert__inner">
          <span class="alert__icon" aria-hidden>
            <AlertIcons :name="iconName" />
          </span>
          <div class="alert__text">
            <div v-if="title" class="alert__title">{{ title }}</div>
            <div class="alert__message"><slot /></div>
          </div>
          <button
            v-if="dismissible"
            type="button"
            class="alert__close"
            aria-label="Dismiss"
            @click="handleClose"
          >
            <XMarkIcon />
          </button>
        </div>
        <div v-if="hasActions && alertStyle === 'enhanced'" class="alert__actions">
          <div v-if="primaryButton || secondaryButton" class="alert__buttons">
            <a
              v-if="primaryButton?.href"
              :href="primaryButton.href"
              class="alert__btn alert__btn--primary"
            >
              {{ primaryButton.text }}
            </a>
            <button
              v-else-if="primaryButton"
              type="button"
              class="alert__btn alert__btn--primary"
              @click="primaryButton.onClick?.()"
            >
              {{ primaryButton.text }}
            </button>
            <a
              v-if="secondaryButton?.href"
              :href="secondaryButton.href"
              class="alert__btn alert__btn--secondary"
            >
              {{ secondaryButton.text }}
            </a>
            <button
              v-else-if="secondaryButton"
              type="button"
              class="alert__btn alert__btn--secondary"
              @click="secondaryButton.onClick?.()"
            >
              {{ secondaryButton.text }}
            </button>
          </div>
          <a v-if="linkText && linkHref" :href="linkHref" class="alert__link">{{ linkText }}</a>
        </div>
        <div v-if="progressValueClamped != null && alertStyle === 'enhanced'" class="alert__progress">
          <div class="alert-progress__track">
            <div
              class="alert-progress__fill"
              :style="{ width: progressValueClamped + '%' }"
              role="progressbar"
              :aria-valuenow="progressValueClamped"
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <span class="alert__icon" aria-hidden>
        <AlertIcons :name="iconName" />
      </span>
      <div class="alert__content">
        <div v-if="title" class="alert__title">{{ title }}</div>
        <div class="alert__message"><slot /></div>
      </div>
      <button
        v-if="dismissible"
        type="button"
        class="alert__close"
        aria-label="Dismiss"
        @click="handleClose"
      >
        <XMarkIcon />
      </button>
    </template>
  </div>
</template>
