/**
 * Costpoint Kanban card field rendering helpers (spec §3.1).
 */

import type { KanbanViewCardField } from '../types/kanban-view-config'

/** Predefined styleId → CSS class suffix (under .kanban-card-cp); invalid IDs use fallback */
export const KANBAN_CP_STYLE_MAP: Record<string, string> = {
  default: 'kanban-card-cp__field-text--default',
  emphasis: 'kanban-card-cp__field-text--emphasis',
  muted: 'kanban-card-cp__field-text--muted',
  multiline: 'kanban-card-cp__field-text--multiline',
}

export const KANBAN_CP_STYLE_FALLBACK = 'kanban-card-cp__field-text--fallback'

export function resolveKanbanCpStyleClass(styleId?: string): string {
  if (!styleId || !(styleId in KANBAN_CP_STYLE_MAP)) {
    return KANBAN_CP_STYLE_FALLBACK
  }
  return KANBAN_CP_STYLE_MAP[styleId]
}

export type CostpointFieldRow =
  | { kind: 'field'; position: 1 | 2 | 3 | 4 | 5; label: string; value: string; styleClass: string; multiline: boolean }
  | { kind: 'spacer' }

/**
 * Build visible rows: disabled fields become a single spacer when enabled fields follow;
 * trailing disabled fields are omitted. Fields 1–4 are single-line; 5 is multiline block.
 */
export function buildCostpointFieldRows(
  fields: KanbanViewCardField[],
  valuesByFieldName: Record<string, string | undefined>
): CostpointFieldRow[] {
  const byPos = new Map<number, KanbanViewCardField>()
  for (const f of fields) {
    byPos.set(f.position, f)
  }

  let lastEnabledPos = 0
  for (let p = 1; p <= 5; p++) {
    const f = byPos.get(p)
    if (f?.enabled) lastEnabledPos = p
  }

  const rows: CostpointFieldRow[] = []
  let pendingSpacer = false

  for (let p = 1; p <= 5; p++) {
    const f = byPos.get(p)
    if (!f) continue

    if (f.enabled) {
      if (pendingSpacer) {
        rows.push({ kind: 'spacer' })
        pendingSpacer = false
      }
      const raw = valuesByFieldName[f.fieldName]
      const value = raw === undefined || raw === null ? '' : String(raw)
      const styleClass = resolveKanbanCpStyleClass(f.styleId)
      rows.push({
        kind: 'field',
        position: p as 1 | 2 | 3 | 4 | 5,
        label: f.fieldName,
        value,
        styleClass,
        multiline: p === 5,
      })
      continue
    }

    // disabled
    if (p > lastEnabledPos) continue
    const hasEnabledAfter = lastEnabledPos > p
    if (!hasEnabledAfter) continue
    pendingSpacer = true
  }

  if (pendingSpacer) {
    rows.push({ kind: 'spacer' })
  }

  return rows
}
