import { consoleWarn, getMimeType } from './utils'
import type { Context } from './context'

export function fetch(url: string, context: Context, isImage = false) {
  const {
    acceptOfImage,
    timeout,
    fetch: {
      bypassingCache,
      requestInit,
    },
  } = context

  // cache bypass so we dont have CORS issues with cached images
  // ref: https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache
  if (bypassingCache) {
    url += (/\?/.test(url) ? '&' : '?') + new Date().getTime()
  }

  const controller = new AbortController()

  const timer = timeout
    ? setTimeout(() => controller.abort(), timeout)
    : undefined

  return window.fetch(url, {
    signal: controller.signal,
    headers: isImage ? { accept: acceptOfImage } : undefined,
    ...requestInit,
  })
    .finally(() => clearTimeout(timer))
}

export function fetchBase64(url: string, context: Context, isImage?: boolean) {
  const {
    requests,
    fetch: {
      placeholderImage,
    },
  } = context

  if (!requests.has(url)) {
    if (isImage) {
      context.requestImagesCount++
    }

    requests.set(url, {
      type: isImage ? 'image' : 'text',
      response: fetch(url, context, isImage)
        .then(rep => {
          return rep.blob().then(blob => {
            return new Promise((resolve, reject) => {
              const reader = new FileReader()
              reader.onloadend = () => {
                const content = (reader.result as string).split(/,/)[1]
                if (content) {
                  resolve({
                    contentType: blob.type || rep.headers.get('Content-Type') || '',
                    content,
                  })
                } else {
                  reject(new Error(`Empty response content by ${ url }`))
                }
              }
              reader.onerror = reject
              reader.readAsDataURL(blob)
            })
          })
        })
        .catch(error => {
          requests.delete(url)

          if (isImage) {
            consoleWarn('Failed to fetch image base64, trying to use placeholder image', url)
            return {
              contentType: 'image/png',
              content: placeholderImage!.split(/,/)[1],
            }
          }

          throw error
        }) as any,
    })
  }

  return requests.get(url)!.response
}

export async function fetchDataUrl(url: string, context: Context, isImage?: boolean) {
  const { content, contentType } = await fetchBase64(url, context, isImage)
  const mimeType = contentType || getMimeType(url)
  return `data:${ mimeType };base64,${ content }`
}

export async function fetchText(url: string, context: Context): Promise<string> {
  const { requests } = context
  if (!requests.has(url)) {
    requests.set(url, {
      type: 'text',
      response: fetch(url, context).then(rep => {
        return rep.text().then(content => {
          return {
            contentType: rep.headers.get('Content-Type') || '',
            content,
          }
        })
      }),
    })
  }
  return requests.get(url)!.response.then(rep => rep.content)
}
