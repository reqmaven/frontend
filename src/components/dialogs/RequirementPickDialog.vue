<template>
  <q-dialog>
    <q-card style="width: 60vw; max-width: 80vw">
      <q-card-section>
        <RequirementsTable
          class="scroll"
          style="max-height: 70vh"
          ref="tableRef"
          :title="props.title"
          selection="single"
          v-model:selected="selected"
          :filters="{ project: props.requirement.project }"
        >
        </RequirementsTable>
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
import RequirementsTable from 'components/RequirementsTable.vue'

export default {
  name: 'RequirementPickDialog',
  props: {
    project_id: {
      type: Number,
    },
    requirement: {
      type: Object,
      required: true,
    },
    title: {
      type: String,
      default: 'Select Requirement',
    },
  },
  emits: ['onAdded'],
  setup(props, ctx) {
    const $q = useQuasar()
    const tableRef = ref()
    const selected = ref()

    function validate_and_submit() {
      if (selected.value) {
        let data = { caused_by: [] }
        for (let req of props.requirement.caused_by) {
          data.caused_by.push(req.id)
        }
        data.caused_by.push(selected.value[0].id)
        api
          .patch(`/requirements/${props.requirement.id}/`, data)
          .then(() => {
            ctx.emit('onAdded')
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
    }

    return {
      props,
      tableRef,

      selected,

      validate_and_submit,
    }
  },
  components: { RequirementsTable },
}
</script>
