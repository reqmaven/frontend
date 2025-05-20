<template>
  <q-dialog @before-show="load_initial_data">
    <q-card style="width: 70vw; max-width: 90vw">
      <q-card-section>
        <div class="text-h6">{{ props.title }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="row">
        <q-input
          ref="req_identifier_ref"
          class="col-3 q-pa-sm"
          v-model="requirement.req_identifier"
          filled
          label="Requirement Identifier"
          hint="Requirement Identifier"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Required']"
        />
        <SelectField
          ref="req_type_ref"
          class="col-3 q-pa-sm"
          label="Requirement Type"
          v-model="requirement_type"
          url="/requirements/"
          options_field="type"
          lazy-rules
          :rules="[(val) => val != null || 'Required']"
        ></SelectField>
      </q-card-section>

      <q-card-section class="row">
        <q-input
          ref="req_name_ref"
          class="col-3 q-pa-sm"
          v-model="requirement.name"
          autofocus
          filled
          label="Requirement name"
          hint="Requirement name"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Required']"
        />
        <SelectField
          ref="req_applicability_ref"
          class="col-3 q-pa-sm"
          label="Applicability"
          v-model="applicability"
          url="/requirements/"
          options_field="applicability"
          lazy-rules
          :rules="[(val) => val != null || 'Required']"
        ></SelectField>
      </q-card-section>

      <q-card-section class="row">
        <q-input
          ref="req_applicabiliy_comment_ref"
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
    const requirement = ref({ requirement: null, notes: null, type: null })
    const $q = useQuasar()
    const applicability = ref()
    const applicability_options = ref()
    const requirement_type = ref()
    const requirement_types = ref()
    const req_identifier_ref = ref()
    const req_type_ref = ref()
    const req_name_ref = ref()
    const req_applicability_ref = ref()
    const req_applicabiliy_comment_ref = ref()

    async function load_requirement_types() {
      await api.options('/requirements/').then((response) => {
        requirement_types.value = response.data.actions.POST['type'].choices.map((x) => {
          return { id: x.value, name: x.display_name }
        })
      })
    }

    async function load_applicability_options() {
      await api.options('/requirements/').then((response) => {
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

          for (let d of requirement_types.value) {
            if (d.id == requirement.value.type) {
              requirement_type.value = d
              break
            }
          }
          for (let d of applicability_options.value) {
            if (d.id == requirement.value.applicability) {
              applicability.value = d
              break
            }
          }
        })
      } else {
        requirement.value.type = null
        requirement.value.applicability = null
        requirement.value.name = null
        requirement.value.req_identifier = null
        requirement.value.applicability_comment = null
        requirement.value.requirement = null
        requirement.value.notes = null
        applicability.value = null
      }
    }

    function validate_and_submit() {
      let validated = true
      validated &= req_identifier_ref.value.validate()
      validated &= req_type_ref.value.validate()
      validated &= req_name_ref.value.validate()
      validated &= req_applicability_ref.value.validate()
      validated &= req_applicabiliy_comment_ref.value.validate()
      if (validated) {
        const data = requirement.value
        data.type = requirement_type.value.id
        data.applicability = applicability.value.id
        delete data.history
        delete data.caused_by

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

      req_identifier_ref,
      req_type_ref,
      req_name_ref,
      req_applicability_ref,
      req_applicabiliy_comment_ref,
    }
  },
  components: { SelectField },
}
</script>
