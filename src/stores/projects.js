import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'boot/axios'

export const useProjectStore = defineStore('projectStore', {
  state: () => ({ projects: [] }),
  getters: {
    getProjectById: (state) => {
      return (project_id) => state.projects.find((project) => project.id === project_id)
    },
  },
  actions: {
    async fetchData() {
      api.get('/project').then((response) => {
        this.projects = response.data.results
      })
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProjectStore, import.meta.hot))
}
