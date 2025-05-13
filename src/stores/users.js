import { defineStore, acceptHMRUpdate } from 'pinia'

export const useUsersStore = defineStore('UsersStore', {
  state: () => ({ users: [] }),
  getters: {
    getUserById: (state) => {
      return (userId) => state.users.find((user) => user.id === userId)
    },
  },
  actions: {},
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUsersStore, import.meta.hot))
}
