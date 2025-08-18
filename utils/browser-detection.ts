// Browser detection utilities for cross-browser compatibility

export interface BrowserInfo {
  name: string
  version: string
  isSupported: boolean
  features: {
    cssGrid: boolean
    flexboxGap: boolean
    customProperties: boolean
    backdropFilter: boolean
    smoothScroll: boolean
    intersectionObserver: boolean
    resizeObserver: boolean
    objectFit: boolean
  }
}

export const detectBrowser = (): BrowserInfo => {
  if (typeof window === 'undefined') {
    return {
      name: 'unknown',
      version: '0',
      isSupported: true,
      features: {
        cssGrid: true,
        flexboxGap: true,
        customProperties: true,
        backdropFilter: true,
        smoothScroll: true,
        intersectionObserver: true,
        resizeObserver: true,
        objectFit: true,
      },
    }
  }

  const userAgent = navigator.userAgent
  let browserName = 'unknown'
  let browserVersion = '0'

  // Detect browser
  if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) {
    browserName = 'chrome'
    const match = userAgent.match(/Chrome\/(\d+)/)
    browserVersion = match ? match[1] : '0'
  }
  else if (userAgent.includes('Firefox')) {
    browserName = 'firefox'
    const match = userAgent.match(/Firefox\/(\d+)/)
    browserVersion = match ? match[1] : '0'
  }
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browserName = 'safari'
    const match = userAgent.match(/Version\/(\d+)/)
    browserVersion = match ? match[1] : '0'
  }
  else if (userAgent.includes('Edge')) {
    browserName = 'edge'
    const match = userAgent.match(/Edge\/(\d+)/)
    browserVersion = match ? match[1] : '0'
  }

  // Feature detection
  const features = {
    cssGrid: typeof CSS !== 'undefined' && CSS.supports('display', 'grid'),
    flexboxGap: typeof CSS !== 'undefined' && CSS.supports('gap', '1px'),
    customProperties:
      typeof CSS !== 'undefined' && CSS.supports('--css', 'variables'),
    backdropFilter:
      typeof CSS !== 'undefined'
      && (CSS.supports('backdrop-filter', 'blur(1px)')
        || CSS.supports('-webkit-backdrop-filter', 'blur(1px)')),
    smoothScroll:
      typeof document !== 'undefined'
      && 'scrollBehavior' in document.documentElement.style,
    intersectionObserver:
      typeof window !== 'undefined' && 'IntersectionObserver' in window,
    resizeObserver: typeof window !== 'undefined' && 'ResizeObserver' in window,
    objectFit:
      typeof CSS !== 'undefined' && CSS.supports('object-fit', 'cover'),
  }

  // Determine if browser is supported
  const minVersions = {
    chrome: 60,
    firefox: 60,
    safari: 12,
    edge: 79,
  }

  const isSupported
    = browserName in minVersions
      ? parseInt(browserVersion)
      >= minVersions[browserName as keyof typeof minVersions]
      : false

  return {
    name: browserName,
    version: browserVersion,
    isSupported,
    features,
  }
}

export const addBrowserClasses = () => {
  if (typeof document === 'undefined') return

  const browser = detectBrowser()
  const html = document.documentElement

  // Add browser class
  html.classList.add(browser.name)

  // Add feature classes
  Object.entries(browser.features).forEach(([feature, supported]) => {
    html.classList.add(supported ? `supports-${feature}` : `no-${feature}`)
  })

  // Add supported/unsupported class
  html.classList.add(
    browser.isSupported ? 'supported-browser' : 'unsupported-browser',
  )
}

export const logBrowserInfo = () => {
  if (typeof console === 'undefined') return

  const browser = detectBrowser()

  console.group('🌐 Browser Compatibility Info')
  console.log(`Browser: ${browser.name} ${browser.version}`)
  console.log(`Supported: ${browser.isSupported ? '✅' : '❌'}`)
  console.log('Features:')
  Object.entries(browser.features).forEach(([feature, supported]) => {
    console.log(`  ${feature}: ${supported ? '✅' : '❌'}`)
  })
  console.groupEnd()

  if (!browser.isSupported) {
    console.warn(
      '⚠️ This browser version may not be fully supported. Please update to the latest version for the best experience.',
    )
  }
}

export const showBrowserWarning = () => {
  const browser = detectBrowser()

  if (!browser.isSupported && typeof document !== 'undefined') {
    const warning = document.createElement('div')
    warning.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #f59e0b;
        color: white;
        padding: 12px;
        text-align: center;
        z-index: 9999;
        font-family: system-ui, sans-serif;
        font-size: 14px;
      ">
        ⚠️ Ваш браузер ${browser.name} ${browser.version} может не поддерживать все функции сайта. 
        Рекомендуем обновить браузер для лучшего опыта.
        <button onclick="this.parentElement.remove()" style="
          background: none;
          border: none;
          color: white;
          margin-left: 12px;
          cursor: pointer;
          font-size: 16px;
        ">×</button>
      </div>
    `

    document.body.appendChild(warning)

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (warning.parentElement) {
        warning.remove()
      }
    }, 10000)
  }
}
