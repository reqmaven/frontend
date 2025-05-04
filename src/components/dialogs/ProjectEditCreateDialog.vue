<template>
  <q-dialog @before-show="load_initial_data">
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">{{ props.title }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-input
          type="textarea"
          v-model="project.name"
          autofocus
          autogrow
          filled
          @keyup.enter="prompt = false"
          label="Project name"
          hint="Project name"
        />
        <br />
        <q-input
          type="textarea"
          v-model="project.description"
          autogrow
          filled
          label="Project description"
          hint="Project description"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn flat label="Save" color="primary" type="submit" @click="validate_and_submit()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

export default {
  name: 'ProjectEditCreateDialog',
  props: {
    project_id: {
      type: Number,
    },
    title: {
      type: String,
      default: 'Create Project',
    },
  },
  emits: ['onCreated', 'onUpdated'],
  setup(props, ctx) {
    const project = ref({ name: '', description: '' })
    const $q = useQuasar()

    function load_initial_data() {
      if (props.project_id) {
        api.get(`/project/${props.project_id}/`).then((response) => {
          project.value = response.data
        })
      }
    }

    function validate_and_submit() {
      const data = project.value

      if (props.project_id) {
        edit_project(data)
      } else {
        create_project(data)
      }
    }

    function edit_project(validated_data) {
      api
        .put(`/project/${props.project_id}/`, validated_data)
        .then((response) => {
          project.value.name = ''
          project.value.description = ''
          $q.notify({
            color: 'positive',
            message: `Project ${response.data.name} updated`,
          })
          ctx.emit('onUpdated')
        })
        .catch(() => {
          $q.notify({
            color: 'negative',
            position: 'top',
            message: 'Unable to update project',
            icon: 'report_problem',
          })
        })
    }

    function create_project(validated_data) {
      api
        .post('/project/', validated_data)
        .then((response) => {
          project.value.name = ''
          project.value.description = ''
          $q.notify({
            color: 'positive',
            message: `Project ${response.data.name} created`,
          })
          ctx.emit('onCreated')
        })
        .catch(() => {
          $q.notify({
            color: 'negative',
            position: 'top',
            message: 'Unable to create project',
            icon: 'report_problem',
          })
        })
    }

    return {
      props,
      project,

      validate_and_submit,
      load_initial_data,
    }
  },
}
</script>
