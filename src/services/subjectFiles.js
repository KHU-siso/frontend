// Replace this repository with server file endpoints when accounts/storage exist.
// File bytes and metadata commit together in IndexedDB; never in localStorage.
const DATABASE = 'moram-subject-files'
export const MAX_FILE_BYTES = 25 * 1024 * 1024
export const ALLOWED_EXTENSIONS = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'txt']
export const formatBytes = size => size < 1024 ? `${size} B` : size < 1048576 ? `${(size / 1024).toFixed(1)} KB` : `${(size / 1048576).toFixed(1)} MB`
let opening
function openDatabase() {
  if (!globalThis.indexedDB) return Promise.reject(new Error('이 브라우저에서는 IndexedDB를 사용할 수 없습니다.'))
  if (!opening) opening = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1)
    request.onupgradeneeded = () => request.result.createObjectStore('files', { keyPath: 'id' }).createIndex('subjectId', 'subjectId')
    request.onerror = () => reject(new Error('브라우저 파일 저장소에 접근하지 못했습니다.'))
    request.onblocked = () => reject(new Error('다른 MORAM 탭을 닫고 다시 시도해주세요.'))
    request.onsuccess = () => { const db = request.result; db.onversionchange = () => { db.close(); opening = null }; resolve(db) }
  }).catch(error => { opening = null; throw error })
  return opening
}
async function transact(mode, operation) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', mode)
    let result
    const setResult = value => { result = value }
    tx.oncomplete = () => resolve(result)
    tx.onerror = tx.onabort = () => reject(new Error(tx.error?.name === 'QuotaExceededError' ? '브라우저 저장 용량이 부족합니다. 파일을 정리한 후 다시 시도해주세요.' : '파일을 저장하거나 읽지 못했습니다. 브라우저 저장소 설정을 확인해주세요.'))
    operation(tx.objectStore('files'), setResult)
  })
}
export function validateFile(file) {
  const extension = file.name.split('.').pop().toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(extension)) throw new Error(`${file.name}: PDF, PPT/PPTX, DOC/DOCX, TXT 파일만 지원합니다.`)
  if (file.size > MAX_FILE_BYTES) throw new Error(`${file.name}: 파일당 최대 25MB까지 저장할 수 있습니다.`)
  return extension
}
export const fileRepository = {
  async list() {
    return transact('readonly', (store, done) => {
      const metadata = []
      const cursor = store.openCursor()
      cursor.onsuccess = () => { const row = cursor.result; if (row) { const { blob: _blob, ...meta } = row.value; metadata.push(meta); row.continue() } else done(metadata) }
    })
  },
  async add(subjectId, file) {
    const extension = validateFile(file)
    const meta = { id: crypto.randomUUID(), subjectId, name: file.name, size: file.size, type: file.type, extension, uploadedAt: new Date().toISOString() }
    await transact('readwrite', store => store.add({ ...meta, blob: file }))
    return meta
  },
  async get(id) { return transact('readonly', (store, done) => { const request = store.get(id); request.onsuccess = () => done(request.result) }) },
  async remove(id) { return transact('readwrite', store => store.delete(id)) },
  async removeSubject(subjectId) {
    return transact('readwrite', store => {
      const cursor = store.index('subjectId').openKeyCursor(IDBKeyRange.only(subjectId))
      cursor.onsuccess = () => { const row = cursor.result; if (row) { store.delete(row.primaryKey); row.continue() } }
    })
  },
}
