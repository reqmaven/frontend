<template>
  <q-dialog @before-show="load_initial_data">
    <q-card style="width: 70vw; max-width: 90vw">
      <q-card-section>
        <div class="text-h6">{{ props.title }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="row">
        <q-input
          class="col-3 q-pa-sm"
          v-model="requirement.req_identifier"
          filled
          label="Requirement Identifier"
          hint="Requirement Identifier"
        />
        <SelectField
          class="col-3 q-pa-sm"
          label="Requirement Type"
          v-model="requirement_type"
          url="/requirements/"
          options_field="type"
        ></SelectField>
      </q-card-section>

      <q-card-section class="row">
        <q-input
          class="col-3 q-pa-sm"
          v-model="requirement.name"
          autofocus
          filled
          label="Requirement name"
          hint="Requirement name"
        />
        <SelectField
          class="col-3 q-pa-sm"
          label="Applicability"
          v-model="applicability"
          url="/requirements/"
          options_field="applicability"
        ></SelectField>
      </q-card-section>

      <q-card-section class="row">
        <q-input
          class="col-6 q-pa-sm"
          type="textarea"
          v-model="requirement.applicability_comment"
          autofocus
          autogrow
          filled
          @keyup.enter="prompt = false"
          label="Applicability comment"
          hint="Applicability comment"
        />
        <q-markdown :src="requirement.applicability_comment" class="col-6 q-pa-sm" />
      </q-card-section>

      <q-card-section class="row">
        <q-input
          class="col-6 q-pa-sm"
          type="textarea"
          v-model="requirement.requirement"
          autofocus
          autogrow
          filled
          @keyup.enter="prompt = false"
          label="Requirement"
          hint="Requirement text"
        />
        <q-markdown :src="requirement.requirement" class="col-6 q-pa-sm" />
      </q-card-section>

      <q-card-section class="row">
        <q-input
          class="col-6 q-pa-sm"
          type="textarea"
          v-model="requirement.notes"
          autogrow
          filled
          label="Requirement notes"
          hint="Requirement notes"
        />
        <q-markdown :src="requirement.notes" class="col-6 q-pa-sm" />
      </q-card-section>

      <q-separator />

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
import SelectField from 'components/SelectField.vue'

export default {
  name: 'RequirementEditCreateDialog',
  props: {
    requirement_id: {
      type: Number,
    },
    parent_requirement: {
      type: Object,
    },
    requirement_source_reference: {
      type: Object,
    },
    title: {
      type: String,
      default: 'Create Requirement',
    },
  },
  emits: ['onCreated', 'onUpdated'],
  setup(props, ctx) {
    const new_project_name = ref()
    const requirement = ref({ requirement: '', notes: '', type: null })
    const $q = useQuasar()
    const applicability = ref()
    const applicability_options = ref()
    const requirement_type = ref()
    const requirement_types = ref()

    function load_requirement_types() {
      api.options('/requirements/').then((response) => {
        requirement_types.value = response.data.actions.POST['type'].choices.map((x) => {
          return { id: x.value, name: x.display_name }
        })
      })
    }

    function load_applicability_options() {
      api.options('/requirements/').then((response) => {
        applicability_options.value = response.data.actions.POST['applicability'].choices.map(
          (x) => {
            return { id: x.value, name: x.display_name }
          },
        )
      })
    }

    function load_initial_data() {
      load_requirement_types()
      load_applicability_options()
      if (props.requirement_id) {
        api.get(`/requirements/${props.requirement_id}/`).then((response) => {
          new_project_name.value = response.data.name
          requirement.value = response.data
          requirement_type.value = requirement_types.value[requirement.value.type]
          applicability.value = applicability_options.value[requirement.value.applicability]
        })
      } else {
        requirement.value.requirement = ''
      }
    }

    function validate_and_submit() {
      const data = requirement.value
      data.type = requirement_type.value.id
      data.applicability = applicability.value.id

      if (props.requirement_id) {
        edit_requirement(data)
      } else {
        if (props.requirement_source_reference) {
          data.project = props.requirement_source_reference.project
          data.source_reference = props.requirement_source_reference.id
        } else {
          data.project = props.parent_requirement.project
          data.source_reference = props.parent_requirement.source_reference
          data.parent = props.parent_requirement.id
        }
        create_requirement(data)
      }
    }

    function edit_requirement(validated_data) {
      api
        .put(`/requirements/${props.requirement_id}/`, validated_data)
        .then((response) => {
          $q.notify({
            color: 'positive',
            message: `Requirement ${response.data.name} updated`,
          })
          ctx.emit('onUpdated')
        })
        .catch(() => {
          $q.notify({
            color: 'negative',
            position: 'top',
            message: 'Unable to update requirement',
            icon: 'report_problem',
          })
        })
    }

    function create_requirement(validated_data) {
      api
        .post('/requirements/', validated_data)
        .then((response) => {
          $q.notify({
            color: 'positive',
            message: `Requirement ${response.data.name} created`,
          })
          ctx.emit('onCreated')
        })
        .catch(() => {
          $q.notify({
            color: 'negative',
            position: 'top',
            message: 'Unable to create requirement',
            icon: 'report_problem',
          })
        })
    }

    return {
      props,
      new_project_name,
      requirement,
      applicability,
      requirement_type,
      validate_and_submit,
      load_initial_data,
    }
  },
  components: { SelectField },
}
</script>
