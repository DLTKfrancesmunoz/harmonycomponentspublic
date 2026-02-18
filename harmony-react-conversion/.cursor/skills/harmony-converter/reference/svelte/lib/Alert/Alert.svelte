<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { Snippet } from 'svelte'

  export type AlertVariant = 'info' | 'success' | 'warning' | 'error'
  export type AlertStyle = 'default' | 'enhanced'
  export interface AlertButtonConfig {
    text: string
    href?: string
    onClick?: () => void
  }

  interface Props {
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
    children?: Snippet
  }

  let {
    variant = 'info',
    alertStyle = 'default',
    title,
    dismissible = false,
    icon,
    primaryButton,
    secondaryButton,
    linkText,
    linkHref,
    progressValue,
    children,
    ...rest
  }: Props = $props()

  const dispatch = createEventDispatcher<{ dismiss: [] }>()

  const DEFAULT_ICONS: Record<AlertVariant, string> = {
    info: 'information-circle',
    success: 'check-circle',
    warning: 'exclamation-triangle',
    error: 'exclamation-circle',
  }

  const iconName = $derived(icon ?? DEFAULT_ICONS[variant])
  const hasActions = $derived(!!primaryButton || !!secondaryButton || (!!linkText && !!linkHref))
  const progressValueClamped = $derived(
    progressValue != null ? Math.min(100, Math.max(0, progressValue)) : null
  )

  const alertClasses = $derived(
    [
      'alert',
      `alert--${variant}`,
      alertStyle === 'enhanced' && 'alert--enhanced',
    ]
      .filter(Boolean)
      .join(' ')
  )
</script>

<div class={alertClasses} role="alert" {...rest}>
  {#if alertStyle === 'enhanced'}
    <div class="alert__border"></div>
    <div class="alert__content">
      <div class="alert__inner">
        <span class="alert__icon" aria-hidden="true">
          {@render iconSvg(iconName)}
        </span>
        <div class="alert__text">
          {#if title}<div class="alert__title">{title}</div>{/if}
          <div class="alert__message">{#if children}{@render children()}{/if}</div>
        </div>
        {#if dismissible}
          <button type="button" class="alert__close" aria-label="Dismiss" onclick={() => dispatch('dismiss')}>
            {@render xMarkSvg()}
          </button>
        {/if}
      </div>
      {#if hasActions && alertStyle === 'enhanced'}
        <div class="alert__actions">
          {#if primaryButton || secondaryButton}
            <div class="alert__buttons">
              {#if primaryButton?.href}
                <a href={primaryButton.href} class="alert__btn alert__btn--primary">{primaryButton.text}</a>
              {:else if primaryButton}
                <button type="button" class="alert__btn alert__btn--primary" onclick={() => primaryButton.onClick?.()}>
                  {primaryButton.text}
                </button>
              {/if}
              {#if secondaryButton?.href}
                <a href={secondaryButton.href} class="alert__btn alert__btn--secondary">{secondaryButton.text}</a>
              {:else if secondaryButton}
                <button type="button" class="alert__btn alert__btn--secondary" onclick={() => secondaryButton.onClick?.()}>
                  {secondaryButton.text}
                </button>
              {/if}
            </div>
          {/if}
          {#if linkText && linkHref}
            <a href={linkHref} class="alert__link">{linkText}</a>
          {/if}
        </div>
      {/if}
      {#if progressValueClamped != null && alertStyle === 'enhanced'}
        <div class="alert__progress">
          <div class="alert-progress__track">
            <div
              class="alert-progress__fill"
              style="width: {progressValueClamped}%"
              role="progressbar"
              aria-valuenow={progressValueClamped}
              aria-valuemin={0}
              aria-valuemax={100}
            ></div>
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <span class="alert__icon" aria-hidden="true">
      {@render iconSvg(iconName)}
    </span>
    <div class="alert__content">
      {#if title}<div class="alert__title">{title}</div>{/if}
      <div class="alert__message">{#if children}{@render children()}{/if}</div>
    </div>
    {#if dismissible}
      <button type="button" class="alert__close" aria-label="Dismiss" onclick={() => dispatch('dismiss')}>
        {@render xMarkSvg()}
      </button>
    {/if}
  {/if}
</div>

{#snippet iconSvg(name: string)}
  {#if name === 'information-circle'}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" class="alert__icon-svg"><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
  {:else if name === 'check-circle'}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" class="alert__icon-svg"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
  {:else if name === 'exclamation-triangle'}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" class="alert__icon-svg"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
  {:else if name === 'exclamation-circle'}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" class="alert__icon-svg"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
  {:else}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" class="alert__icon-svg"><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
  {/if}
{/snippet}

{#snippet xMarkSvg()}
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" class="alert__icon-svg"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
{/snippet}

