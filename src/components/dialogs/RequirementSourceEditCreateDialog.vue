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
          v-model="requirement_source.name"
          autofocus
          autogrow
          filled
          @keyup.enter="prompt = false"
          label="Requirement source name"
          hint="Requirement text"
        />
        <br />
        <q-input
          type="textarea"
          v-model="requirement_source.description"
          autogrow
          filled
          label="Requirement source description"
          hint="Requirement source description"
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
  name: 'RequirementSourceEditCreateDialog',
  props: {
    requirement_source_id: {
      type: Number,
    },
    project_id: {
      type: Number,
    },
    title: {
      type: String,
      default: 'Create Requirement Source',
    },
  },
  emits: ['onCreated', 'onUpdated'],
  setup(props, ctx) {
    const requirement_source = ref({ name: '', description: '' })
    const $q = useQuasar()

    function load_initial_data() {
      if (props.requirement_source_id) {
        api.get(`/requirement-source/${props.requirement_source_id}/`).then((response) => {
          requirement_source.value = response.data
        })
      }
    }

    function validate_and_submit() {
      const data = requirement_source.value

      if (props.requirement_source_id) {
        edit_requirement_source(data)
      } else {
        data.project = props.project_id
        create_requirement_source(data)
      }
    }

    function edit_requirement_source(validated_data) {
      api
        .put(`/requirement-source/${props.requirement_source_id}/`, validated_data)
        .then((response) => {
          requirement_source.value.name = ''
          requirement_source.value.description = ''
          $q.notify({
            color: 'positive',
            message: `Requirement source ${response.data.name} updated`,
          })
          ctx.emit('onUpdated')
        })
        .catch(() => {
          $q.notify({
            color: 'negative',
            position: 'top',
            message: 'Unable to update requirement source',
            icon: 'report_problem',
          })
        })
    }

    function create_requirement_source(validated_data) {
      api
        .post('/requirement-source/', validated_data)
        .then((response) => {
          requirement_source.value.name = ''
          requirement_source.value.description = ''
          $q.notify({
            color: 'positive',
            message: `Requirement source ${response.data.name} created`,
          })
          ctx.emit('onCreated')
        })
        .catch(() => {
          $q.notify({
            color: 'negative',
            position: 'top',
            message: 'Unable to create requirement source',
            icon: 'report_problem',
          })
        })
    }

    return {
      props,
      requirement_source,

      validate_and_submit,
      load_initial_data,
    }
  },
}
</script>
