import {
  defineConfig,
  presetIcons,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

const v = (name: string) => `var(--tr-${name})`

export default defineConfig({
  // ─── Presets ────────────────────────────────────────────────────────────────
  presets: [
    // not wind4: it publishes its theme as unprefixed vars on :root (--spacing, --font-sans…),
    // the same names as the host's Tailwind v4, and overrides them
    presetWind3({
      prefix: 'tr-',
      variablePrefix: 'tr-',
      preflight: 'on-demand',
    }),
    presetIcons({
      prefix: 'tr-i-',
      scale: 1,
      extraProperties: { display: 'inline-block', 'vertical-align': 'middle', 'flex-shrink': '0' },
    }),
  ],

  transformers: [transformerVariantGroup(), transformerDirectives()],

  theme: {
    colors: {
      accent: {
        DEFAULT: v('accent'),
        on: v('on-accent'),
        soft: v('accent-soft'),
        faint: v('accent-faint'),
      },
      slot: { DEFAULT: v('slot'), soft: v('slot-soft'), selection: v('slot-selection') },
      surface: { DEFAULT: v('surface'), sunken: v('surface-sunken'), hover: v('surface-hover') },
      line: { DEFAULT: v('border'), divider: v('divider') },
      ink: {
        DEFAULT: v('ink'),
        secondary: v('ink-secondary'),
        muted: v('ink-muted'),
        disabled: v('ink-disabled'),
      },
      track: { off: v('track-off') },
      inverse: { DEFAULT: v('inverse'), on: v('on-inverse') },
      warning: v('warning'),
      success: v('success'),
      danger: v('danger'),
      focus: v('focus-ring'),
    },
    // hover frames fade in at their new place instead of sweeping from the previous one
    animation: {
      keyframes: { 'fade-in': '{from{opacity:0}to{opacity:1}}' },
      durations: { 'fade-in': '120ms' },
      timingFns: { 'fade-in': 'ease-out' },
    },
    spacing: {
      1: v('space-1'),
      2: v('space-2'),
      3: v('space-3'),
      4: v('space-4'),
      5: v('space-5'),
      6: v('space-6'),
    },
    borderRadius: {
      xs: v('radius-xs'),
      sm: v('radius-sm'),
      md: v('radius-md'),
      lg: v('radius-lg'),
      full: v('radius-full'),
    },
    boxShadow: {
      float: v('shadow-float'),
      raised: v('shadow-raised'),
      drag: v('shadow-drag'),
    },
    fontFamily: {
      sans: v('font-sans'),
      mono: v('font-mono'),
    },
    fontSize: {
      title: ['15px', '20px'],
      body: ['13px', '18px'],
      small: ['12px', '16px'],
      meta: ['11px', '14px'],
      micro: ['10px', '14px'],
    },
    width: {
      panel: v('panel-w'),
      toolbar: v('toolbar-btn'),
      insert: v('insert-btn'),
      hit: v('hit-min'),
    },
    height: {
      control: v('control-h'),
      segment: v('segment-h'),
      toolbar: v('toolbar-btn'),
      insert: v('insert-btn'),
      hit: v('hit-min'),
    },
  },

  shortcuts: [
    {
      'tr-root-base': 'tr-font-sans tr-text-body tr-text-ink tr-antialiased [&_*]:tr-box-border',

      'tr-floating':
        'tr-bg-surface tr-border tr-border-solid tr-border-line tr-rounded-lg tr-shadow-float',
      'tr-panel': 'tr-floating tr-w-panel tr-flex tr-flex-col tr-z-[var(--tr-z-panel)]',
      'tr-toolbar': 'tr-floating tr-flex tr-items-center tr-gap-2 tr-p-3 tr-z-[var(--tr-z-panel)]',
      'tr-menu': 'tr-floating tr-flex tr-flex-col tr-p-2 tr-z-[var(--tr-z-menu)]',
      'tr-menu-item':
        'tr-h-[30px] tr-px-4 tr-flex tr-items-center tr-justify-between tr-rounded-sm tr-cursor-pointer tr-outline-none tr-text-body tr-select-none data-[highlighted]:tr-bg-surface-hover aria-selected:(tr-bg-slot-soft tr-text-slot tr-font-medium) data-[disabled]:(tr-text-ink-disabled tr-cursor-default)',

      'tr-btn-reset':
        'tr-border-0 tr-bg-transparent tr-p-0 tr-[font:inherit] tr-[color:inherit] tr-cursor-pointer focus-visible:(tr-outline-2 tr-outline-solid tr-outline-focus tr-outline-offset-1)',
      'tr-icon-btn':
        'tr-btn-reset tr-w-toolbar tr-h-toolbar tr-rounded-md tr-flex tr-items-center tr-justify-center tr-text-ink-secondary hover:tr-bg-surface-hover disabled:(tr-text-ink-disabled tr-cursor-default tr-bg-transparent)',
      'tr-btn-primary':
        'tr-btn-reset tr-h-toolbar tr-px-5 tr-rounded-md tr-bg-inverse tr-text-inverse-on tr-font-medium',
      'tr-btn-secondary':
        'tr-btn-reset tr-h-[28px] tr-px-4 tr-rounded-md tr-bg-surface tr-border tr-border-solid tr-border-line tr-text-small',

      'tr-search': 'tr-relative tr-w-full',
      'tr-search-icon':
        'tr-absolute tr-left-[10px] tr-top-1/2 tr-translate-y-[-50%] tr-text-[15px] tr-text-ink-muted tr-pointer-events-none',
      'tr-search-input':
        'tr-field tr-px-[34px] tr-appearance-none placeholder:tr-text-ink-muted hover:tr-border-line-strong focus:hover:tr-border-accent [&::-webkit-search-cancel-button]:tr-hidden',
      'tr-search-clear':
        'tr-btn-reset tr-absolute tr-right-[5px] tr-top-1/2 tr-translate-y-[-50%] tr-w-[24px] tr-h-[24px] tr-flex tr-items-center tr-justify-center tr-rounded-sm tr-text-ink-muted hover:(tr-bg-surface-hover tr-text-ink)',
      'tr-search-empty': 'tr-m-0 tr-text-small tr-text-ink-muted',

      'tr-field':
        'tr-h-control tr-w-full tr-px-4 tr-bg-surface tr-border tr-border-solid tr-border-line tr-rounded-md tr-text-ink tr-text-body tr-outline-none focus:(tr-border-accent tr-ring-3 tr-ring-accent-soft)',
      'tr-segmented':
        'tr-grid tr-grid-flow-col tr-auto-cols-fr tr-gap-1 tr-p-1 tr-bg-surface-sunken tr-rounded-md',
      'tr-segment':
        'tr-btn-reset tr-h-segment tr-rounded-sm tr-text-body tr-text-ink-secondary aria-pressed:(tr-bg-surface tr-shadow-raised tr-text-ink tr-font-medium)',
      'tr-switch':
        'tr-btn-reset tr-relative tr-w-[36px] tr-h-[20px] tr-rounded-full tr-bg-track-off aria-checked:tr-bg-accent',
      'tr-switch-thumb':
        'tr-block tr-w-[16px] tr-h-[16px] tr-rounded-full tr-bg-surface tr-shadow-raised tr-translate-x-[2px] tr-transition-transform data-[state=checked]:tr-translate-x-[18px]',
      'tr-prop-row': 'tr-flex tr-flex-col tr-gap-[7px]',
      'tr-prop-head': 'tr-flex tr-justify-between tr-items-baseline',
      'tr-prop-name': 'tr-font-sans tr-font-medium tr-text-body tr-text-ink',
      'tr-prop-type': 'tr-font-mono tr-text-meta tr-text-ink-muted',
      'tr-title': 'tr-text-title tr-font-sans tr-text-ink tr-tracking-tight ',

      'tr-overlay': 'tr-fixed tr-pointer-events-none tr-z-[var(--tr-z-overlay)]',
      'tr-frame-hover': 'tr-overlay tr-border tr-border-dashed tr-border-accent tr-rounded-sm',
      'tr-frame-selected':
        'tr-overlay tr-border-[length:var(--tr-stroke-selected)] tr-border-solid tr-border-accent tr-rounded-sm',
      'tr-frame-slot': 'tr-overlay tr-border tr-border-dashed tr-border-slot tr-rounded-sm',
      'tr-frame-slot-editing':
        // fieldset: la <legend> interrompt nativement la bordure
        'tr-overlay tr-border tr-border-solid tr-border-slot tr-bg-slot-soft tr-rounded-sm tr-m-0 tr-p-0 tr-min-w-0 tr-box-border',

      'tr-tag':
        'tr-inline-flex tr-items-center tr-gap-[5px] tr-h-[26px] tr-pl-3 tr-pr-4 tr-rounded-sm tr-bg-accent tr-text-accent-on tr-text-small tr-font-medium tr-whitespace-nowrap tr-cursor-grab',
      'tr-tag-bar':
        'tr-absolute tr-left-[calc(var(--tr-overlay-offset)*-1)] tr-bottom-[calc(100%+var(--tr-overlay-offset)+var(--tr-label-gap))] tr-flex tr-items-center tr-gap-2 tr-pointer-events-auto tr-z-[var(--tr-z-overlay)]',
      'tr-tag-action':
        'tr-btn-reset tr-relative tr-w-[26px] tr-h-[26px] tr-flex tr-items-center tr-justify-center tr-rounded-sm tr-bg-surface tr-border tr-border-solid tr-border-line tr-shadow-raised tr-text-ink-secondary hover:tr-text-ink after:(tr-content-empty tr-absolute tr-inset-[-9px])',
      'tr-tag-action-danger':
        'tr-tag-action hover:(tr-text-danger tr-border-danger) focus-visible:tr-text-danger',
      'tr-tag-ghost':
        'tr-inline-flex tr-items-center tr-h-[22px] tr-px-3 tr-rounded-sm tr-bg-surface tr-border tr-border-solid tr-border-line tr-text-accent tr-font-mono tr-text-meta',
      'tr-slot-label':
        // h-0: la légende ne pousse plus la bordure haute vers le bas, la box garde sa taille
        'tr-ml-2 tr-h-0 tr-font-mono tr-text-micro tr-font-medium tr-text-slot',
      // le texte se centre sur la bordure grâce à son propre -50%
      'tr-slot-label-text': 'tr-block tr-px-2 tr-translate-y-[-50%]',

      'tr-card-grid': 'tr-grid tr-grid-cols-2 tr-gap-3',
      'tr-card':
        'tr-btn-reset tr-flex tr-flex-col tr-gap-3 tr-pt-[6px] tr-px-[6px] tr-pb-4 tr-text-left tr-bg-surface tr-border tr-border-solid tr-border-line tr-rounded-[10px] tr-text-ink tr-transition-shadow hover:(tr-border-accent tr-ring-3 tr-ring-accent-soft) focus-visible:(tr-outline-2 tr-outline-solid tr-outline-accent tr-outline-offset-2) aria-disabled:(tr-opacity-45 tr-cursor-not-allowed hover:tr-border-line hover:tr-ring-0)',
      'tr-card-thumb':
        'tr-h-[84px] tr-w-full tr-rounded-sm tr-bg-surface-sunken tr-object-cover tr-overflow-hidden tr-block',
      'tr-card-thumb-fallback':
        'tr-card-thumb tr-flex tr-items-center tr-justify-center tr-text-ink-disabled tr-text-[22px]',
      'tr-card-name': 'tr-px-2 tr-text-body tr-font-medium tr-truncate',

      'tr-insert':
        'tr-btn-reset tr-absolute tr-w-insert tr-h-insert tr-rounded-full tr-bg-accent tr-text-accent-on tr-flex tr-items-center tr-justify-center tr-border-2 tr-border-solid tr-border-[var(--tr-surface)] tr-pointer-events-auto',

      'tr-dot': 'tr-w-[6px] tr-h-[6px] tr-rounded-full tr-shrink-0',
    },
    [
      /^tr-insert-(bottom|right|left|top)$/,
      ([, side]) =>
        (
          ({
            bottom: 'tr-insert tr-bottom-[-13px] tr-left-1/2 tr-translate-x-[-50%]',
            top: 'tr-insert tr-top-[-13px] tr-left-1/2 tr-translate-x-[-50%]',
            right: 'tr-insert tr-right-[-13px] tr-top-1/2 tr-translate-y-[-50%]',
            left: 'tr-insert tr-left-[-13px] tr-top-1/2 tr-translate-y-[-50%]',
          }) as Record<string, string>
        )[side],
    ],
  ],

  safelist: ['tr-insert-bottom', 'tr-insert-right', 'tr-insert-left', 'tr-insert-top'],
})
