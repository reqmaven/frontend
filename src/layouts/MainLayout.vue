<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated>
      <MainToolbar
        @toggleLeftDrawer="toggleLeftDrawer"
        @toggleRightDrawer="toggleRightDrawer"
        @importDialog="import_dialog = true"
      ></MainToolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered :width="600">
      <RequirementTree></RequirementTree>
    </q-drawer>

    <q-drawer show-if-above v-model="rightDrawerOpen" side="right" bordered>
      <!-- drawer content -->
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <ImportDialog v-model="import_dialog" url="/requirements_import"></ImportDialog>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import RequirementTree from 'components/RequirementTree.vue'
import MainToolbar from 'components/MainToolbar.vue'
import ImportDialog from 'components/dialogs/ImportDialog.vue'

const leftDrawerOpen = ref(true)
const rightDrawerOpen = ref(false)

const import_dialog = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value
}
</script>
