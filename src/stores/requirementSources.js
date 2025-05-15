import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'boot/axios'

export const useRequirementSourceStore = defineStore('requirementSourceStore', {
  state: () => ({ source: [] }),
  getters: {
    getSourceById: (state) => {
      return (id) => state.source.find((req_source) => req_source.id === id)
    },
  },
  actions: {
    async fetchData() {
      api.get('/requirement-source/').then((response) => {
        this.source = response.data.results
      })
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRequirementSourceStore, import.meta.hot))
}
