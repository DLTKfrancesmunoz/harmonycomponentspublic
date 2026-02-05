# Generated specs – elements array summary

## Status

The issues described below have been addressed: multi-element structure is now provided via HARDCODED_STRUCTURE in [scripts/lib/component-discovery.js](../scripts/lib/component-discovery.js), and all component JSONs have been regenerated. This document is kept for historical context and for auditing which components were in scope.

---

## 1. Requested specs (elements only)

### Alert (cp-light) — spec key `info-cp-light-xs` (Alert uses variant-theme-mode-size)

```json
"elements": [
  {
    "selector": ".alert",
    "tag": "div",
    "styles": {
      "display": "inline-flex",
      "align-items": "center",
      "justify-content": "center",
      "flex-shrink": "0",
      "border-radius": "8px",
      "background": "#4C92D9"
    }
  }
]
```

**Verdict:** Single root only. **Should be multi-element:** icon (`.alert__icon`), title (`.alert__title`), message (`.alert__message`), and optionally border, content, inner, close, actions.

---

### Dialog (cp-light) — spec key `default-cp-light-xs`

```json
"elements": [
  {
    "selector": ".dialog",
    "tag": "div",
    "styles": {
      "display": "inline-flex",
      "align-items": "center",
      "justify-content": "center",
      "flex-shrink": "0",
      "border-radius": "8px",
      "background": "#4C92D9"
    }
  }
]
```

**Verdict:** Single root only. **Should be multi-element:** overlay (`.dialog-overlay`), header (`.dialog__header`), body (`.dialog__body`), footer (`.dialog__footer`), and optionally title, close.

---

### Input (cp-light) — spec key `error-cp-light-xs` (Input uses variant-theme-mode-size)

```json
"elements": [
  {
    "selector": ".input",
    "tag": "div",
    "styles": {
      "display": "inline-flex",
      "align-items": "center",
      "justify-content": "center",
      "flex-shrink": "0",
      "border-radius": "8px",
      "background": "#4C92D9"
    }
  }
]
```

**Verdict:** Single element. **Could be multi:** wrapper (`.input-form-wrapper`), label, `.input-wrapper`, `.input-wrapper__icon`, input field, `.input-wrapper__error` — if execution format should drive each region’s styles.

---

### Button (cp-light-md) — spec key `icon-xs-cp-light-md`

```json
"elements": [
  {
    "selector": ".button",
    "tag": "div",
    "styles": {
      "display": "inline-flex",
      "align-items": "center",
      "justify-content": "center",
      "flex-shrink": "0",
      "border-radius": "8px",
      "background": "#4C92D9"
    }
  }
]
```

**Verdict:** Single element. **Acceptable as single:** Button is one interactive control; icon and label are inside it. Multi-element is optional (e.g. if icon/label need separate critical selectors).

---

## 2. Options if Alert/Dialog (or others) should be multi-element

| Option | Description |
|--------|-------------|
| **A) Add structure to existing JSONs before migration** | Add a `structure` (and optionally `section`, `template`) to each spec in `mcp-data/components/alert.json`, `dialog.json`, etc. The generator already converts any spec with `structure` into the execution format (elements array) like Card/RightSidebar. |
| **B) Derive structure from .astro files** | Extend the generator to parse `.astro` and infer elements from class names / DOM (e.g. `dialog-overlay`, `dialog__header`, `dialog__body`, `dialog__footer`). Requires an Astro/DOM parser and rules for mapping to selectors. |
| **C) Manually define element structure per component** | Maintain a static map (e.g. in the script or a config file) that defines root/section/item/icon/label for each component; generator uses it when no `structure` exists in JSON. |

**Recommendation:** **A** is the most direct and already supported: add `structure` (and related fields) to the existing Alert/Dialog (and any other) specs, then re-run the generator so they get the same treatment as Card and RightSidebar.

---

## 3. Which components actually need multiple elements?

Only **Card** and **RightSidebar** currently have `structure` in `mcp-data/components/*.json`; they already produce multi-element execution specs.

Components that have **multi-part DOM** in their `.astro` and are good candidates for multi-element specs (once structure is defined, e.g. via A or C):

| Component | Multi-part regions in .astro |
|-----------|-----------------------------|
| **Alert** | `.alert`, `.alert__border`, `.alert__content` / `.alert__inner`, `.alert__icon`, `.alert__text` (`.alert__title`, `.alert__message`), `.alert__close`, `.alert__actions` |
| **Dialog** | `.dialog-overlay`, `.dialog`, `.dialog__header`, `.dialog__title`, `.dialog__close`, `.dialog__body`, `.dialog__footer` |
| **LeftSidebar** | Similar to RightSidebar: root, section(s), item, icon, label, etc. |
| **ShellPanel** | `.shell-panel`, `.shell-panel__header`, body/content slots |
| **ShellHeader** | Header regions (e.g. left/right, nav) |
| **ShellPageHeader** | `.shell-page-header__left`, `.shell-page-header__right` (title/subtitle vs actions) |
| **Accordion** | Item/trigger/content sections (e.g. `.accordion__item`, trigger, content) |
| **Input** | `.input-form-wrapper`, label, `.input-wrapper`, `.input-wrapper__icon`, input, `.input-wrapper__error` (if desired) |
| **Table** | `table`, `thead`, `tbody`, rows, cells |
| **PickerPopup** | Overlay/panel, header, body (date/time pickers) |
| **Kanban** | Columns, cards (if modeled as elements) |
| **Stepper** | Steps / connectors |
| **Dropdown** | Trigger, panel, list items |
| **Tooltip** | Trigger, popover content |
| **ListMenu** | Container, list, items |

**Single-element is often enough for:** Button, Badge, Chip, Icon, Spinner, Toggle, Link, ProgressBar, Checkbox, RadioButton, Label, Textarea, NumberInput, RangeInput, DateInput (unless you split label/input/error).

---

## 4. Summary

- **Alert (cp-light):** One element (`.alert`). Should have icon, title, message (and optionally more).
- **Dialog (cp-light):** One element (`.dialog`). Should have overlay, header, body, footer.
- **Input (cp-light):** One element (`.input`). Could stay single or be split into wrapper/label/input/error.
- **Button (cp-light-md):** One element (`.button`). Single element is acceptable.

To get multi-element specs for Alert and Dialog (and others): add `structure` (and related fields) to their existing JSON specs **(Option A)**, then re-run the generator. Option B (derive from .astro) or C (manual map) can be used later if you want to avoid maintaining structure in JSON.
