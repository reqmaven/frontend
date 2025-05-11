<template>
  <div class="q-pa-md q-gutter-sm">
    <q-card>
      <q-card-section>
        <strong>Name: </strong> {{ requirement.name }}<br />
        <strong>Applicability: </strong> {{ applic[requirement.applicability] }}<br />
        <strong>Requirement type: </strong>{{ req_type_map[requirement.type] }}<br />
        <strong>Requirement identifier: </strong>{{ requirement.req_identifier }}<br />
        <strong>PUID: </strong>{{ requirement.ie_puid }}<br />
      </q-card-section>

      <q-card-section>
        <q-separator />
        <strong>Requirement:</strong><br />
        <q-markdown :src="requirement.requirement" show-copy />
        <br />
        <q-separator />

        <strong>Notes:</strong><br />
        <q-markdown :src="requirement.notes" />
        <br />

        <q-separator />

        <strong>Applicability comment: </strong><br />
        <q-markdown :src="requirement.applicability_comment" />
        <br />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="bg-white text-teal">
        <q-btn flat label="Edit" color="primary" @click="edit_requirement = true" />
        <q-btn
          flat
          label="Create child requirement"
          color="secondary"
          @click="create_requirement = true"
        />
        <q-btn
          flat
          label="Delete"
          color="negative"
          @click="show_delete_confirmation_dialog = true"
        />
      </q-card-actions>
    </q-card>

    <q-card>
      <q-card-section><q-markdown :src="page" /></q-card-section>
    </q-card>

    <RequirementEditCreateDialog
      v-model="edit_requirement"
      title="Edit Requirement"
      :requirement_id="requirement.id"
      @onUpdated="onUpdated"
    ></RequirementEditCreateDialog>

    <RequirementEditCreateDialog
      v-model="create_requirement"
      :parent_requirement="requirement"
      @onCreated="onCreated"
    ></RequirementEditCreateDialog>

    <DeleteConfirmationDialog
      v-model="show_delete_confirmation_dialog"
      :title="'Delete Requirement'"
      :ondelete="onRequirementDelete"
      ><template v-slot:message>
        Are you sure you want to delete
        <strong>{{ requirement.requirement }}</strong> requirement?
      </template></DeleteConfirmationDialog
    >
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import RequirementEditCreateDialog from 'components/dialogs/RequirementEditCreateDialog.vue'
import DeleteConfirmationDialog from 'components/dialogs/DeleteConfirmationDialog.vue'

const applic = ['Todo', 'Applicable', 'No', 'Modified']
const req_type_map = [
  'unknown',
  'Requirement',
  'Recommendation',
  'Permission',
  'Heading',
  'Information',
]

export default {
  props: { id: String },
  setup(props) {
    const requirement = ref({ name: '' })
    const route = useRoute()
    const router = useRouter()
    const edit_requirement = ref()
    const create_requirement = ref()
    const show_delete_confirmation_dialog = ref()
    const page = ref()

    function loadInitialData() {
      api.get(`/requirements/${props.id}`).then((response) => {
        requirement.value = response.data

        createPage()
      })
    }

    function formatChildren(children) {
      if (children.applicability == 2) {
        let req = `
### ~~${children.name} - ${children.ie_puid}~~
<details>
${children.requirement}
</details>
`
        return req
      } else {
        let req = `
### ${children.name} - ${children.ie_puid}
${children.requirement}
`
        return req
      }
    }

    function getChildrens(id) {
      api.get(`/requirement-childrens/${id}`).then((response) => {
        let page_text = `## ${requirement.value.name}
${requirement.value.requirement}`
        for (let child of response.data.children) {
          page_text += formatChildren(child)
        }
        page.value = page_text
      })
    }

    function createPage() {
      getChildrens(requirement.value.id)
    }

    function onUpdated() {
      edit_requirement.value = false
      loadInitialData()
    }

    function onCreated() {
      create_requirement.value = false
    }

    function onRequirementDelete() {
      api.delete(`/requirements/${requirement.value.id}/`).then((response) => {
        if (response.status) {
          show_delete_confirmation_dialog.value = false
          if (requirement.value.parent) {
            router.push({ path: `/requirement/${requirement.value.parent}` })
          }
        }
      })
    }

    watch(
      () => route.params.id,
      () => {
        api.get(`/requirements/${route.params.id}`).then((response) => {
          requirement.value = response.data
          createPage()
        })
      },
    )

    onMounted(() => {
      loadInitialData()
    })

    return {
      requirement,
      edit_requirement,
      create_requirement,
      show_delete_confirmation_dialog,
      page,

      onCreated,
      onUpdated,
      onRequirementDelete,

      applic,
      req_type_map,
    }
  },
  components: { RequirementEditCreateDialog, DeleteConfirmationDialog },
}
</script>
