/**
 * 这个文件的作用：提供 JSON 格式化与展示共用的保序解析、格式化、树结构构建、详情检测与高亮能力。
 * 移植自参考项目 ideaflow-web-tool/app/utils/json-tools.ts
 */

export type OrderedJsonValue =
  | { kind: 'object'; value: Array<{ key: string; value: OrderedJsonValue }> }
  | { kind: 'array'; value: OrderedJsonValue[] }
  | { kind: 'string'; value: string }
  | { kind: 'number'; value: string }
  | { kind: 'bool'; value: boolean }
  | { kind: 'null' }

export type JsonValueType = 'string' | 'number' | 'bool' | 'null' | 'object' | 'array'

export interface JsonParseIssue {
  message: string
  line: number
  column: number
}

export interface JsonInspectorNode {
  path: string
  value: OrderedJsonValue
  type: JsonValueType
  preview: string
}

export interface JsonTreeItem {
  path: string
  parentPath?: string
  key: string
  preview: string
  type: JsonValueType
  depth: number
  hasChildren: boolean
  childPaths: string[]
}

export interface JsonFormattedLine {
  number: number
  text: string
  path?: string
}

export type JsonDetail =
  | { kind: 'image'; url: string }
  | { kind: 'video'; url: string }
  | { kind: 'audio'; url: string }
  | { kind: 'date'; iso: string; unix: number; unixMs: number; local: string }
  | { kind: 'color'; text: string; hex: string }
  | { kind: 'url'; url: string }
  | { kind: 'email'; email: string }
  | { kind: 'base64'; decoded: string }
  | { kind: 'plain'; text: string }

/**
 * 这个类的作用：封装带行列定位信息的 JSON 解析错误，便于页面给出精确提示。
 */
export class OrderedJsonParseError extends Error {
  issue: JsonParseIssue

  /**
   * 这个方法的作用：创建包含报错消息、行号和列号的错误对象。
   */
  constructor(issue: JsonParseIssue) {
    super(issue.message)
    this.name = 'OrderedJsonParseError'
    this.issue = issue
  }
}

/**
 * 这个类的作用：使用自定义解析器读取 JSON，并保持对象字段原始顺序不被运行时重排。
 */
class OrderedJsonParser {
  private chars: string[]
  private index = 0

  /**
   * 这个方法的作用：初始化解析器字符数组，供后续逐字符读取。
   */
  constructor(text: string) {
    this.chars = Array.from(text)
  }

  /**
   * 这个方法的作用：解析完整 JSON 文本，并在发现多余字符时抛出错误。
   */
  parse(): OrderedJsonValue {
    this.skipWhitespace()
    const value = this.parseValue()
    this.skipWhitespace()
    if (!this.isAtEnd()) throw this.makeError('存在多余内容')
    return value
  }

  /**
   * 这个方法的作用：按当前字符分派到对象、数组、字符串、字面量或数字解析逻辑。
   */
  private parseValue(): OrderedJsonValue {
    const char = this.peek()
    if (!char) throw this.makeError('缺少 JSON 值')
    if (char === '{') return this.parseObject()
    if (char === '[') return this.parseArray()
    if (char === '"') return { kind: 'string', value: this.parseString() }
    if (char === 't') { this.consumeLiteral('true'); return { kind: 'bool', value: true } }
    if (char === 'f') { this.consumeLiteral('false'); return { kind: 'bool', value: false } }
    if (char === 'n') { this.consumeLiteral('null'); return { kind: 'null' } }
    if (char === '-' || this.isDigit(char)) return { kind: 'number', value: this.parseNumber() }
    throw this.makeError(`非法字符 "${char}"`)
  }

