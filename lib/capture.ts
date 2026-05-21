import { toPng } from 'html-to-image'

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(blob)
  })
}

async function embedImages(container: HTMLElement): Promise<void> {
  const images = container.querySelectorAll('img')
  for (const img of Array.from(images)) {
    if (img.src.startsWith('data:')) continue
    try {
      const res = await fetch(img.src)
      const blob = await res.blob()
      img.src = await blobToBase64(blob)
    } catch {
      // skip images that fail to load
    }
  }
}

async function captureElement(el: HTMLElement, bgColor: string): Promise<string> {
  return toPng(el, {
    pixelRatio: 2,
    backgroundColor: bgColor,
    width: 800,
    style: {
      width: '800px',
      minWidth: '800px',
      maxWidth: '800px',
    },
  })
}

function dataUrlToCanvas(dataUrl: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      resolve(canvas)
    }
    img.src = dataUrl
  })
}

function normalizeCanvas(
  canvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
  bgColor: string,
): HTMLCanvasElement {
  const final = document.createElement('canvas')
  final.width = targetWidth
  final.height = targetHeight
  const ctx = final.getContext('2d')!
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, targetWidth, targetHeight)
  ctx.drawImage(canvas, 0, 0)
  return final
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png')
  })
}

export async function capturePartsAsBlobs(
  partCount: number,
  setStatus: (s: string) => void,
): Promise<Blob[]> {
  setStatus('Capturing...')

  const previewRoot = document.getElementById('email-preview-root')!
  const bgColor = getComputedStyle(previewRoot).getPropertyValue('--email-bg').trim() || '#ffffff'

  const dataUrls: string[] = []
  for (let i = 1; i <= partCount; i++) {
    const el = document.getElementById(`part-${i}`)
    if (!el) continue
    await embedImages(el)
    const dataUrl = await captureElement(el, bgColor)
    dataUrls.push(dataUrl)
    await new Promise(r => setTimeout(r, 200))
  }

  const canvases = await Promise.all(dataUrls.map(dataUrlToCanvas))
  const maxWidth  = Math.max(...canvases.map(c => c.width))
  const maxHeight = Math.max(...canvases.map(c => c.height))

  const blobs: Blob[] = []
  for (const canvas of canvases) {
    const normalised = normalizeCanvas(canvas, maxWidth, maxHeight, bgColor)
    blobs.push(await canvasToBlob(normalised))
  }
  return blobs
}

export async function exportEmail(
  partCount: number,
  projectName: string,
  setStatus: (s: string) => void
): Promise<void> {
  setStatus('Capturing...')

  const previewRoot = document.getElementById('email-preview-root')!
  const bgColor = getComputedStyle(previewRoot).getPropertyValue('--email-bg').trim() || '#ffffff'

  const dataUrls: string[] = []
  for (let i = 1; i <= partCount; i++) {
    const el = document.getElementById(`part-${i}`)
    if (!el) continue
    await embedImages(el)
    const dataUrl = await captureElement(el, bgColor)
    dataUrls.push(dataUrl)
    await new Promise(r => setTimeout(r, 200))
  }

  const canvases = await Promise.all(dataUrls.map(dataUrlToCanvas))
  const maxWidth  = Math.max(...canvases.map(c => c.width))
  const maxHeight = Math.max(...canvases.map(c => c.height))

  setStatus(`Normalising ${partCount} image${partCount > 1 ? 's' : ''}...`)

  const name = (projectName || 'email').toLowerCase().replace(/\s+/g, '')

  for (let i = 0; i < canvases.length; i++) {
    const normalised = normalizeCanvas(canvases[i], maxWidth, maxHeight, bgColor)
    const link = document.createElement('a')
    const suffix = partCount === 1 ? '' : `_part${i + 1}`
    link.download = `${name}_dak${suffix}.png`
    link.href = normalised.toDataURL('image/png')
    link.click()
    await new Promise(r => setTimeout(r, 800))
  }

  setStatus(`✉ Dispatched — ${partCount} image${partCount > 1 ? 's' : ''} saved`)
}
