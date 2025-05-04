<template>
  <div class="q-pa-md q-gutter-sm">
    <q-card>
      <q-card-section>
        <strong>Project: </strong> {{ project.name }} <br />
        <strong>Description: </strong>
        {{ project.description }}
      </q-card-section>

      <q-card-actions align="right" class="bg-white text-teal">
        <q-btn flat label="Edit" color="primary" @click="project_edit_dialog = true" />
        <q-btn
          flat
          label="Create Requirement Source"
          color="secondary"
          @click="create_requirement_source_dialog = true"
        />
        <q-btn
          flat
          label="Delete"
          color="negative"
          @click="show_delete_confirmation_dialog = true"
        />
      </q-card-actions>
    </q-card>

    <ProjectEditCreateDialog
      v-model="project_edit_dialog"
      title="Edit Project"
      :project_id="project.id"
      @onUpdated="onProjectUpdated()"
    >
    </ProjectEditCreateDialog>

    <RequirementSourceEditCreateDialog
      v-model="create_requirement_source_dialog"
      :project_id="project.id"
      @onCreated="create_requirement_source_dialog = false"
    />

    <DeleteConfirmationDialog
      v-model="show_delete_confirmation_dialog"
      :title="'Delete Project'"
      :ondelete="onProjectDelete"
      ><template v-slot:message>
        Are you sure you want to delete
        <strong>{{ project.name }}</strong> project?
      </template></DeleteConfirmationDialog
    >
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import DeleteConfirmationDialog from 'components/dialogs/DeleteConfirmationDialog.vue'
import ProjectEditCreateDialog from 'components/dialogs/ProjectEditCreateDialog.vue'
import RequirementSourceEditCreateDialog from 'components/dialogs/RequirementSourceEditCreateDialog.vue'

export default {
  props: { id: String },
  setup(props) {
    const project = ref({ name: '', description: null })
    const route = useRoute()
    const router = useRouter()
    const create_requirement_source_dialog = ref()
    const show_delete_confirmation_dialog = ref()
    const project_edit_dialog = ref()

    function loadInitialData() {
      api.get(`/project/${props.id}`).then((response) => {
        project.value = response.data
      })
    }

    function onProjectUpdated() {
      project_edit_dialog.value = false
      loadInitialData()
    }

    function onProjectDelete() {
      api.delete(`/project/${project.value.id}/`).then((response) => {
        if (response.status) {
          show_delete_confirmation_dialog.value = false
          router.push({ path: `/` })
        }
      })
    }

    watch(
      () => route.params.id,
      () => {
        api.get(`/project/${route.params.id}`).then((response) => {
          project.value = response.data
        })
      },
    )

    onMounted(() => {
      loadInitialData()
    })

    return {
      project,
      create_requirement_source_dialog,
      show_delete_confirmation_dialog,
      project_edit_dialog,

      onProjectUpdated,
      onProjectDelete,
    }
  },
  components: {
    DeleteConfirmationDialog,
    ProjectEditCreateDialog,
    RequirementSourceEditCreateDialog,
  },
}
</script>