  /**
   * 这个方法的作用：解析对象结构，并保持 key 的原始顺序与原始文本一致。
   */
  private parseObject(): OrderedJsonValue {
    this.consume('{')
    this.skipWhitespace()
    const pairs: Array<{ key: string; value: OrderedJsonValue }> = []
    if (this.peek() === '}') { this.advance(); return { kind: 'object', value: pairs } }
    while (true) {
      this.skipWhitespace()
      if (this.peek() !== '"') throw this.makeError('对象 key 必须是字符串')
      const key = this.parseString()
      this.skipWhitespace()
      this.consume(':')
      this.skipWhitespace()
      pairs.push({ key, value: this.parseValue() })
      this.skipWhitespace()
      if (this.peek() === '}') { this.advance(); break }
      this.consume(',')
    }
    return { kind: 'object', value: pairs }
  }

  /**
   * 这个方法的作用：解析数组结构，并保持数组元素顺序不变。
   */
  private parseArray(): OrderedJsonValue {
    this.consume('[')
    this.skipWhitespace()
    const items: OrderedJsonValue[] = []
    if (this.peek() === ']') { this.advance(); return { kind: 'array', value: items } }
    while (true) {
      this.skipWhitespace()
      items.push(this.parseValue())
      this.skipWhitespace()
      if (this.peek() === ']') { this.advance(); break }
      this.consume(',')
    }
    return { kind: 'array', value: items }
  }

  /**
   * 这个方法的作用：解析 JSON 字符串，并正确处理常见转义字符与 Unicode 转义。
   */
  private parseString(): string {
    this.consume('"')
    let result = ''
    while (true) {
      const char = this.peek()
      if (!char) throw this.makeError('字符串未闭合')
      this.advance()
      if (char === '"') return result
      if (char === '\\') {
        const escaped = this.peek()
        if (!escaped) throw this.makeError('字符串转义不完整')
        this.advance()
        if (escaped === '"') result += '"'
        else if (escaped === '\\') result += '\\'
        else if (escaped === '/') result += '/'
        else if (escaped === 'b') result += '\b'
        else if (escaped === 'f') result += '\f'
        else if (escaped === 'n') result += '\n'
        else if (escaped === 'r') result += '\r'
        else if (escaped === 't') result += '\t'
        else if (escaped === 'u') result += this.parseUnicodeEscape()
        else throw this.makeError(`非法转义字符 "\\${escaped}"`)
        continue
      }
      result += char
    }
  }

  /**
   * 这个方法的作用：把 `\uXXXX` 形式的 Unicode 转义转换成真实字符。
   */
  private parseUnicodeEscape(): string {
    let hex = ''
    for (let i = 0; i < 4; i++) {
      const char = this.peek()
      if (!char || !/[0-9a-fA-F]/.test(char)) throw this.makeError('Unicode 转义格式错误')
      hex += char
      this.advance()
    }
    const codePoint = parseInt(hex, 16)
    const scalar = String.fromCodePoint(codePoint)
    if (!scalar) throw this.makeError('Unicode 转义无效')
    return scalar
  }

  /**
   * 这个方法的作用：解析 JSON 数字，并保留其原始文本以便格式化写回。
   */
  private parseNumber(): string {
    const start = this.index
    if (this.peek() === '-') this.advance()
    const first = this.peek()
    if (!first) throw this.makeError('数字不完整')
    if (first === '0') {
      this.advance()
      if (this.peek() && this.isDigit(this.peek()!)) throw this.makeError('数字不能包含前导零')
    } else if (this.isDigit(first)) {
      while (this.peek() && this.isDigit(this.peek()!)) this.advance()
    } else {
      throw this.makeError('数字格式错误')
    }
    if (this.peek() === '.') {
      this.advance()
      if (!this.peek() || !this.isDigit(this.peek()!)) throw this.makeError('小数部分缺失')
      while (this.peek() && this.isDigit(this.peek()!)) this.advance()
    }
    const exponent = this.peek()
    if (exponent === 'e' || exponent === 'E') {
      this.advance()
      const sign = this.peek()
      if (sign === '+' || sign === '-') this.advance()
      if (!this.peek() || !this.isDigit(this.peek()!)) throw this.makeError('指数部分缺失')
      while (this.peek() && this.isDigit(this.peek()!)) this.advance()
    }
    return this.chars.slice(start, this.index).join('')
  }

  private consumeLiteral(literal: string): void {
    for (const char of literal) this.consume(char)
  }

