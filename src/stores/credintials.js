import { defineStore, acceptHMRUpdate } from 'pinia'

export const useCredintialsStore = defineStore('CredintialsStore', {
  state: () => ({
    token: null,
  }),
  getters: {},
  actions: {
    set(token) {
      this.token = token
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCredintialsStore, import.meta.hot))
}
