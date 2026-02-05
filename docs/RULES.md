# Harmony Usage Rules

Generated from Harmony component and shell doc pages. Do not edit by hand; run `npm run build` or `node scripts/extract-usage-rules.js` to refresh.

## Usage Guidelines

### Buttons

### When to Use Each Button Type

          

            
- • **Theme Buttons:** Use for general UI actions throughout the application. These use darker shades of the theme primary color to maintain visual hierarchy.
            
- • **Page Header Buttons:** Use specifically in page headers and navigation areas. These use a dark blue color scheme (#043852) for consistency in header contexts.
          

          ### When to Use Each Variant

          

            
- • **Primary:** Main call-to-action, one per section
            
- • **Secondary:** Alternative actions, less prominent
            
- • **Tertiary:** Subtle actions with theme-primary text color
            
- • **Outline:** Secondary actions that need visibility
            
- • **Ghost:** Minimal actions, toolbar buttons
            
- • **Destructive:** Delete, remove, or irreversible actions
          

        

        
          
            ### Do

            

              
- • Use clear, action-oriented labels
              
- • Limit primary buttons per view
              
- • Provide visual feedback on interaction
              
- • Use icons to reinforce meaning
              
- • Maintain consistent sizing in groups
            

          
          
            ### Don't

            

              
- • Use vague labels like "Click Here"
              
- • Disable buttons without explanation
              
- • Mix too many variants in one area
              
- • Use destructive style for safe actions
              
- • Rely solely on color for meaning

### Checkboxes

### Do

          

            
- • Use for multiple selections
            
- • Provide clear, concise labels
            
- • Group related options together
            
- • Use for binary on/off choices
            
- • Use error state for validation failures
            
- • Use warning state for cautionary information
            
- • Provide helpful message text with warning/error states
          

        
        
          ### Don't

          

            
- • Use for mutually exclusive options (use radio buttons)
            
- • Have checkboxes without labels
            
- • Use negative phrasing
            
- • Pre-check options unexpectedly
            
- • Use error state for warnings (use warning state instead)
            
- • Show error/warning states without helpful messages

### Inputs

### Do

          

            
- • Always use labels with inputs
            
- • Provide helpful placeholder text
            
- • Show validation feedback inline
            
- • Use appropriate input types
          

        
        
          ### Don't

          

            
- • Use placeholder as label
            
- • Hide error messages
            
- • Disable without explanation
            
- • Use generic error messages

### Tables

### Best Practices

        
          

            
- Use tables only for tabular data, not for layout purposes
            
- Keep column headers concise and descriptive
            
- Align numerical data to the right for easy comparison
            
- Use zebra striping for tables with many rows
            
- Provide sorting and filtering for large data sets
          

        
      
      
      
        ### Accessibility

        

          Use proper `<table>`, `<thead>`, `<tbody>`, `<th>`, and `<td>` elements. Include `scope` attributes on header cells and provide a caption or `aria-label` for the table's purpose.
        

      
    
  

  // Handle row selection highlighting for browsers without :has() support
  document.addEventListener('DOMContentLoaded', () => {
    const tables = document.querySelectorAll('.table');
    
    tables.forEach(table => {
      const checkboxes = table.querySelectorAll('.checkbox__input');
      
      // Initialize selected state for pre-checked checkboxes
      checkboxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        if (row && checkbox.checked) {
          row.classList.add('table-row--selected');
        }
      });
      
      // Handle checkbox changes
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          const row = checkbox.closest('tr');
          if (row) {
            if (checkbox.checked) {
              row.classList.add('table-row--selected');
            } else {
              row.classList.remove('table-row--selected');
            }
          }
        });
      });
    });
  });

### Shell: Layout

When and how to use the Shell Layout component.

      

      
        
          
            
              ✓
              
                ### Do Use For

                

                  
- • Full application shells
                  
- • Multi-page applications
                  
- • Complex workflows needing persistent navigation
                  
- • Applications that need to adapt to all themes
                

              
            
          
        

        
          
            
              ✗
              
                ### Don't Use For

                

                  
- • Single-page focused applications
                  
- • Marketing/landing pages
                  
- • Embedded widgets or components
                  
- • Documentation sites (use DocsLayout)

### Shell: Page Header

### Do

          

            
- Use for page-level headers above content cards
            
- Keep titles concise and descriptive
            
- Use subtitle for additional context when needed
            
- Place primary action (most important) as the rightmost button
            
- Order outline buttons by importance (left to right)
            
- Use icons to improve button recognition
            
- Limit to 4 buttons total for clarity
          

        

        
          ### Don't

          

            
- Don't use for section headers within page content
            
- Don't exceed 4 buttons (consider dropdown menus for more actions)
            
- Don't use overly long titles or subtitles
            
- Don't place primary button before outline buttons
            
- Don't use for navigation or breadcrumbs
            
- Don't mix button types (all should be page header style)

### Shell: Panel

### When to Use

          

            
- • **Contextual Actions:** Use panels to provide contextual actions and tools related to the current view or selection
            
- • **Secondary Content:** Display supplementary information, settings, or details without navigating away from the main content
            
- • **Forms and Inputs:** Use panels for forms, filters, or input dialogs that need to be accessible but not always visible
            
- • **Command Centers:** Full-width panels are ideal for complex interfaces like command centers or dashboards
          

        

        
          ### Header Variants

          

            
- • **Theme Header:** Use for primary actions and prominent content panels. Features theme-primary background with white text and includes popout button.
            
- • **Default Header:** Use for secondary panels, settings, or less prominent content. Features elevated background with primary text and bottom border separator.
          

        

        
          ### Width Modes

          

            