  private consume(expected: string): void {
    if (this.peek() !== expected) throw this.makeError(`期望字符 "${expected}"`)
    this.advance()
  }

  private skipWhitespace(): void {
    while (this.peek() && /\s/.test(this.peek()!)) this.advance()
  }

  private peek(): string | undefined { return this.chars[this.index] }
  private advance(): void { this.index += 1 }
  private isAtEnd(): boolean { return this.index >= this.chars.length }
  private isDigit(char: string): boolean { return /[0-9]/.test(char) }

  /**
   * 这个方法的作用：构造带行列信息的解析错误，便于 UI 精准定位。
   */
  private makeError(message: string): OrderedJsonParseError {
    const { line, column } = this.lineAndColumn(this.index)
    return new OrderedJsonParseError({ message, line, column })
  }

  /**
   * 这个方法的作用：根据当前字符偏移量换算出行号和列号。
   */
  private lineAndColumn(offset: number): { line: number; column: number } {
    const safeOffset = Math.max(0, Math.min(offset, this.chars.length))
    let line = 1, column = 1
    for (let i = 0; i < safeOffset; i++) {
      if (this.chars[i] === '\n') { line++; column = 1 } else { column++ }
    }
    return { line, column }
  }
}

/** 对外暴露保序 JSON 解析能力 */
export function parseOrderedJson(source: string): OrderedJsonValue {
  return new OrderedJsonParser(source).parse()
}

/** 对外暴露 JSON 校验能力，仅校验是否合法 */
export function validateOrderedJson(source: string): void {
  parseOrderedJson(source)
}

/** 把 JSON 文本格式化为美化版或压缩版，并保留对象字段顺序 */
export function formatOrderedJson(source: string, prettyPrinted: boolean): string {
  const ordered = parseOrderedJson(source)
  return writeOrderedJson(ordered, prettyPrinted)
}

/** 把保序 JSON 值重新序列化为字符串 */
export function writeOrderedJson(value: OrderedJsonValue, prettyPrinted: boolean): string {
  return prettyPrinted ? writePrettyJson(value, 0) : writeCompactJson(value)
}

/**
 * 这个函数的作用：以带缩进的方式输出 JSON。
 */
function writePrettyJson(value: OrderedJsonValue, level: number): string {
  const indent = '  '.repeat(level)
  const nextIndent = '  '.repeat(level + 1)
  if (value.kind === 'null') return 'null'
  if (value.kind === 'bool') return value.value ? 'true' : 'false'
  if (value.kind === 'number') return value.value
  if (value.kind === 'string') return `"${escapeJsonString(value.value)}"`
  if (value.kind === 'array') {
    if (value.value.length === 0) return '[]'
    const body = value.value.map(item => `${nextIndent}${writePrettyJson(item, level + 1)}`).join(',\n')
    return `[\n${body}\n${indent}]`
  }
  if (value.value.length === 0) return '{}'
  const body = value.value
    .map(item => `${nextIndent}"${escapeJsonString(item.key)}": ${writePrettyJson(item.value, level + 1)}`)
    .join(',\n')
  return `{\n${body}\n${indent}}`
}

/**
 * 这个函数的作用：以无多余空白的方式输出 JSON。
 */
function writeCompactJson(value: OrderedJsonValue): string {
  if (value.kind === 'null') return 'null'
  if (value.kind === 'bool') return value.value ? 'true' : 'false'
  if (value.kind === 'number') return value.value
  if (value.kind === 'string') return `"${escapeJsonString(value.value)}"`
  if (value.kind === 'array') return `[${value.value.map(item => writeCompactJson(item)).join(',')}]`
  return `{${value.value.map(item => `"${escapeJsonString(item.key)}":${writeCompactJson(item.value)}`).join(',')}}`
}

/**
 * 这个函数的作用：转义字符串中的特殊字符，确保重新输出的 JSON 仍然合法。
 */
