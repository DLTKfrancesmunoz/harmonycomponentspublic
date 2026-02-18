<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export interface NavItem {
    icon?: string
    label: string
    href?: string
    isCustom?: boolean
    customSrc?: string
    customSrcActive?: string
  }

  export interface Section {
    items: NavItem[]
  }

  const cpSections: Section[] = [
    {
      items: [
        { label: 'Dela AI', isCustom: true, customSrc: '/RS_DelaDefault.svg', customSrcActive: '/RS_Dela_Active.svg' },
        { icon: 'bell', label: 'Notifications' },
        { icon: 'arrow-up-tray', label: 'Files' },
      ],
    },
    {
      items: [
        { icon: 'printer', label: 'Print' },
        { icon: 'view-columns', label: 'Layout Options' },
      ],
    },
    {
      items: [
        { icon: 'mic-slash', label: 'Microphone' },
        { icon: 'signal-slash', label: 'Offline' },
        { icon: 'command-line', label: 'Keyboard Shortcuts' },
        { icon: 'question-mark-circle', label: 'Help' },
      ],
    },
  ]

  interface Props {
    variant?: 'cp' | 'vp' | 'ppm' | 'maconomy'
    sections?: Section[]
    activeItemId?: string | null
  }

  let { variant = 'cp', sections = cpSections, activeItemId = null, ...rest }: Props = $props()

  const dispatch = createEventDispatcher<{ itemClick: [itemId: string] }>()

  function isSidebarIconCustom(name: string) {
    return name === 'mic-slash'
  }

  function handleItemClick(e: MouseEvent, itemId: string) {
    e.preventDefault()
    dispatch('itemClick', itemId)
  }
</script>

<nav class="right-sidebar right-sidebar--{variant}" data-variant={variant} {...rest}>
  {#each sections as section, sectionIndex}
    <div class="right-sidebar__section">
      {#each section.items as item, itemIndex}
        {@const itemId = `right-sidebar-${sectionIndex}-${itemIndex}`}
        {@const isActive = activeItemId === itemId}
        <a
          href={item.href ?? '#'}
          class="right-sidebar__item"
          data-panel-title={item.label}
          data-panel-icon={item.icon}
          data-item-id={itemId}
          data-active={isActive ? 'true' : undefined}
          data-right-sidebar-item
          title={item.label}
          onclick={(e) => handleItemClick(e, itemId)}
        >
          <span class="right-sidebar__label">{item.label}</span>
          <span class="right-sidebar__icon">
            {#if item.isCustom && item.customSrc}
              {#if item.customSrcActive}
                <img src={item.customSrc} alt={item.label} class="right-sidebar__dela-logo right-sidebar__dela-logo--default" />
                <img src={item.customSrcActive} alt={item.label} class="right-sidebar__dela-logo right-sidebar__dela-logo--active" />
              {:else}
                <img src={item.customSrc} alt={item.label} class="right-sidebar__dela-logo" />
              {/if}
            {:else if item.icon && isSidebarIconCustom(item.icon)}
              <img src="/mic-slash.svg" alt="" class="right-sidebar__icon-img" width={24} height={24} />
            {:else if item.icon}
              {@render sidebarIcon(item.icon)}
            {/if}
          </span>
        </a>
      {/each}
    </div>
  {/each}
</nav>

{#snippet sidebarIcon(name: string)}
  {#if name === 'bell'}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>
  {:else if name === 'arrow-up-tray'}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
  {:else if name === 'printer'}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" /></svg>
  {:else if name === 'view-columns'}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125Z" /></svg>
  {:else if name === 'signal-slash'}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" d="m3 3 8.735 8.735m0 0a.374.374 0 1 1 .53.53m-.53-.53.53.53m0 0L21 21M14.652 9.348a3.75 3.75 0 0 1 0 5.304m2.121-7.425a6.75 6.75 0 0 1 0 9.546m2.121-11.667c3.808 3.807 3.808 9.98 0 13.788m-9.546-4.242a3.733 3.733 0 0 1-1.06-2.122m-1.061 4.243a6.75 6.75 0 0 1-1.625-6.929m-.496 9.05c-3.068-3.067-3.664-7.67-1.79-11.334M12 12h.008v.008H12V12Z" /></svg>
  {:else if name === 'command-line'}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
  {:else if name === 'question-mark-circle'}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" /></svg>
  {:else}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6Z" /></svg>
  {/if}
{/snippet}
