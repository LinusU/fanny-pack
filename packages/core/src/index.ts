export type JSONValue = object | string | number | boolean | null

type LowerBound = { gt: string } | { gte: string } | {}
type UpperBound = { lt: string } | { lte: string } | {}

export type KeyRange = LowerBound & UpperBound

export interface FannyPack {
  clear (): Promise<void>
  delete (key: string): Promise<void>
  get (key: string): Promise<JSONValue | undefined>
  has (key: string): Promise<boolean>
  set (key: string, value: JSONValue): Promise<void>

  keys (range?: KeyRange): AsyncIterableIterator<string>
  values (range?: KeyRange): AsyncIterableIterator<JSONValue>
  entries (range?: KeyRange): AsyncIterableIterator<[string, JSONValue]>
}
