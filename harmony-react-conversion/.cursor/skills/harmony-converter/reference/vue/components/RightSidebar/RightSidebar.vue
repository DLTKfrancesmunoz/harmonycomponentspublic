<script setup lang="ts">
import { computed } from 'vue'
import SidebarIcons from './SidebarIcons.vue'

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

const props = withDefaults(
  defineProps<{
    variant?: 'cp' | 'vp' | 'ppm' | 'maconomy'
    sections?: Section[]
    activeItemId?: string | null
  }>(),
  {
    variant: 'cp',
    activeItemId: null,
  }
)

const emit = defineEmits<{ itemClick: [itemId: string] }>()

const sections = computed(() => props.sections ?? cpSections)

function isSidebarIconCustom(name: string) {
  return name === 'mic-slash'
}

function handleItemClick(e: Event, itemId: string) {
  e.preventDefault()
  emit('itemClick', itemId)
}
</script>

<template>
  <nav
    :class="['right-sidebar', `right-sidebar--${variant}`]"
    :data-variant="variant"
  >
    <div
      v-for="(section, sectionIndex) in sections"
      :key="sectionIndex"
      class="right-sidebar__section"
    >
      <a
        v-for="(item, itemIndex) in section.items"
        :key="`${sectionIndex}-${itemIndex}`"
        :href="item.href ?? '#'"
        class="right-sidebar__item"
        :data-panel-title="item.label"
        :data-panel-icon="item.icon"
        :data-item-id="`right-sidebar-${sectionIndex}-${itemIndex}`"
        :data-active="activeItemId === `right-sidebar-${sectionIndex}-${itemIndex}` ? 'true' : undefined"
        data-right-sidebar-item
        :title="item.label"
        @click="(e) => handleItemClick(e, `right-sidebar-${sectionIndex}-${itemIndex}`)"
      >
        <span class="right-sidebar__label">{{ item.label }}</span>
        <span class="right-sidebar__icon">
          <template v-if="item.isCustom && item.customSrc">
            <img
              v-if="item.customSrcActive"
              :src="item.customSrc"
              :alt="item.label"
              class="right-sidebar__dela-logo right-sidebar__dela-logo--default"
            />
            <img
              v-if="item.customSrcActive"
              :src="item.customSrcActive"
              :alt="item.label"
              class="right-sidebar__dela-logo right-sidebar__dela-logo--active"
            />
            <img
              v-else
              :src="item.customSrc"
              :alt="item.label"
              class="right-sidebar__dela-logo"
            />
          </template>
          <img
            v-else-if="item.icon && isSidebarIconCustom(item.icon)"
            src="/mic-slash.svg"
            alt=""
            class="right-sidebar__icon-img"
            width="24"
            height="24"
          />
          <SidebarIcons v-else-if="item.icon" :name="item.icon" />
        </span>
      </a>
    </div>
  </nav>
</template>
