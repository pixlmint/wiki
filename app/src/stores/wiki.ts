import axios from 'axios'
import {queryFormatter} from '@/src/helpers/queryFormatter'
import {defineStore} from 'pinia'

interface WikiEntry {
  raw_content: string,
  content: string,
  id: string,
  url: string,
  title: string,
  description: string | null,
  author: string | null,
  time: number,
  date: string,
  date_formatted: string,
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

interface Nav extends Array<NavElement> {}

interface NavElement {
  title: string,
  id: string,
  url: string,
  children: Nav,
}

interface WikiEntryList extends Array<WikiEntry> {}

interface State {
  loadedEntries: WikiEntryList,
  currentEntry: WikiEntry | null,
  nav: Nav,
}

export const useWikiStore = defineStore('wikiStore', {
  state: (): State => ({
    loadedEntries: [],
    currentEntry: null,
    nav: [],
  }),
  getters: {
    loadedEntries: (state) => state.loadedEntries,
    currentEntry: (state) => state.currentEntry,
  },
  actions: {
    updateEntry(payload: WikiEntry) {
      this.$state.currentEntry = payload;
    },
    saveEntry(token: string | null) {
      if (this.$state.currentEntry === null) {
        throw new Error('Not editing any entry');
      }
      if (token === null) {
        throw new Error('token cannot be null');
      }
      const data = {
        token: token,
        content: this.$state.currentEntry.raw_content,
        entry: this.$state.currentEntry.id,
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
        .get('/api/entry/view?entry=' + entry)
        .then((response) => {
          this.$state.currentEntry = response.data;
          this.$state.loadedEntries.push(response.data);
        })
    },
    getEntry(entry: string) {

    },
    deleteEntry(entry: string, token: string | null) {
      if (token === null) {
        throw new Error('invalid token');
      }
      return axios.delete('/api/admin/entry/delete?' + queryFormatter({entry: entry, token: token}))
    },
    renameEntry(oldName: string, newName : string, token: string) {
      return axios.post('/api/admin/entry/rename?' + queryFormatter({oldName: oldName, newName: newName, token: token}))
    },
    loadNav() {
      return axios.get('/api/nav')
        .then((response) => {
          console.log(response.data);
          this.$state.nav = response.data;
        })
    },
  }
})