- • **Narrow (596px):** Standard width for most use cases. Good for forms, lists, and detail views. Maintains good readability.
            
- • **Full (100vw):** Use for complex content that requires more horizontal space. Ideal for data tables, wide forms, and dashboards. Users can toggle between narrow and full width using the maximize/minimize button.
          

        

        
          ### Panel Positioning

          

            
- • **Left Side:** Use when the panel content relates to navigation or primary actions
            
- • **Right Side:** Use for secondary actions, settings, or supplementary information
          

        

        
          ### Dela Variant

          

            Use `variant="dela"` when the panel is the Ask Dela / Digital Assistant panel opened from the right sidebar's Dela AI item (RS_DelaDefault.svg default, RS_Dela_Active.svg when active). The Dela icon's active state uses a gradient background (--linear-new) and shows RS_Dela_Active.svg. The RightSidebar will only set the gradient and title and will not replace the header or content, so your pre-rendered Dela layout is preserved. The header shows the title plus width toggle and close only; the pencil (New chat) and question-mark (Help) icons sit above the first message, left-aligned (`dela-panel__toolbar`). The content area uses a white background; the chat input is docked to the bottom in a single white input box that contains the text field plus attach (paperclip), microphone, and send icons. For a full example, see the Dela foundation page.
          

        

        
          
            ### Do

            

              
- • Keep panel content focused and relevant to the current context
              
- • Use theme header for primary actions and important content
              
- • Provide clear titles that describe the panel's purpose
              
- • Use icons in headers to reinforce meaning
              
- • Allow users to toggle between narrow and full width when appropriate
            

          
          
            ### Don't

            

              
- • Overload panels with too much content - use full width mode if needed
              
- • Use panels for critical information that must always be visible
              
- • Nest panels within other panels
              
- • Use default header for primary actions
              
- • Forget to provide keyboard-accessible close actions

## Usage

### Icons

### Icon Component

        
          
`<Icon name="arrow-down" />
<Icon name="check-circle" size="lg" />`
        
      
      
      
        
          
            
            xs (12px)
          
          
            
            sm (16px)
          
          
            
            md (20px)
          
          
            
            lg (24px)
          
          
            
            xl (32px)

### Stepper

### Basic Structure

            

              The Stepper component uses an alternative label layout where labels appear below the step indicators. The step label is provided as slot content.
            

            
              <Stepper activeStep={1}>
                <Step completed>Step 1</Step>
                <Step>Step 2</Step>
                <Step>Step 3</Step>
              </Stepper>
            
          
        

        
          
            ### Step States: Success, Warning, and Error

            

              Steps can display different states. Success state uses the semantic success color (green) with a checkmark icon. Warning and error states use their respective semantic colors.
            

            
              <Stepper activeStep={2}>
                <Step success>Verified</Step>
                <Step warning>Review</Step>
                <Step error>Fix errors</Step>
                <Step>Complete</Step>
              </Stepper>
            
          
        

        
          
            ### Step with Description

            

              Steps can include a description using a named slot. Labels use Lexend (display font) and descriptions use Figtree (body font) at the same size for clear typographic hierarchy.
            

            
              <Step completed success>
                Account Setup
                <template slot="description">
                  Verify your email and password
                </template>
              </Step>

## Accessibility

### Accordion

### Keyboard Navigation

        

          Accordion headers are fully keyboard accessible. Use Tab to navigate to accordion items, and Enter or Space to toggle expansion.
        

      
      
      
        ### ARIA Attributes

        

          The Accordion component uses proper ARIA attributes:
        

        

          
- `role="button"` on accordion headers
          
- `aria-expanded` indicates open/closed state
          
- `aria-controls` associates headers with content panels
          
- `aria-disabled` for disabled items (if applicable)
        

      
      
      
        ### Screen Reader Support

        

          Screen readers announce the accordion header text, expansion state, and content when expanded. The relationship between headers and their content is clearly communicated.

### Alerts

### Role

        

          Alerts use `role="alert"` to announce important messages to screen readers.

### Badges

### Semantic HTML

        

          Badges use semantic `<span>` elements and are typically decorative. When badges convey important information, ensure they are associated with their related content using appropriate ARIA attributes or proximity.
        

      
      
      
        ### Color Contrast

        

          All badge variants meet WCAG 2.1 AA contrast requirements. Text and background colors provide sufficient contrast for readability.
        

      
      
      
        ### Icon Badges

        

          When badges contain only icons, ensure the parent element or badge itself includes `aria-label` or `aria-labelledby` to provide context for screen readers.

### Buttons

### Keyboard Navigation

        

          All buttons are focusable and can be activated with Enter or Space.
        

      
      
        ### Icon-Only Buttons

        

          Always include `aria-label` for icon-only buttons to provide context for screen readers.
        

      
      
        ### Focus States

        

          Buttons include visible focus indicators that meet WCAG 2.1 requirements for contrast.
        

      
      
        ### Disabled State

        

          Disabled buttons are marked with `disabled` attribute. Explain why buttons are disabled via tooltip or adjacent text.

### Cards

### Semantic Structure

        

          Cards use semantic HTML structure with proper heading hierarchy. Use `card__header`, `card__body`, and `card__footer` classes to organize content logically.
        

      
      
      
        ### Interactive Cards

        

          When using the `interactive` prop, ensure cards are keyboard accessible. Use proper focus management and provide clear indication of clickable areas. Consider using `role="button"` or wrapping content in a `<button>` or `<a>` element.
        

      
      
      
        ### Focus Indicators

        

          Interactive cards include visible focus indicators that meet WCAG 2.1 requirements. Ensure focus is clearly visible when navigating with keyboard.
        

      
      
      
        ### Screen Reader Support

        

          Use proper heading levels within cards to help screen reader users understand content hierarchy. Ensure card titles are descriptive and provide context for the card's content.

