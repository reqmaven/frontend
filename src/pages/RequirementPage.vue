<template>
  <div class="q-pa-md q-gutter-sm">
    <q-card>
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="requirement" label="Requirement" />
        <q-tab name="page" label="Page" />
        <q-tab name="history" label="History" />
        <q-tab name="comments" label="Comments" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="requirement">
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
        </q-tab-panel>

        <q-tab-panel name="page">
          <RequirementsDocCard :id="requirement.id"></RequirementsDocCard>
        </q-tab-panel>

        <q-tab-panel name="history">
          <HistoryCard :id="requirement.id"></HistoryCard>
        </q-tab-panel>

        <q-tab-panel name="comments">
          <CommentsCard :id="requirement.id"></CommentsCard>
        </q-tab-panel>
      </q-tab-panels>
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
      @onCreated="onCreated()"
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
import CommentsCard from 'components/CommentsCard.vue'
import HistoryCard from 'components/HistoryCard.vue'
import RequirementsDocCard from 'components/RequirementsDocCard.vue'

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

    function loadInitialData() {
      api.get(`/requirements/${props.id}`).then((response) => {
        requirement.value = response.data
      })
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
        })
      },
    )

    onMounted(() => {
      loadInitialData()
    })

    return {
      tab: ref('requirement'),
      requirement,
      edit_requirement,
      create_requirement,
      show_delete_confirmation_dialog,

      onCreated,
      onUpdated,
      onRequirementDelete,

      applic,
      req_type_map,
    }
  },
  components: {
    RequirementEditCreateDialog,
    DeleteConfirmationDialog,
    HistoryCard,
    CommentsCard,
    RequirementsDocCard,
  },
}
</script>
