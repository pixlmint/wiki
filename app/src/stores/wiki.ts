import axios from 'axios'
import {queryFormatter} from '@/src/helpers/queryFormatter'
import {defineStore} from 'pinia'

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
    updateEntry(payload: WikiEntry) {
      this.currentEntry = payload;
    },
    saveEntry(token: string | null) {
      if (this.$state.currentEntry === null) {
        // TODO: uncomment
        //throw new Error('Not editing any entry');
      }
      if (token === null) {
        token = '';
        // TODO: uncomment
        //throw new Error('token cannot be null');
      }
      const data = {
        token: token,
        content: this.currentEntry?.raw_content,
        entry: this.currentEntry?.id,
      }
      return axios({
        method: 'POST',
        url: '/api/admin/entry/edit',
        data: queryFormatter(data),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
    },
    fetchEntry(entry: string) {
      return axios
        .get('/api/entry/view?p=' + entry)
        .then((response) => {
          this.currentEntry = response.data;
          this.loadedEntries.push(response.data);
        })
    },
    deleteEntry(entry: string, token: string | null) {
      if (token === null) {
        throw new Error('invalid token');
      }
      return axios.delete('/api/admin/entry/delete?' + queryFormatter({entry: entry, token: token}))
    },
    renameEntry(entry: string, newName: string, token: string) {
      const data = {entry: entry, newName: newName, token: token};
      return axios({
        method: "POST",
        url: '/api/admin/entry/rename',
        data: queryFormatter(data),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    },
    loadNav() {
      return axios.get('/api/nav')
        .then((response) => {
          this.nav = response.data;
        })
    },
  }
})