### Checkbox Groups

### Fieldset and Legend

        

          The CheckboxGroup component uses `<fieldset>` and `<legend>` elements to group related checkboxes. This provides semantic structure and helps screen readers understand the relationship between checkboxes.
        

      
      
      
        ### Keyboard Navigation

        

          All checkboxes in the group are keyboard accessible. Use Tab to navigate between checkboxes and Space to toggle selection.
        

      
      
      
        ### Error and Warning States

        

          When `error` or `warning` props are set, the group and all child checkboxes display the appropriate state. Error/warning messages are associated via `aria-describedby` and announced to screen readers.
        

      
      
      
        ### Screen Reader Support

        

          Screen readers announce the group legend, individual checkbox labels, and their checked state. Error and warning messages are clearly communicated when present.

### Checkboxes

### Labels

        

          The Checkbox component automatically wraps the input in a `<label>` element, ensuring proper association.
        

      
      
        ### Keyboard

        

          Checkboxes are togglable with Space key and navigable with Tab.
        

      
      
        ### Error States

        

          When the `error` prop is set, the checkbox automatically includes `aria-invalid="true"` and error messages are associated via `aria-describedby` for screen reader users.

### Chips

### Keyboard Navigation

        

          Interactive chips (those with click handlers) are keyboard accessible. Use Tab to navigate to chips and Enter or Space to activate them.
        

      
      
      
        ### Focus States

        

          Chips include visible focus indicators when in the `focused` state. Focus indicators meet WCAG 2.1 requirements for contrast and visibility.
        

      
      
      
        ### Removable Chips

        

          When chips are removable, the remove button should include an `aria-label` (e.g., "Remove [chip label]") to provide context for screen reader users.
        

      
      
      
        ### Screen Reader Support

        

          Chip text content is announced by screen readers. For icon-only chips (dots, overflow), ensure appropriate `aria-label` attributes are provided.

### Date Picker

### Keyboard Navigation

        

          All pickers support full keyboard navigation:
        

        

          
- Arrow Keys - Navigate between dates/months/weeks
          
- Enter or Space - Select the focused item
          
- Home / End - Jump to first/last item in current view
          
- Page Up / Page Down - Navigate months (date picker)
          
- Escape - Close the picker popup
        

      
      
      
        ### ARIA Attributes

        

          All pickers include proper ARIA roles and attributes:
        

        

          
- `role="dialog"` on the popup container
          
- `role="grid"` on calendar grids
          
- `role="gridcell"` on individual date/month cells
          
- `aria-label` and `aria-selected` for screen reader support
          
- Proper focus management and focus trapping within the picker
        

      
      
      
        ### Focus Indicators

        

          All interactive elements have visible focus indicators using the theme primary color with sufficient contrast for WCAG 2.1 compliance.
        

      
      
      
        ### Screen Reader Support

        

          Screen readers announce the picker type, current selection, available dates/times, and navigation instructions. Selected items are clearly indicated with `aria-selected="true"`.

### Dialogs

### ARIA Roles

        

          Dialogs use `role="dialog"` and include `aria-modal="true"` to indicate modal behavior. The dialog title is associated using `aria-labelledby`.
        

      
      
      
        ### Keyboard Navigation

        

          Dialogs support standard keyboard interactions:
        

        

          
- Tab - Navigate between focusable elements
          
- Shift+Tab - Navigate backwards
          
- Escape - Close the dialog
          
- Focus is trapped within the dialog when open
        

      
      
      
        ### Focus Management

        

          When a dialog opens, focus moves to the first focusable element (typically the close button or first input). When closed, focus returns to the element that triggered the dialog. Focus is trapped within the dialog to prevent users from interacting with background content.
        

      
      
      
        ### Screen Reader Support

        

          Screen readers announce the dialog title and content when opened. The dialog's modal nature is communicated, and users are informed that background content is not available while the dialog is open.

### Dropdowns

### Labels

        

          Always associate labels with dropdowns using the `label` prop or a separate `Label` component with the `for` attribute. This ensures screen readers can identify the dropdown's purpose.
        

      
      
      
        ### Keyboard Navigation

        

          Dropdowns support full keyboard navigation:
        

        

          
- Tab - Navigate to/from dropdown
          
- Enter or Space - Open dropdown menu
          
- Arrow Up/Down - Navigate options
          
- Enter - Select option
          
- Escape - Close dropdown
        

      
      
      
        ### ARIA Attributes

        

          The Dropdown component includes proper ARIA attributes:
        

        

          
- `role="combobox"` on the dropdown trigger
          
- `aria-expanded` indicates open/closed state
          
- `aria-haspopup="listbox"` indicates a popup menu
          
- `aria-controls` associates trigger with menu
          
- `aria-label` or `aria-labelledby` for accessible name
        

      
      
      
        ### Disabled State

        

          Disabled dropdowns are marked with the `disabled` attribute and are not focusable. Screen readers announce them as disabled.

### Icons

### Icon Accessibility

        
          

            All icons (Heroicons, Tabler, and Custom) include `aria-hidden="true"` by default.
            When using icons without text labels, add an `aria-label` to the parent button or link
            for screen reader users.
          

          
`<button aria-label="Edit document">
  <Icon name="pencil" />
</button>

<button aria-label="Delete item">
  <Icon name="trash" />
</button>`

### Inputs

