<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated>
      <MainToolbar
        @toggleRightDrawer="toggleRightDrawer"
        @importDialog="import_dialog = true"
      ></MainToolbar>
    </q-header>

    <q-drawer show-if-above v-model="rightDrawerOpen" side="right" bordered>
      <!-- drawer content -->
      <TaskProgressCard></TaskProgressCard>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <ImportDialog
      v-model="import_dialog"
      url="/requirements_import"
      @onImport="import_dialog = false"
    ></ImportDialog>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import MainToolbar from 'components/MainToolbar.vue'
import ImportDialog from 'components/dialogs/ImportDialog.vue'
import TaskProgressCard from 'components/TasksProgressCard.vue'

const rightDrawerOpen = ref(false)

const import_dialog = ref(false)

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value
}
</script>
