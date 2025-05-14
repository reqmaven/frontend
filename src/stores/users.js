import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'boot/axios'

export const useUsersStore = defineStore('UsersStore', {
  state: () => ({ users: [], me: {} }),
  getters: {
    getUserById: (state) => {
      return (userId) => state.users.find((user) => user.id === userId)
    },
    getMe: (state) => state.me,
  },
  actions: {
    async fetchData() {
      api
        .get('whoami')
        .then((response) => {
          this.me = response.data

          api.get(`/user/`).then((response) => {
            this.users = response.data.results
          })
        })
        .catch(() => {
          this.router.push('/login')
        })
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUsersStore, import.meta.hot))
}