### Labels

        

          Always associate labels with inputs using the `for` attribute. The Label component handles this automatically.
        

      
      
        ### Error Announcements

        

          Error messages are automatically associated with inputs via `aria-describedby`. Use the `errorMessage` prop for clear feedback.

### Kanban

### Semantic Structure

        

          The Kanban board uses semantic HTML with `<section>` for the columns container and `<article>` for each column. The title bar uses `<h1>` and column headers use proper heading hierarchy with `<h2>` elements.
        

      
      
      
        ### ARIA Labels

        

          The Kanban board includes `role="region"` with an `aria-label` for the main container. Each column has `role="group"` with descriptive `aria-label` attributes. Column counts include `aria-label` for screen readers.
        

      
      
      
        ### Keyboard Navigation

        

          Cards are keyboard accessible and can be navigated using Tab. The "Add" buttons in column headers are fully keyboard accessible. For drag-and-drop functionality, implement keyboard alternatives such as arrow keys to move cards between columns.
        

      
      
      
        ### Screen Reader Support

        

          Column titles and card counts are announced by screen readers. Card titles and descriptions provide context. When implementing drag-and-drop, ensure proper ARIA live regions announce card movements to screen reader users.
        

      
      
      
        ### Focus Management

        

          All interactive elements (cards and buttons) include visible focus indicators that meet WCAG 2.1 requirements. Focus is clearly visible when navigating with keyboard.

### Labels

### Label Association

        

          Always use the `for` prop to associate labels with their corresponding form inputs. This ensures screen readers can identify which label belongs to which input.
        

      
      
      
        ### Required Indicators

        

          When using the `required` prop, the label visually indicates required fields. Ensure the associated input also has the `required` attribute for proper form validation and screen reader announcements.
        

      
      
      
        ### Screen Reader Support

        

          Screen readers announce label text when associated inputs receive focus. Helper text (via the `helper` prop) is also announced to provide additional context.
        

      
      
      
        ### Semantic HTML

        

          Labels use semantic `<label>` elements, which provide the proper relationship with form controls and enable clicking the label to focus the associated input.

### Links

### Semantic HTML

        

          Links use semantic `<a>` elements, ensuring proper navigation behavior and screen reader support. External links automatically include an icon and `aria-label` indicating they open in a new tab.
        

      
      
      
        ### Keyboard Navigation

        

          All links are keyboard accessible. Use Tab to navigate to links and Enter to activate them. Links have visible focus indicators.
        

      
      
      
        ### External Links

        

          When the `external` prop is used, links include an icon and screen readers announce that the link opens in a new tab. This helps users understand the navigation behavior.
        

      
      
      
        ### Focus Indicators

        

          Links include visible focus indicators that meet WCAG 2.1 requirements. Focus is clearly visible when navigating with keyboard.

### Notification Badges

### ARIA Labels

        

          Notification badges should include `aria-label` attributes to provide context for screen readers. For example, "5 unread notifications" or "New message indicator".
        

      
      
      
        ### Screen Reader Support

        

          Screen readers announce badge content when properly labeled. For number badges, the count is announced. For dot badges, ensure an `aria-label` describes what the indicator represents.
        

      
      
      
        ### Color Contrast

        

          All notification badge variants meet WCAG 2.1 AA contrast requirements. Text and background colors provide sufficient contrast for readability, especially for number and overflow badges.
        

      
      
      
        ### Live Regions

        

          When badge counts update dynamically, consider using `aria-live="polite"` or `aria-live="assertive"` to announce changes to screen reader users, depending on the urgency of the update.

### Progress Bar

### ARIA Attributes

        

          Progress bars use `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` attributes to communicate progress to screen readers.
        

      
      
      
        ### Screen Reader Support

        

          Screen readers announce the current progress value and percentage. When `showLabel` is enabled, the percentage is also visually displayed for all users.
        

      
      
      
        ### Color Contrast

        

          All progress bar variants meet WCAG 2.1 AA contrast requirements. The progress indicator has sufficient contrast against the background for visibility.
        

      
      
      
        ### Labels

        

          Provide an `aria-label` or associated label text to describe what the progress bar represents (e.g., "Upload progress" or "Form completion").

### Radio Buttons

### Labels

        

          The RadioButton component automatically wraps the input in a `<label>` element, ensuring proper association between the label and radio button.
        

      
      
      
        ### Keyboard Navigation

        

          Radio buttons are navigable with Tab and selectable with Space. Arrow keys can be used to navigate between radio buttons in the same group.
        

      
      
      
        ### Group Association

        

          All radio buttons in a group must share the same `name` attribute. This ensures proper grouping and that only one option can be selected at a time.
        

      
      
      
        ### Error States

        

          When the `error` prop is set, the radio button automatically includes `aria-invalid="true"` and error messages are associated via `aria-describedby` for screen reader users.

### Radio Groups

### Fieldset and Legend

        

          The RadioGroup component uses `<fieldset>` and `<legend>` elements to group related radio buttons. This provides semantic structure and helps screen readers understand the relationship between options.
        

      
      
      
        ### Keyboard Navigation

        

          Radio buttons in a group are keyboard accessible. Use Tab to navigate to the group, then Arrow Up/Down or Arrow Left/Right to move between options. Space selects the focused option.
        

      
      
      
        ### Group Association

        

          All radio buttons in a group must share the same `name` attribute. The RadioGroup component ensures this by requiring a `name` prop that is applied to all child radio buttons.
        

      
      
      
        ### Error and Warning States

        

          When `error` or `warning` props are set, the group and all child radio buttons display the appropriate state. Error/warning messages are associated via `aria-describedby` and announced to screen readers.

### Spinner

