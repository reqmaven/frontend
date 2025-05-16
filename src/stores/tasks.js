import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'boot/axios'

export const useTasksStore = defineStore('tasksStore', {
  state: () => ({ tasks: [], initialized: false }),
  getters: {},
  actions: {
    addTask(id) {
      this.tasks.push({ id: id, data: { complete: false, progress: { percent: 0 } } })
      if (!this.initialized) {
        this.fetchData()
        setInterval(this.fetchData, 5000)
        this.initialized = true
      }
    },
    async fetchData() {
      let i = 0
      for (let task of this.tasks) {
        if (!task.data.complete) {
          api.get('/celery-progress/' + task.id).then((response) => {
            task.data = response.data
          })
        } else {
          if (task.data.success) {
            this.tasks.splice(i, 1)
          }
        }
        i = i + 1
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTasksStore, import.meta.hot))
}
