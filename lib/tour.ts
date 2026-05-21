import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

const TOUR_KEY = 'dak_tour_done'

function buildDriver() {
  const d = driver({
    showProgress: true,
    animate: true,
    smoothScroll: true,
    allowClose: true,
    overlayOpacity: 0.4,
    stagePadding: 6,
    stageRadius: 8,
    popoverClass: 'dak-tour-popover',
    nextBtnText: 'Next →',
    prevBtnText: '← Back',
    doneBtnText: 'Done',
    onDestroyStarted: () => {
      localStorage.setItem(TOUR_KEY, '1')
      d.destroy()
    },
    steps: [
      {
        element: '#email-preview-root',
        popover: {
          title: 'Your email is live',
          description: 'Click any text (heading, paragraph, stat) to edit it inline. Changes save automatically.',
          side: 'left',
          align: 'start',
        },
      },
      {
        element: '#part-1',
        popover: {
          title: 'Multi-part emails',
          description: 'Long emails are split into parts so each image stays within Outlook\'s size limit. Each part exports as a separate PNG.',
          side: 'left',
          align: 'start',
        },
      },
      {
        element: '[data-tour="style-panel"]',
        popover: {
          title: 'Style your email',
          description: 'Switch themes, tweak primary and accent colours, change the font and size. All live with no regeneration needed.',
          side: 'left',
          align: 'start',
        },
      },
      {
        element: '[data-tour="logo-upload"]',
        popover: {
          title: 'Add your logo',
          description: 'Upload a PNG or JPG and it drops straight into the hero header. Remove or replace it any time.',
          side: 'left',
          align: 'start',
        },
      },
      {
        element: '[data-tour="export-panel"]',
        popover: {
          title: 'Export for Outlook',
          description: 'Download exports pixel-perfect PNGs ready to paste into Outlook or Teams. Copy mode walks you through pasting each part inline.',
          side: 'left',
          align: 'start',
        },
      },
    ],
  })

  return d
}

export function runTourIfNeeded() {
  if (typeof window === 'undefined') return
  if (localStorage.getItem(TOUR_KEY)) return
  buildDriver().drive()
}

export function startTour() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOUR_KEY)
  buildDriver().drive()
}