### ARIA Attributes

        

          Spinners use `role="status"` and `aria-label` to indicate loading state to screen readers. The spinner is announced as a live region so users are informed when content is loading.
        

      
      
      
        ### Screen Reader Support

        

          Screen readers announce loading states. Provide descriptive `aria-label` text (e.g., "Loading content" or "Processing request") to give context about what is loading.
        

      
      
      
        ### Animation Preferences

        

          The spinner respects user preferences for reduced motion. When `prefers-reduced-motion` is enabled, animations are minimized or removed to accommodate users with motion sensitivity.

### Stepper

### Keyboard Navigation

        

          In non-linear mode, steps are keyboard accessible. Use Tab to navigate between steps,
          and Enter or Space to activate a step.
        

      
      
      
        ### ARIA Attributes

        

          The Stepper component uses proper ARIA attributes:
        

        

          
- `role="group"` on the stepper container
          
- `aria-current="step"` on the active step label
          
- `aria-label` for step descriptions in non-linear mode
          
- `aria-hidden` for decorative elements (connectors, indicators)
        

      
      
      
        ### Screen Reader Support

        

          Screen readers announce the step number, label text, and current state (active, completed, error, warning).
          The relationship between steps is clearly communicated through ARIA attributes.
        

      

      
        ### Visual Indicators

        

          All step states are communicated both visually and through ARIA attributes. Color is not the only
          indicator of state - icons, borders, and text styles also convey information.

### Tab Strip

### Keyboard Navigation

        

          Tabs support full keyboard navigation:
        

        

          
- Tab - Navigate to tab strip
          
- Arrow Left/Right - Navigate between tabs
          
- Home / End - Jump to first/last tab
          
- Enter or Space - Activate selected tab
          
- Escape - Close overflow dropdown if open
        

      
      
      
        ### ARIA Attributes

        

          The TabStrip component includes proper ARIA attributes:
        

        

          
- `role="tablist"` on the container
          
- `role="tab"` on each tab button
          
- `aria-selected` indicates the active tab
          
- `aria-disabled` for disabled tabs
          
- `aria-controls` associates tabs with their panels
          
- `aria-label` for icon-only or overflow buttons
        

      
      
      
        ### Screen Reader Support

        

          Screen readers announce tab labels, active state, and navigation instructions. The active tab is clearly indicated, and disabled tabs are announced as unavailable.
        

      
      
      
        ### Focus Management

        

          Focus indicators are visible on all interactive elements. When a tab is activated, focus moves to the corresponding tab panel content. The overflow dropdown properly manages focus when opened.
        

      
    
  

  // Demo: Listen for tab strip events
  document.addEventListener('tab-strip:tab-selected', (e) => {
    console.log('Tab selected:', e.detail.tabId);
    // In a real application, you would handle tab selection here
    // For example: show corresponding tab panel, update state, etc.
  });

  document.addEventListener('tab-strip:add-tab', () => {
    console.log('Add tab requested');
    // In a real application, you would handle adding a new tab here
  });

  document.addEventListener('tab-strip:close-tab', (e) => {
    console.log('Close tab:', e.detail.tabId);
    // In a real application, you would handle closing the tab here
  });

  document.addEventListener('tab-strip:open-new-window', (e) => {
    console.log('Open in new window:', e.detail.tabId);
    // In a real application, you would handle opening in new window here
  });

### Toggle Switches

### Labels

        

          The Toggle component automatically associates labels with the toggle switch. When a `label` prop is provided, it is properly linked to the input element for screen reader support.
        

      
      
      
        ### Keyboard Navigation

        

          Toggle switches are keyboard accessible. Use Tab to navigate to toggles and Space to toggle the state.
        

      
      
      
        ### ARIA Attributes

        

          Toggles use `role="switch"` and include `aria-checked` to indicate the current state. The label is associated using `aria-labelledby`.
        

      
      
      
        ### Screen Reader Support

        

          Screen readers announce the toggle label and current state (on/off). State changes are announced when toggles are activated.
        

      
      
      
        ### Disabled State

        

          Disabled toggles are marked with the `disabled` attribute and are not focusable. Screen readers announce them as disabled.

### Tooltips

### ARIA Attributes

        

          Tooltips use `role="tooltip"` and are associated with their trigger element using `aria-describedby`. This ensures screen readers announce tooltip content when the trigger receives focus.
        

      
      
      
        ### Keyboard Access

        

          Tooltips appear on hover for mouse users and on focus for keyboard users. When a tooltip trigger receives keyboard focus, the tooltip is displayed to provide context.
        

      
      
      
        ### Screen Reader Support

        

          Screen readers announce tooltip content when the associated element receives focus. Tooltips should supplement, not replace, accessible labels on interactive elements.
        

      
      
      
        ### Important Information

        

          Do not rely solely on tooltips for critical information. Important details should be visible in the UI or provided through accessible labels, as tooltips may not be discovered by all users.

### Shell: Footer