function escapeJsonString(source: string): string {
  return source.replace(/[\\"\n\r\t]/g, (char) => {
    if (char === '\\') return '\\\\'
    if (char === '"') return '\\"'
    if (char === '\b') return '\\b'
    if (char === '\f') return '\\f'
    if (char === '\n') return '\\n'
    if (char === '\r') return '\\r'
    return '\\t'
  })
}

/** 返回 JSON 值类型，供树视图、详情面板和状态标识使用 */
export function getJsonValueType(value: OrderedJsonValue): JsonValueType {
  return value.kind
}

/** 生成人类可读的节点预览文本 */
export function getJsonPreview(value: OrderedJsonValue): string {
  if (value.kind === 'string') return value.value
  if (value.kind === 'number') return value.value
  if (value.kind === 'bool') return value.value ? 'true' : 'false'
  if (value.kind === 'null') return 'null'
  if (value.kind === 'object') return `对象 · ${value.value.length} 项`
  return `数组 · ${value.value.length} 项`
}

/** 把 JSON 树拍平成节点列表，便于搜索、选中和详情联动 */
export function flattenJsonNodes(value: OrderedJsonValue, path = '$', result: JsonInspectorNode[] = []): JsonInspectorNode[] {
  result.push({ path, value, type: getJsonValueType(value), preview: getJsonPreview(value) })
  if (value.kind === 'object') {
    value.value.forEach((item) => flattenJsonNodes(item.value, `${path}.${item.key}`, result))
  }
  if (value.kind === 'array') {
    value.value.forEach((item, index) => flattenJsonNodes(item, `${path}[${index}]`, result))
  }
  return result
}

/** 构建左侧树视图所需的平面行数据，同时保留层级与子节点关系 */
export function buildJsonTreeRows(value: OrderedJsonValue, path = '$', key = '$', depth = 0, rows: JsonTreeItem[] = []): JsonTreeItem[] {
  const childPaths: string[] = []
  if (value.kind === 'object') {
    value.value.forEach((item) => {
      const childPath = `${path}.${item.key}`
      childPaths.push(childPath)
      buildJsonTreeRows(item.value, childPath, item.key, depth + 1, rows)
    })
  }
  if (value.kind === 'array') {
    value.value.forEach((item, index) => {
      const childPath = `${path}[${index}]`
      childPaths.push(childPath)
      buildJsonTreeRows(item, childPath, `[${index}]`, depth + 1, rows)
    })
  }
  rows.unshift({
    path,
    parentPath: path === '$' ? undefined : getParentPath(path),
    key,
    preview: getJsonPreview(value),
    type: getJsonValueType(value),
    depth,
    hasChildren: childPaths.length > 0,
    childPaths,
  })
  return rows
}

function getParentPath(path: string): string | undefined {
  if (path === '$') return undefined
  const arrayIndex = path.lastIndexOf('[')
  const dotIndex = path.lastIndexOf('.')
  const cutIndex = Math.max(arrayIndex, dotIndex)
  if (cutIndex <= 0) return '$'
  return path.slice(0, cutIndex)
}

/** 生成格式化 JSON 行模型，并建立 path 映射 */
export function buildFormattedLines(value: OrderedJsonValue): JsonFormattedLine[] {
  const lines: JsonFormattedLine[] = []
  let lineNumber = 1
  const emit = (text: string, path?: string): void => {
    lines.push({ number: lineNumber, text, path })
    lineNumber++
  }
  const indentStr = (level: number): string => ' '.repeat(level)
  const quoted = (text: string): string => `"${escapeJsonString(text)}"`
  const primitive = (item: OrderedJsonValue): string => {
    if (item.kind === 'string') return quoted(item.value)
    if (item.kind === 'number') return item.value
    if (item.kind === 'bool') return item.value ? 'true' : 'false'
    if (item.kind === 'null') return 'null'
    return ''
  }
  const render = (item: OrderedJsonValue, path: string, level: number, prefix?: string, suffix?: string): void => {
    if (item.kind === 'object') {
      emit(`${indentStr(level)}${prefix ?? ''}{`, path)
      item.value.forEach((pair, index) => {
        render(pair.value, `${path}.${pair.key}`, level + 2, `${quoted(pair.key)}: `, index === item.value.length - 1 ? undefined : ',')
      })
      emit(`${indentStr(level)}}${suffix ?? ''}`, path)
      return
    }
    if (item.kind === 'array') {
      emit(`${indentStr(level)}${prefix ?? ''}[`, path)
      item.value.forEach((child, index) => {
        render(child, `${path}[${index}]`, level + 2, undefined, index === item.value.length - 1 ? undefined : ',')
      })
      emit(`${indentStr(level)}]${suffix ?? ''}`, path)
      return
    }
    emit(`${indentStr(level)}${prefix ?? ''}${primitive(item)}${suffix ?? ''}`, path)
  }
  render(value, '$', 0)
  return lines
}

