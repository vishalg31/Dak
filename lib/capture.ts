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
    filter: (node: HTMLElement) => !node.hasAttribute?.('data-export-hide'),
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

export async function exportEml(
  partCount: number,
  projectName: string,
  emailSubject: string,
  setStatus: (s: string) => void
): Promise<void> {
  setStatus('Capturing...')

  const previewRoot = document.getElementById('email-preview-root')!
  const bgColor = getComputedStyle(previewRoot).getPropertyValue('--email-bg').trim() || '#ffffff'

  const rawCanvases: HTMLCanvasElement[] = []
  for (let i = 1; i <= partCount; i++) {
    const el = document.getElementById(`part-${i}`)
    if (!el) continue
    await embedImages(el)
    const dataUrl = await captureElement(el, bgColor)
    rawCanvases.push(await dataUrlToCanvas(dataUrl))
    await new Promise(r => setTimeout(r, 300))
  }

  const maxWidth  = Math.max(...rawCanvases.map(c => c.width))
  const maxHeight = Math.max(...rawCanvases.map(c => c.height))
  const normCanvases = rawCanvases.map(c => normalizeCanvas(c, maxWidth, maxHeight, bgColor))

  setStatus('Building EML...')

  const imgBase64s = normCanvases.map(c => c.toDataURL('image/png').split(',')[1])

  const boundary = `boundary_dak_${Date.now()}`
  const name     = (projectName || 'email').toLowerCase().replace(/\s+/g, '')
  const subject  = emailSubject || projectName || 'Email'

  const htmlBody = [
    '<html><body style="margin:0;padding:0;background:#ffffff;">',
    '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;">',
    '<tr><td align="left">',
    '<table width="800" cellpadding="0" cellspacing="0" border="0">',
    ...imgBase64s.map((_, i) =>
      `<tr><td><img src="cid:part${i + 1}img" width="800" style="display:block;width:800px;max-width:800px;" /></td></tr>`
    ),
    '</table></td></tr></table>',
    '</body></html>',
  ].join('')

  const emlParts: string[] = [
    `From: `,
    `To: `,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/related; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    htmlBody,
    ``,
  ]

  imgBase64s.forEach((b64, i) => {
    emlParts.push(
      `--${boundary}`,
      `Content-Type: image/png`,
      `Content-Transfer-Encoding: base64`,
      `Content-ID: <part${i + 1}img>`,
      `Content-Disposition: inline; filename="part${i + 1}.png"`,
      ``,
      b64.match(/.{1,76}/g)!.join('\n'),
      ``,
    )
  })

  emlParts.push(`--${boundary}--`)

  const blob = new Blob([emlParts.join('\r\n')], { type: 'message/rfc822' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${name}_dak.eml`
  a.click()
  URL.revokeObjectURL(url)

  setStatus('✉ EML ready — double-click to open in Outlook')
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
