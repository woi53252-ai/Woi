export function formatDate(value: string | null | undefined) {
  if (!value) return '-'
  const date = new Date(`${value.length === 10 ? value : value}`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(date)
}

export function formatDateTime(value: string) {
  const date = new Date(value)
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function average(values: number[]) {
  if (!values.length) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function storageExt(file: File) {
  const base = file.name.split('.').pop()?.toLowerCase()
  return base && /^[a-z0-9]+$/.test(base) ? base : 'jpg'
}

export function isValidUrl(value: string) {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

export function photoFileError(file: File) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) return 'JPG, PNG, WEBP 이미지만 업로드할 수 있습니다.'
  if (file.size > 8 * 1024 * 1024) return '사진은 8MB 이하로 선택해주세요.'
  return null
}
