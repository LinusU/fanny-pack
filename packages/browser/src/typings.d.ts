interface IDBObjectStore {
  getKey (key: IDBValidKey): IDBRequest
  openKeyCursor(range?: IDBKeyRange | IDBValidKey, direction?: IDBCursorDirection): IDBRequest
}
