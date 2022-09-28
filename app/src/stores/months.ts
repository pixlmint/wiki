import axios from 'axios'
import {
  queryFormatter
} from '../../../helpers/queryFormatter'

const state = {
  entries: [],
  editingEntry: {},
  editingGallery: {},
}

const mutations = {
  UPDATE_EDITING_ENTRY(state, payload) {
    state.editingEntry = payload
  },
  UPDATE_ENTRIES(state, payload) {
    state.entries = payload
  },
  UPDATE_EDITING_GALLERY(state, payload) {
    state.editingGallery = payload
  },
}

const actions = {
  getEntries({
    commit
  }) {
    axios.get('/api/entries').then((response) => {
      commit('UPDATE_ENTRIES', response.data)
    })
  },
  updateEntry({
    commit
  }, payload) {
    commit('UPDATE_EDITING_ENTRY', payload.entry)
  },
  saveEntry({
    commit
  }, token) {
    const data = {
      token: token,
      content: btoa(getters.editingEntry(state).raw_content),
      entry: getters.editingEntry(state).id,
    }
    return axios({
      method: 'post',
      url: '/api/admin/entry/edit',
      data: queryFormatter(data),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  },
  getEntry({
    commit
  }, payload) {
    return axios
      .get('/api/admin/entry/edit?entry=' + payload.entry + '&token=' + payload.token)
      .then((response) => {
        commit('UPDATE_EDITING_ENTRY', response.data)
      })
  },
  deleteEntry({
    commit
  }, payload) {
    return axios.delete('/api/admin/entry/delete?' + queryFormatter(payload))
  },
  loadImagesForEntry({
    commit
  }, payload) {
    return axios.get('/api/admin/entry/images/load?entry=' + payload.entry).then((response) => {
      commit('UPDATE_EDITING_GALLERY', response.data.images);
    })
  }
}

const getters = {
  entries: (state) => state.entries,
  editingEntry: (state) => state.editingEntry,
  gallery: (state) => state.editingGallery,
}

const monthsModule = {
  state,
  mutations,
  actions,
  getters,
}

export default monthsModule