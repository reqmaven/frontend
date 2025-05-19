import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'boot/axios'

export const useRequirementsCacheStore = defineStore('requirementsCacheStore', {
  state: () => ({ requirements: {}, last_requirement_source_id: null }),
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

    async fetchRequirementsSource(id) {
      if (this.last_requirement_source_id !== id) {
        return api
          .get(`/requirements/`, {
            params: {
              source_reference: id,
              page_size: 10000,
            },
          })
          .then((response) => {
            for (let req of response.data.results) {
              this.requirements[req.id] = req
            }
            this.last_requirement_source_id = id
          })
      } else {
        return Promise.resolve()
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRequirementsCacheStore, import.meta.hot))
}
