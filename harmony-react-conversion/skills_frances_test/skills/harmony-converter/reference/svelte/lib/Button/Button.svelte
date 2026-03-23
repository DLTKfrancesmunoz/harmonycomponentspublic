<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { Snippet } from 'svelte'

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

  interface Props {
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
    children?: Snippet
  }

  let {
    variant = 'primary',
    buttonType = 'theme',
    size = 'md',
    orientation = 'horizontal',
    disabled = false,
    loading = false,
    loadingText,
    icon,
    iconPosition = 'left',
    type = 'button',
    fullWidth = false,
    href,
    ariaLabel,
    children,
    ...rest
  }: Props = $props()

  const dispatch = createEventDispatcher<{ click: [] }>()

  const hasContent = $derived(!!children)
  const isIconOnly = $derived(!!icon && !hasContent && !loading)
  const isDelaVariant = $derived(variant === 'dela' || variant === 'dela-pill')

  const buttonClasses = $derived(
    [
      'btn',
      `btn--${variant}`,
      buttonType === 'pageHeader' && !isDelaVariant && 'btn--page-header',
      isIconOnly ? `btn--icon-${size}` : `btn--${size}`,
      orientation === 'vertical' && 'btn--vertical',
      (disabled || loading) && 'btn--disabled',
      loading && 'btn--loading',
      fullWidth && 'btn--full',
    ]
      .filter(Boolean)
      .join(' ')
  )

  function handleClick(e: MouseEvent) {
    if (href) e.preventDefault()
    dispatch('click')
  }
</script>

{#if href}
  <a
    href={href}
    class={buttonClasses}
    aria-busy={loading || undefined}
    aria-label={ariaLabel}
    onclick={handleClick}
    {...rest}
  >
    {#if loading}
      {@render spinnerSvg()}
      {#if loadingText}<span>{loadingText}</span>{/if}
    {:else}
      {#if isDelaVariant}<img src="/Stars.svg" alt="" class="btn__dela-stars" />{/if}
      {#if icon && iconPosition === 'left'}{@render buttonIcon(icon)}{/if}
      {#if children}{@render children()}{/if}
      {#if icon && iconPosition === 'right'}{@render buttonIcon(icon)}{/if}
    {/if}
  </a>
{:else}
  <button
    {type}
    class={buttonClasses}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    aria-label={ariaLabel}
    onclick={() => dispatch('click')}
    {...rest}
  >
    {#if loading}
      {@render spinnerSvg()}
      {#if loadingText}<span>{loadingText}</span>{/if}
    {:else}
      {#if isDelaVariant}<img src="/Stars.svg" alt="" class="btn__dela-stars" />{/if}
      {#if icon && iconPosition === 'left'}{@render buttonIcon(icon)}{/if}
      {#if children}{@render children()}{/if}
      {#if icon && iconPosition === 'right'}{@render buttonIcon(icon)}{/if}
    {/if}
  </button>
{/if}

{#snippet spinnerSvg()}
  <svg class="btn__spinner" width="var(--btn-spinner-size)" height="var(--btn-spinner-size)" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="var(--btn-spinner-stroke-width)" />
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
{/snippet}

{#snippet buttonIcon(name: string)}
  {#if name === 'plus'}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" style="width:1em;height:1em;flex-shrink:0"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
  {:else if name === 'arrow-right'}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" style="width:1em;height:1em;flex-shrink:0"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
  {/if}
{/snippet}
