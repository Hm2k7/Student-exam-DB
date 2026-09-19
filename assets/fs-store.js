const DB_NAME = 'exam-admin';
const STORE_NAME = 'handles';
const KEY = 'projectDir';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, value) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getSavedDirHandle() {
  return idbGet(KEY);
}

async function saveDirHandle(handle) {
  return idbSet(KEY, handle);
}

async function verifyPermission(handle, mode = 'readwrite') {
  const opts = { mode };
  if ((await handle.queryPermission(opts)) === 'granted') return true;
  if ((await handle.requestPermission(opts)) === 'granted') return true;
  return false;
}

async function pickProjectDirectory() {
  const handle = await window.showDirectoryPicker();
  const ok = await verifyPermission(handle, 'readwrite');
  if (!ok) throw new Error('Permission to write to the folder was denied.');
  await saveDirHandle(handle);
  return handle;
}

async function getOrPickProjectDirectory() {
  const saved = await getSavedDirHandle();
  if (saved) {
    const ok = await verifyPermission(saved, 'readwrite');
    if (ok) return saved;
  }
  return pickProjectDirectory();
}

async function getSubDir(root, name) {
  return root.getDirectoryHandle(name, { create: true });
}

async function readTextFile(dirHandle, filename) {
  try {
    const fileHandle = await dirHandle.getFileHandle(filename);
    const file = await fileHandle.getFile();
    return await file.text();
  } catch (err) {
    if (err.name === 'NotFoundError') return null;
    throw err;
  }
}

async function writeTextFile(dirHandle, filename, contents) {
  const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(contents);
  await writable.close();
}

async function deleteFile(dirHandle, filename) {
  try {
    await dirHandle.removeEntry(filename);
  } catch (err) {
    if (err.name !== 'NotFoundError') throw err;
  }
}
