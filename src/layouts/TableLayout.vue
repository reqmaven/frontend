<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <MainToolbar @toggleRightDrawer="toggleRightDrawer"></MainToolbar>
    </q-header>

    <q-drawer show-if-above v-model="rightDrawerOpen" side="right" bordered>
      <!-- drawer content -->
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import MainToolbar from 'components/MainToolbar.vue'

const rightDrawerOpen = ref(false)

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value
}
</script>
