import { OBJ_KEYS } from './constants.js';

export const loadTab = (cb) => chrome.storage.sync.get(OBJ_KEYS.TAB, cb);
export const dispatchTab = (tab, cb) => chrome.storage.sync.set({ [OBJ_KEYS.TAB]: tab }, cb);

export const loadNotes = (cb) => chrome.storage.sync.get(OBJ_KEYS.ITEMS, cb);
export const dispatchNotes = (data, cb) => chrome.storage.sync.set({ [OBJ_KEYS.ITEMS]: data }, cb);

export const loadCurrentNote = (cb) => chrome.storage.sync.get(OBJ_KEYS.CURRENT_DATA, cb);
export const dispatchCurrentNote = (data, cb) => chrome.storage.sync.set({ [OBJ_KEYS.CURRENT_DATA]: data }, cb);