### Keyboard Navigation

          

            Use Tab to move focus between tabs. Press Enter or Space to activate a focused tab. Arrow keys can be used to move between tabs within the tablist.
          

        

        
          ### ARIA Labels

          

            The component uses proper ARIA roles and attributes: `role="tablist"` on the nav, `role="tab"` on each tab, and `aria-selected` to indicate the active tab.
          

        

        
          ### Screen Reader Support

          

            Screen readers announce "Workspace tabs" when entering the footer, the active state of each tab, and descriptive labels for the More and Add Tab buttons.
          

        

        
          ### Focus Indicators

          

            Tabs display a visible focus outline when navigated via keyboard. The focus style uses a 2px outline in the primary color to ensure sufficient contrast.
          

        
      
    
  

  // Demo: Listen for TabStrip events (used by ShellFooter)
  document.addEventListener('tab-strip:tab-selected', (e) => {
    console.log('Tab selected:', e.detail.tabId);
    // In a real application, you would handle tab selection here
    // For example: navigate to a different workspace, update state, etc.
  });

  document.addEventListener('tab-strip:close-tab', (e) => {
    console.log('Close individual tab:', e.detail.tabId);
    // In a real application, you would handle closing the individual tab here
    // For example: remove tab from state, close workspace, etc.
  });

  document.addEventListener('tab-strip:add-tab', () => {
    console.log('Add tab requested');
    // In a real application, you would handle adding a new tab here
    // For example: open new workspace dialog, create new tab, etc.
  });

  document.addEventListener('tab-strip:open-new-window', (e) => {
    console.log('Open tab in new window:', e.detail.tabId);
    // In a real application, you would handle opening tab in new window here
  });

### Shell: Left Sidebar

### Keyboard Navigation

        

          All navigation items are keyboard accessible. Use Tab to navigate between items and Enter to activate them.

### Shell: Page Content

### Semantic Structure

          

            Use proper heading hierarchy (h1 → h2 → h3). Each page should have one h1. Section titles use h2.
            Screen readers rely on this structure for navigation. Cards should use article or section elements when
            representing standalone content.
          

        

        
          ### Keyboard Navigation

          

            Ensure all interactive elements within cards are keyboard accessible. Use Tab to navigate between elements,
            Enter or Space to activate. Interactive cards should have visible focus indicators and clear hover states.
          

        

        
          ### Color Contrast

          

            Maintain WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text). Card borders and backgrounds
            should have sufficient contrast. Test with dark mode enabled. Primary accent borders provide visual emphasis
            that doesn't rely solely on color.
          

        

        
          ### Descriptive Labels

          

            Use descriptive aria-label attributes for icon-only buttons within cards. Ensure card actions clearly
            communicate their purpose to screen reader users. Header action icons should have accessible names
            (e.g., "Close", "Expand", "Settings").

### Shell: Page Header

