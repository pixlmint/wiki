import axios from 'axios'
import {queryFormatter} from '@/src/helpers/queryFormatter'
import {defineStore} from 'pinia'
import {buildRequest, send} from "@/src/helpers/xhr";

interface WikiEntry {
  raw_content: string,
  content: string,
  id: string,
  url: string,
  hidden: boolean,
  meta: EntryMeta,
  file: string,
}

interface EntryMeta {
  title: string,
  date: string,
  time: number,
  date_formatted: string,
  description: string | null,
  author: string | null,
}

interface Nav extends Array<NavElement> {
}

interface NavElement {
  title: string,
  id: string,
  url: string,
  showing: boolean,
  children: Nav,
}

interface WikiEntryList extends Array<WikiEntry> {
}

interface State {
  loadedEntries: WikiEntryList,
  currentEntry: WikiEntry | null,
  nav: Nav | null,
}

export const useWikiStore = defineStore('wikiStore', {
  state: (): State => ({
    loadedEntries: [],
    currentEntry: null,
    nav: null,
  }),
  getters: {
    getLoadedEntries: (state) => state.loadedEntries,
    getCurrentEntry: (state) => state.currentEntry,
    getNav: state => state.nav,
  },
  actions: {
    saveEntry(token: string | null) {
      const currentEntry = this.currentEntry;
      if (currentEntry === null) {
        throw 'Not editing any entry';
      }
      if (token === null) {
        token = '';
        // TODO: uncomment
        //throw new Error('token cannot be null');
      }
      const data = {
        token: token,
        content: currentEntry.raw_content,
        meta: currentEntry.meta,
        entry: currentEntry.id,
      }
      const request = buildRequest('/api/admin/entry/edit', data, 'PUT');
      return send(request);
    },
    fetchEntry(entry: string) {
      const request = buildRequest('/api/entry/view', {p: entry});
      return send(request).then(response => {
        this.currentEntry = response.data;
        this.loadedEntries.push(response.data);
      });
    },
    addEntry(parentFolder : string, token: string | null) {
      if (token === null) {
        // TODO: uncomment
        //throw new Error('token cannot be null');
      }
      const data = {
        parentFolder: parentFolder,
        token: token,
      };
      const request = buildRequest('/api/admin/entry/add', data, 'POST');
      return send(request);
    },
    addFolder(parentFolder : string, token: string | null) {
      if (token === null) {
        // TODO: uncomment
        //throw new Error('token cannot be null');
      }
      const data = {
        parentFolder: parentFolder,
        token: token,
      };
      const request = buildRequest('/api/admin/folder/add', data, 'POST');
      return send(request);
    },
    deleteEntry(entry: string, token: string | null) {
      if (token === null) {
        // TODO: uncomment
        // throw new Error('invalid token');
      }
      const data = {
        entry: entry,
        token: token,
      };
      const request = buildRequest('/api/admin/entry/delete', data, 'DELETE');
      return send(request);
    },
    renameEntry(newName: string, token: string | null) {
      if (this.currentEntry === null) {
        return;
      }
      this.currentEntry.meta.title = newName;
      const data = {
        'new-title': newName,
        entry: this.currentEntry.id,
        token: token,
      }
      const request = buildRequest('/api/admin/entry/rename', data, 'PUT');
      return send(request);
    },
    loadNav() {
      const request = buildRequest('/api/nav');
      return send(request).then(response => {
        this.nav = response.data[0];
      });
    },
  }
})