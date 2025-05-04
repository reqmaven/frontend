<template>
  <q-toolbar>
    <q-btn flat dense round icon="menu" aria-label="Menu" @click="$emit('toggleLeftDrawer')" />

    <q-toolbar-title>
      <q-avatar> </q-avatar>
      Reqman
    </q-toolbar-title>

    <q-tabs align="left">
      <q-route-tab to="/" label="Requirements Tree" />
      <q-route-tab to="/requirements" label="Requirements Table" />
      <q-btn-dropdown auto-close stretch flat label="Tools">
        <q-list>
          <q-item clickable @click="$emit('importDialog')">
            <q-item-section>Import</q-item-section>
          </q-item>

          <q-item clickable @click="$emit('exportDialog')">
            <q-item-section>Export</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </q-tabs>
    <div>Quasar v{{ $q.version }}</div>
    <q-btn dense flat round icon="menu" @click="$emit('toggleRightDrawer')" />
  </q-toolbar>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MainToolbar',
  emits: ['toggleLeftDrawer', 'toggleRightDrawer'],
  setup() {},
})
</script>