### Semantic HTML

          

            The component uses a semantic `<header>` element with an `<h1>` for the title, ensuring proper document structure and heading hierarchy.
          

        

        
          ### Keyboard Navigation

          

            All buttons are fully keyboard accessible. Use Tab to navigate between buttons, and Enter or Space to activate. Focus indicators are provided for all interactive elements.
          

        

        
          ### Color Contrast

          

            Button colors meet WCAG AA contrast requirements. The dark blue (#043852) provides sufficient contrast against white backgrounds for both text and borders.
          

        

        
          ### Button Labels

          

            Buttons include both text labels and optional icons. Icons enhance recognition but don't replace text, ensuring screen reader compatibility.

### Shell: Panel

### Keyboard Navigation

        

          All action buttons (maximize/minimize, popout, close) are keyboard accessible. Use Tab to navigate between buttons and Enter or Space to activate them. Focus management ensures proper tab order when the panel is open.
        

      
      
      
        ### Focus Management

        

          When a panel opens, focus should move to the panel content. When closing, focus should return to the element that triggered the panel. Ensure proper focus trapping within the panel when it's open.
        

      
      
      
        ### Screen Reader Support

        

          Panel headers use semantic heading elements (`<h2>`) for proper screen reader navigation. All action buttons include descriptive `aria-label` attributes. Panel state (open/closed) should be communicated to assistive technologies.
        

      
      
      
        ### Escape Key

        

          Panels should close when the Escape key is pressed, providing a quick way to dismiss the panel without using the mouse.
        

      
    
  

  /* Shell-layout wrapper for demos - provides context for panel CSS */
  .shell-layout {
    /* Override shell-layout default styles for demo context */
    height: auto;
    overflow: visible;
  }

  .panel-demo-container {
    position: relative;
    min-height: 500px;
    background-color: var(--page-bg);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    overflow: hidden;
    isolation: isolate;
  }

  .panel-demo-container--full {
    min-height: 600px;
    box-shadow: var(--shadow-xl);
  }

  .panel-demo-content {
    position: relative;
    z-index: 1;
    margin-bottom: var(--space-4);
  }

  /* CRITICAL: Use :global() to override ShellPanel's fixed positioning for demo context */
  .panel-demo-container :global(.shell-panel) {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: auto !important;
    bottom: 0 !important;
    z-index: 10 !important;
  }

  .panel-demo-container :global(.shell-panel--right) {
    left: auto !important;
    right: 0 !important;
  }

### Shell: Right Sidebar

### Keyboard Navigation

        

          All navigation items are keyboard accessible. Use Tab to navigate between items and Enter to activate them.

## Layout

### Dialogs

The dialog uses a column flex layout: the header and footer are sticky (always visible), and only the body scrolls when content overflows. Sizing and spacing use design tokens only (e.g. `--dialog-min-width`, `--dialog-max-width-default`, `--dialog-margin`, `--space-*`, `--radius-xl`).

## Implementation Notes

### Shell: Footer

### Tab Navigation

            

              Tabs represent different workspaces or contexts within the application. When a user clicks a tab, it should switch the main content area to display that workspace's content. Tabs can use either `href` for navigation or button behavior for dynamic switching.
            

            

              Example: In a project management tool, tabs might represent different projects or dashboards that the user has open.
            

          
        

        
          
            ### Overflow Behavior

            

              The "More" dropdown appears when `showMore={true}` is set and displays the number of hidden tabs via `moreCount`. This prevents the tab bar from becoming cluttered when users have many workspaces open.
            

            

              Recommendation: Implement logic to automatically show "More" when tabs exceed viewport width, typically around 8-10 visible tabs.
            

          
        

        
          
            ### Component Props

            

              The ShellFooter component accepts several props for customization:
            

            

              
- `tabs`: Array of tab objects with id, label, active, and optional href
              
- `showMore`: Boolean to display the More dropdown (default: false)
              
- `moreCount`: Number displayed in More button (default: 0)
              
- `showAddTab`: Boolean to show Add Tab button (default: true)
              
- `variant`: 'default' or 'compact' for different sizes
            

          
        

        
          
            ### CP Alternative: Floating Nav

            

              Instead of the Shell Footer, the Costpoint (CP) theme uses the Floating Nav component. This floating toolbar appears below the header and contains action buttons (Execute, Actions, Refresh, Save) rather than workspace tabs.
            

            

              The Floating Nav serves a different purpose - providing quick access to common actions on the current page, rather than navigating between workspaces.

### Shell: Header

### Gradient Border

            

              The gradient border fades at the edges (opacity 0.02) and is solid in the center (50%). The 6px height creates a subtle visual accent that changes with company selection.
            

          
        

        
          
            ### Company Dropdown

            

              Each company has a colored circle indicator that matches its gradient color. The dropdown is populated from the theme configuration and supports multiple companies per product.
            

          
        

        
          
            ### Avatar Component

            

              The avatar uses the theme primary color for its background and displays a white user icon. Available in sm (32px), md (40px), and lg (48px) sizes.
            

          
        
      
    
  

  // Helper: Convert RGB/RGBA to hex
  function rgbToHex(rgb: string): string {
    if (!rgb || rgb.startsWith('#')) return rgb;
    
    const values = rgb.match(/\d+/g);
    if (!values || values.length  {
    e.stopPropagation();
    demoCompanyPickerMenu?.classList.toggle('company-picker__menu--open');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    demoCompanyPickerMenu?.classList.remove('company-picker__menu--open');
  });

  // Render demo company menu
  function renderDemoCompanyMenu() {
    if (!demoCompanyPickerMenu) return;

    // Map company IDs to CSS classes for indicators
    const companyClassMap: Record = {
      'acme-corp': 'company-picker__option-indicator--acme',
      'ocean-industries': 'company-picker__option-indicator--ocean',
      'violet-systems': 'company-picker__option-indicator--violet',
      'azure-dynamics': 'company-picker__option-indicator--azure',
      'sunset-corporation': 'company-picker__option-indicator--sunset'
    };

    demoCompanyPickerMenu.innerHTML = demoCompanies.map(company => {
      const indicatorClass = companyClassMap[company.id] || '';
      return `
        
          
          ${company.name}
        
      `;
    }).join('');

    // Add click handlers
    demoCompanyPickerMenu.querySelectorAll('.company-picker__option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const companyId = (e.currentTarget as HTMLElement).dataset.companyId;
        if (companyId) {
          selectedDemoCompany = companyId;
          updateDemoCompany();
          demoCompanyPickerMenu.classList.remove('company-picker__menu--open');
        }
      });
    });
  }

  // Update demo company display and gradient
  function updateDemoCompany() {
    const company = demoCompanies.find(c => c.id === selectedDemoCompany);
    if (!company) return;

    // Get color from CSS variable
    const hexColor = getCSSVariableHex(company.cssVar);
    if (!hexColor) return;

    // Update company name
    if (demoCompanyNameEl) {
      demoCompanyNameEl.textContent = company.name;
    }

    // Update indicator color
    if (demoCompanyIndicator) {
      demoCompanyIndicator.style.backgroundColor = hexColor;
    }

    // Update gradient border
    if (demoHeaderGradient) {
      demoHeaderGradient.style.background = `
        linear-gradient(
          to right,
          ${hexColor}05,
          ${hexColor} 50%,
          ${hexColor}05
        )
      `;
    }

    // Update selected state in menu
    renderDemoCompanyMenu();
  }

  // Initialize demo
  renderDemoCompanyMenu();
  // Initialize gradient on page load
  updateDemoCompany();

  .demo-header {
    height: 56px;
    background-color: var(--nav-bg);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--space-6);
    gap: var(--space-6);
  }

### Shell: Page Content

### Basic Structure

            

              Page content uses semantic HTML with article and section elements for proper document structure.
            

            
              <article class="space-y-12">
                <header class="page-header">
                  <h1>Page Title</h1>
                  <p>Description</p>
                </header>
              
                <section class="space-y-6">
                  <h2 class="section__title">Section Title</h2>
                  <Card>...</Card>
                </section>
              </article>
            
          
        

        
          
            ### Card Grid Patterns

            
Common grid layouts for organizing multiple cards:

            
              
                
Two Column Grid

                
                  <div class="grid md:grid-cols-2 gap-4">
                    <Card>...</Card>
                    <Card>...</Card>
                  </div>
                
              
              
                
Three Column Grid

                
                  <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>...</Card>
                    <Card>...</Card>
                    <Card>...</Card>
                  </div>
                
              
              
                
Mixed Width Grid

                
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card class="md:col-span-2">...</Card>
                    <Card>...</Card>
                  </div>
                
              
            
          
        

        
          
            ### Semantic HTML

            
Use proper HTML5 elements for better SEO and accessibility:

            

              
- <article> - Wrap main content area
              
- <section> - Major content divisions
              
- <header> - Page/section headers
              
- <h1>-<h6> - Maintain heading hierarchy
              
- <footer> - Section footers when needed
            

          
        

        
          
            ### CSS Variables

            
