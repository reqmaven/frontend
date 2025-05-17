import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settingsStore', {
  state: () => ({ show_non_applicable: ref(true), drawerWidth: ref(400) }),
  getters: {},
  actions: {},
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
}