/**
 * 这个函数的作用：把 JSON 文本转换成可直接注入到页面中的高亮 HTML。
 */
export function renderJsonHtml(source: string): string {
  const tokens: string[] = []
  const chars = Array.from(source)
  let index = 0

  const escapeHtml = (text: string): string =>
    text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

  const pushToken = (text: string, className?: string): void => {
    const escaped = escapeHtml(text)
    tokens.push(className ? `<span class="${className}">${escaped}</span>` : escaped)
  }

  const readStringToken = (): string => {
    const start = index
    index++
    let escaped = false
    while (index < chars.length) {
      const char = chars[index]
      index++
      if (escaped) { escaped = false }
      else if (char === '\\') { escaped = true }
      else if (char === '"') { break }
    }
    return chars.slice(start, index).join('')
  }

  const readNumberToken = (): string => {
    const start = index
    while (index < chars.length && /[0-9eE+.-]/.test(chars[index])) index++
    return chars.slice(start, index).join('')
  }

  const readLiteralToken = (): string => {
    const start = index
    while (index < chars.length && /[a-z]/i.test(chars[index])) index++
    return chars.slice(start, index).join('')
  }

  while (index < chars.length) {
    const char = chars[index]
    if (char === '"') {
      const token = readStringToken()
      let lookAhead = index
      while (lookAhead < chars.length && /\s/.test(chars[lookAhead])) lookAhead++
      pushToken(token, chars[lookAhead] === ':' ? 'json-token-key' : 'json-token-string')
      continue
    }
    if (/[0-9-]/.test(char)) { pushToken(readNumberToken(), 'json-token-number'); continue }
    if (/[a-z]/i.test(char)) {
      const token = readLiteralToken()
      const className = token === 'true' || token === 'false'
        ? 'json-token-bool'
        : token === 'null' ? 'json-token-null' : undefined
      pushToken(token, className)
      continue
    }
    index++
    pushToken(char, /\s/.test(char) ? undefined : 'json-token-symbol')
  }

  return tokens.join('')
}

function isLikelyTimestampKey(path: string): boolean {
  const key = lastPathKey(path).toLowerCase()
  if (!key) return false
  const allowHints = ['time', 'timestamp', 'ts', 'date', 'datetime', 'created', 'updated', 'expire', 'expired', 'at']
  const denyHints = ['id', 'uid', 'uuid', 'user', 'order', 'book', 'item', 'product', 'session', 'token']
  if (denyHints.some(hint => key.includes(hint))) return false
  return allowHints.some(hint => key.includes(hint))
}

function lastPathKey(path: string): string {
  const normalized = path.replaceAll(']', '')
  const parts = normalized.split('.')
  const last = parts[parts.length - 1] ?? ''
  return last.replaceAll('[', '')
}

