import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'boot/axios'

export const useRequirementTypeStore = defineStore('requirementTypeStore', {
  state: () => ({ type: [] }),
  getters: {
    getTypeById: (state) => {
      return (id) => state.type.find((x) => x.id === id)
    },
  },
  actions: {
    async fetchData() {
      api.options('/requirements/').then((response) => {
        this.type = response.data.actions.POST.type.choices.map((x) => {
          return { id: x.value, name: x.display_name }
        })
      })
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRequirementTypeStore, import.meta.hot))
}
