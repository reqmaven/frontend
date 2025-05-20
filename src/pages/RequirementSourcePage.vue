<template>
  <div class="q-pa-md q-gutter-sm">
    <q-card>
      <q-card-section>
        <strong>Requirement Source: </strong> {{ requirement_source.name }} <br />
        <strong>Description: </strong>
        {{ requirement_source.description }}
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Edit" color="primary" @click="edit_requirement_source_dialog = true" />
        <q-btn
          flat
          label="Create Requirement"
          color="secondary"
          @click="create_requirement_dialog = true"
        />
        <q-btn
          flat
          label="Import Requirements"
          color="secondary"
          @click="import_requirements_dialog = true"
        />
        <q-btn
          flat
          label="Delete"
          color="negative"
          @click="show_delete_confirmation_dialog = true"
        />
      </q-card-actions>
    </q-card>

    <RequirementSourceEditCreateDialog
      v-model="edit_requirement_source_dialog"
      :requirement_source_id="requirement_source.id"
      @onUpdated="onRequirementSourceUpdated"
    />

    <RequirementEditCreateDialog
      v-model="create_requirement_dialog"
      :requirement_source_reference="requirement_source"
      @onCreated="onRequirementCreated()"
    />

    <DeleteConfirmationDialog
      v-model="show_delete_confirmation_dialog"
      :title="'Delete Requirement source'"
      :ondelete="onRequirementSourceDelete"
      ><template v-slot:message>
        Are you sure you want to delete
        <strong>{{ requirement_source.name }}</strong> requirement source?
      </template></DeleteConfirmationDialog
    >

    <ImportDialog
      v-model="import_requirements_dialog"
      url="/project_requirements_import"
      :params="{ source_reference: requirement_source.id }"
    />
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { useReqTreeStore } from 'stores/reqTree'
import DeleteConfirmationDialog from 'components/dialogs/DeleteConfirmationDialog.vue'
import RequirementSourceEditCreateDialog from 'components/dialogs/RequirementSourceEditCreateDialog.vue'
import RequirementEditCreateDialog from 'components/dialogs/RequirementEditCreateDialog.vue'
import ImportDialog from 'components/dialogs/ImportDialog.vue'

export default {
  props: { id: String },
  setup(props) {
    const requirement_source = ref({ name: '', description: null })
    const route = useRoute()
    const router = useRouter()
    const req_tree = useReqTreeStore()
    const edit_requirement_source_dialog = ref()
    const show_delete_confirmation_dialog = ref()
    const create_requirement_dialog = ref()
    const import_requirements_dialog = ref()

    function loadInitialData() {
      api.get(`/requirement-source/${props.id}`).then((response) => {
        requirement_source.value = response.data
      })
    }

    function onRequirementSourceUpdated() {
      req_tree.refreshRequirementsSources(requirement_source.value.id)
      edit_requirement_source_dialog.value = false
      loadInitialData()
    }

    function onRequirementSourceDelete() {
      api.delete(`/requirement-source/${requirement_source.value.id}/`).then((response) => {
        if (response.status) {
          req_tree.deleteRequirementSource(
            requirement_source.value.project,
            requirement_source.value.id,
          )
          show_delete_confirmation_dialog.value = false
          router.push({ path: `/project/${requirement_source.value.project}` })
        }
      })
    }

    function onRequirementCreated() {
      req_tree.refreshRequirementChildren(
        requirement_source.value.project,
        requirement_source.value.id,
        null,
      )
      create_requirement_dialog.value = false
    }

    watch(
      () => route.params.id,
      () => {
        api.get(`/requirement-source/${route.params.id}`).then((response) => {
          requirement_source.value = response.data
        })
      },
    )

    onMounted(() => {
      loadInitialData()
    })

    return {
      requirement_source,
      edit_requirement_source_dialog,
      show_delete_confirmation_dialog,
      create_requirement_dialog,
      import_requirements_dialog,

      onRequirementSourceUpdated,
      onRequirementSourceDelete,
      onRequirementCreated,
    }
  },
  components: {
    DeleteConfirmationDialog,
    RequirementSourceEditCreateDialog,
    RequirementEditCreateDialog,
    ImportDialog,
  },
}
</script>