/** 为当前选中节点推断更具体的值语义，如日期、颜色、媒体链接等 */
export function detectJsonDetail(value: OrderedJsonValue, path: string): JsonDetail {
  const keyHint = isLikelyTimestampKey(path)
  if (value.kind === 'number') {
    const detail = detectTimestamp(value.value, keyHint)
    return detail ?? { kind: 'plain', text: value.value }
  }
  if (value.kind === 'string') {
    const media = detectMedia(value.value)
    if (media) return media
    const date = parseDateDetail(value.value) ?? detectTimestamp(value.value, keyHint)
    if (date) return date
    const color = detectColor(value.value)
    if (color) return color
    if (/^https?:\/\//i.test(value.value)) return { kind: 'url', url: value.value }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.value)) return { kind: 'email', email: value.value }
    const decoded = decodeBase64(value.value)
    if (decoded) return { kind: 'base64', decoded }
    return { kind: 'plain', text: value.value }
  }
  return {
    kind: 'plain',
    text: value.kind === 'object' || value.kind === 'array'
      ? writeOrderedJson(value, true)
      : getJsonPreview(value)
  }
}

function detectMedia(text: string): JsonDetail | null {
  if (!/^https?:\/\//i.test(text)) return null
  const extension = text.split('?')[0]?.split('.').pop()?.toLowerCase() ?? ''
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'heic'].includes(extension)) return { kind: 'image', url: text }
  if (['mp4', 'mov', 'm4v', 'avi', 'mkv', 'webm', 'm3u8', 'm3u'].includes(extension)) return { kind: 'video', url: text }
  if (['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac'].includes(extension)) return { kind: 'audio', url: text }
  return null
}

function detectColor(text: string): JsonDetail | null {
  const trimmed = text.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return { kind: 'color', text: trimmed, hex: trimmed.toUpperCase() }
  const match = trimmed.match(/^rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?:,\s*([\d.]+))?\)$/i)
  if (!match) return null
  const [r, g, b] = match.slice(1, 4).map(v => Math.max(0, Math.min(255, Number(v))).toString(16).padStart(2, '0'))
  return { kind: 'color', text: trimmed, hex: `#${r}${g}${b}`.toUpperCase() }
}

function parseDateDetail(text: string): JsonDetail | null {
  const trimmed = text.trim()
  const date = new Date(trimmed)
  if (Number.isNaN(date.getTime())) return null
  return makeDateDetail(date)
}

function detectTimestamp(text: string, keyHint: boolean): JsonDetail | null {
  const trimmed = text.trim()
  if (!/^\d+$/.test(trimmed)) return null
  if (!keyHint && trimmed.length !== 13) return null
  const number = Number(trimmed)
  const minSeconds = 946684800, maxSeconds = 4102444800
  const minMillis = minSeconds * 1000, maxMillis = maxSeconds * 1000
  if (number >= minMillis && number <= maxMillis) return makeDateDetail(new Date(number))
  if (number >= minSeconds && number <= maxSeconds) return makeDateDetail(new Date(number * 1000))
  return null
}

function makeDateDetail(date: Date): JsonDetail {
  return {
    kind: 'date',
    iso: date.toISOString(),
    unix: Math.floor(date.getTime() / 1000),
    unixMs: date.getTime(),
    local: date.toLocaleString('zh-CN', { hour12: false }),
  }
}

function decodeBase64(text: string): string | null {
  const trimmed = text.trim()
  if (!/^[A-Za-z0-9+/=]+$/.test(trimmed) || trimmed.length < 12 || trimmed.length % 4 !== 0) return null
  try {
    if (typeof globalThis.atob !== 'function') return null
    const decoded = globalThis.atob(trimmed)
    return /[ --]/.test(decoded) ? null : decoded
  } catch { return null }
}

/** 提供页面默认示例 JSON，覆盖日期、颜色、媒体、数组和嵌套对象等场景 */
export function createJsonSample(): string {
  return `{
  "title": "DevToolBox JSON Workbench",
  "site": "https://devtoolbox.app",
  "publishedAt": "2026-04-09T10:30:00+08:00",
  "themeColor": "#6366f1",
  "author": {
    "name": "devtoolbox",
    "email": "hello@devtoolbox.app"
  },
  "assets": {
    "cover": "https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg",
    "audio": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "video": "https://vjs.zencdn.net/v/oceans.mp4"
  },
  "stats": {
    "views": 1824,
    "likes": 238,
    "isPublished": true,
    "lastSyncTs": 1775701800000
  },
  "tags": [
    "json",
    "formatter",
    "viewer"
  ],
  "notes": "支持单栏、双栏布局，实时语法高亮"
}`
}
