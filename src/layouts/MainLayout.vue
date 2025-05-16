<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated>
      <MainToolbar
        @toggleLeftDrawer="toggleLeftDrawer"
        @toggleRightDrawer="toggleRightDrawer"
        @importDialog="import_dialog = true"
      ></MainToolbar>
    </q-header>

    <q-drawer
      show-if-above
      v-model="leftDrawerOpen"
      side="left"
      bordered
      :width="drawerWidth"
      :breakpoint="0"
    >
      <RequirementTree></RequirementTree>
      <div
        v-touch-pan.preserveCursor.prevent.mouse.horizontal="resizeDrawer"
        class="q-drawer__resizer"
      ></div>
    </q-drawer>

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
import RequirementTree from 'components/RequirementTree.vue'
import MainToolbar from 'components/MainToolbar.vue'
import ImportDialog from 'components/dialogs/ImportDialog.vue'
import TaskProgressCard from 'components/TasksProgressCard.vue'

const leftDrawerOpen = ref(true)
const rightDrawerOpen = ref(false)

const import_dialog = ref(false)
const drawerWidth = ref(400)
let initialDrawerWidth

function resizeDrawer(ev) {
  if (ev.isFirst === true) {
    initialDrawerWidth = drawerWidth.value
  }
  drawerWidth.value = initialDrawerWidth + ev.offset.x
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value
}
</script>

<style lang="sass" scoped>
.q-drawer__resizer
  position: absolute
  top: 0
  bottom: 0
  right: -2px
  width: 4px
  cursor: ew-resize
</style>
