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

    <q-btn dense flat no-wrap>
      <q-avatar rounded size="32px">
        <img :src="users_store.me.avatar" />
      </q-avatar>
      <q-icon name="arrow_drop_down" size="20px" />

      <q-menu auto-close>
        <q-list dense>
          <q-item>
            <q-item-section>
              <div>
                Signed in as <strong>{{ users_store.me.username }}</strong>
              </div>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item clickable disable>
            <q-item-section>Your profile</q-item-section>
          </q-item>
          <q-item clickable disable>
            <q-item-section>Your projects</q-item-section>
          </q-item>
          <q-separator />
          <q-item clickable disable>
            <q-item-section>Help</q-item-section>
          </q-item>
          <q-item clickable disable>
            <q-item-section>Settings</q-item-section>
          </q-item>
          <q-item clickable>
            <q-item-section @click="onSignOut">Sign out</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>

    <q-btn
      flat
      round
      @click="$q.dark.toggle()"
      :icon="$q.dark.isActive ? 'brightness_2' : 'brightness_5'"
    />

    <div>Quasar v{{ $q.version }}</div>
    <q-btn dense flat round icon="menu" @click="$emit('toggleRightDrawer')" />
  </q-toolbar>
</template>

<script>
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from 'stores/users'
import { useProjectStore } from 'stores/projects'
import { useRequirementSourceStore } from 'stores/requirementSources'
import { useRequirementTypeStore } from 'stores/requirementType'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'MainToolbar',
  emits: ['toggleLeftDrawer', 'toggleRightDrawer', 'importDialog'],
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const users_store = useUsersStore()
    const projects = useProjectStore()
    const requirement_sources = useRequirementSourceStore()
    const requirement_type = useRequirementTypeStore()

    users_store.fetchData()
    projects.fetchData()
    requirement_sources.fetchData()
    requirement_type.fetchData()

    function onSignOut() {
      $q.localStorage.removeItem('token')
      router.push({ path: '/login' })
    }

    return { users_store, onSignOut }
  },
})
</script>
