import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'boot/axios'

export const useRequirementsCacheStore = defineStore('requirementsCacheStore', {
  state: () => ({ requirements: {} }),
  getters: {},
  actions: {
    async fetchRequirement(id) {
      return api.get(`/requirements/${id}`).then((response) => {
        this.requirements[id] = response.data
        return response.data
      })
    },

    async getOrFetch(id) {
      if (id in this.requirements) {
        return this.requirements[id]
      } else {
        return await this.fetchRequirement(id)
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRequirementsCacheStore, import.meta.hot))
}