Key CSS variables used in page content and cards:

            
              
                --page-bg
                Page background color
              
              
                --card-bg
                Card background color
              
              
                --border-color
                Card borders
              
              
                --theme-primary
                Primary accent color
              
              
                --space-6
                Standard spacing (24px)
              
              
                --radius-xl
                Card border radius (16px)
              
            
          
        

        
          
            ### Performance Tips

            

              
- Lazy load images within cards for faster initial page load
              
- Virtualize long lists when displaying many cards (50+)
              
- Use skeleton loaders during data fetching to maintain layout stability
              
- Avoid deeply nested card structures (3+ levels) that can impact performance
              
- Implement infinite scroll or pagination for very long content
              
- Consider code-splitting for heavy components loaded in cards

### Shell: Page Header

### Basic Usage

            

              The Shell Page Header is used within the ShellLayout's main content area, above page content cards.
            

            
              <ShellLayout>
                <ShellPageHeader
                  title="Page Title"
                  subtitle="Optional subtitle"
                  primaryButton=&#123;&#123; text: "Save", icon: "check" &#125;&#125;
                />
                <Card>...</Card>
              </ShellLayout>
            
          
        

        
          
            ### Button Styling

            

              All buttons use the page header button style with dark blue (#043852) colors:
            

            

              
- • Primary button: Solid dark blue background with white text
              
- • Outline buttons: Transparent background with dark blue border and text
              
- • Both variants use buttonType="pageHeader"
              
- • Standard button size is md (40px height)
            

          
        

        
          
            ### Typography

            

              The component uses design system typography tokens:
            

            

              
- • Title: text-heading-l (24px, semibold, Lexend font)
              
- • Subtitle: text-base (16px, normal, Figtree font)
              
- • Title and subtitle are stacked vertically with appropriate spacing
            

          
        

        
          
            ### Responsive Behavior

            

              On mobile devices (below md breakpoint), the layout adapts:
            

            

              
- • Header switches to vertical layout (title/subtitle on top, buttons below)
              
- • Buttons wrap to multiple lines if needed
              
- • Buttons maintain minimum width for touch targets
              
- • Spacing adjusts for smaller screens

## Best Practices

### Shell: Page Content

### Do

          

            
- Use consistent spacing between sections (space-y-6, space-y-8)
            
- Group related content within individual cards
            
- Provide clear section headers with descriptive titles
            
- Use primary accent cards sparingly to maintain emphasis
            
- Maintain proper heading hierarchy (h1 → h2 → h3)
            
- Keep page headers concise and action-oriented
            
- Test responsive layouts at different screen sizes
            
- Use semantic HTML elements for better accessibility
          

        

        
          ### Don't

          

            
- Don't overcrowd cards with too much content
            
- Don't use too many accent cards (loses emphasis)
            
- Don't forget to implement responsive breakpoints
            
- Don't mix multiple visual patterns inconsistently
            
- Don't skip page headers - they provide context
            
- Don't create overly deep nesting (3+ card levels)
            
- Don't use interactive cards without clear affordances
            
- Don't ignore empty and loading states

## Behavior

### Shell: Footer

### Tab Selection

          

            Click or tap on a tab to activate it. The active tab displays a blue underline indicator at the bottom. Only one tab can be active at a time.
          

        

        
          ### Overflow Handling

          

            When there are more tabs than can fit in the viewport, additional tabs are accessible through the "More" dropdown button which displays the count of hidden tabs.
          

        

        
          ### Add Tab

          

            The "Add Tab" button appears at the far right of the tab bar, allowing users to create new workspace tabs. This button can be hidden via the showAddTab prop.
          

        

        
          ### Fixed Position

          

            The shell footer is docked at the bottom of the application shell, remaining visible as users navigate through different views within a workspace.

### Shell: Left Sidebar

### Collapsible

          

            Collapsed by default showing only icons (~52px width). Expands on hover to reveal labels (~220px width).
          

        
        
        
          ### Fixed Position

          

            Docked to the left edge of the viewport, vertically centered. Stays in place while content scrolls.
          

        
        
        
          ### Configurable Sections

          

            CP theme includes two sections (Main Navigation + Application Modules). VP, PPM, and Maconomy themes include a single section with theme-specific navigation items.
          

        
        
        
          ### Smooth Animation

          

            CSS transitions provide smooth expand/collapse animation with 200ms duration.

### Shell: Page Content

### Scrolling

          

            The page content area is scrollable when content exceeds viewport height. Shell header and
            footer remain fixed, providing consistent navigation access.
          

        

        
          ### Responsive Layout

          

            Card grids automatically stack on mobile devices. Use responsive utilities (md:, lg:) for
            breakpoint control. Test layouts at different screen sizes.
          

        

        
          ### Loading States

          

            During data fetching, display skeleton loaders or spinners within cards to maintain layout
            stability and provide visual feedback to users.
          

        

        
          ### Empty States

          

            When no content exists, display helpful empty state messages with clear actions to add content.
            Use icons and concise copy to guide users.

### Shell: Right Sidebar

### Collapsible

          

            Collapsed by default showing only icons (~52px width). Expands on hover to reveal labels (~220px width).
          

        
        
        
          ### Fixed Position

          

            Docked to the right edge of the viewport, vertically centered. Stays in place while content scrolls.
          

        
        
        
          ### Three Sections

          

            All themes organize items into three sections. CP theme has different items per section compared to VP/PPM/Maconomy themes.
          

        
        
        
          ### Dela AI Integration

          

            All themes feature the Dela logo (RS_DelaDefault.svg / RS_Dela_Active.svg) as the first icon, providing consistent access to AI assistance across all themes.
