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
          <q-card-section>
            <q-table
              title="Caused by"
              :rows="rows"
              :columns="columns"
              :filter="filter"
              row-key="id"
              wrap-cells
            >
              <template v-slot:top-right>
                <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
                <q-btn
                  color="primary"
                  icon-right="add"
                  no-caps
                  @click="show_requirement_pick_dialog = true"
                />
              </template>
            </q-table>
          </q-card-section>

          <q-separator />
          <q-card-section>
            <strong>Mentions:</strong>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
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

    <RequirementPickDialog
      v-model="show_requirement_pick_dialog"
      :project_id="requirement.project"
      :requirement="requirement"
      @onAdded="onCausedByAdded"
    ></RequirementPickDialog>

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
import { useReqTreeStore } from 'stores/reqTree'
import RequirementEditCreateDialog from 'components/dialogs/RequirementEditCreateDialog.vue'
import DeleteConfirmationDialog from 'components/dialogs/DeleteConfirmationDialog.vue'
import CommentsCard from 'components/CommentsCard.vue'
import HistoryCard from 'components/HistoryCard.vue'
import RequirementsDocCard from 'components/RequirementsDocCard.vue'
import RequirementPickDialog from 'components/dialogs/RequirementPickDialog.vue'

const applic = ['Todo', 'Applicable', 'No', 'Modified']
const req_type_map = [
  'unknown',
  'Requirement',
  'Recommendation',
  'Permission',
  'Heading',
  'Information',
]

const columns = [
  { name: 'req_identifier', label: 'Identifier', field: 'req_identifier', sortable: true },
  {
    name: 'type',
    label: 'Type',
    field: 'type',
  },
  { name: 'ie_puid', label: 'PUID', field: 'ie_puid' },
  {
    name: 'applicability',
    label: 'Applicability',
    field: 'applicability',
    format: (val) => applic[val],
  },
  { name: 'requirement', label: 'Requirement', align: 'center', field: 'requirement' },
  {
    name: 'notes',
    label: 'Notes',
    field: 'notes',
  },
]

export default {
  props: { id: String },
  setup(props) {
    const requirement = ref({ name: '' })
    const route = useRoute()
    const router = useRouter()
    const req_tree = useReqTreeStore()
    const edit_requirement = ref()
    const create_requirement = ref()
    const show_delete_confirmation_dialog = ref()
    const show_requirement_pick_dialog = ref()
    const rows = ref([])
    const filter = ref()

    function loadInitialData() {
      api.get(`/requirements/${props.id}`).then((response) => {
        requirement.value = response.data
        rows.value = requirement.value.caused_by
      })
    }

    function onUpdated() {
      edit_requirement.value = false
      loadInitialData()
    }

    function onCreated() {
      req_tree.refreshRequirementChildren(
        requirement.value.project,
        requirement.value.source_reference,
        requirement.value.id,
      )
      create_requirement.value = false
    }

    function onRequirementDelete() {
      api.delete(`/requirements/${requirement.value.id}/`).then((response) => {
        if (response.status) {
          req_tree.deleteRequirement(
            requirement.value.project,
            requirement.value.source_reference,
            requirement.value.id,
          )
          show_delete_confirmation_dialog.value = false
          if (requirement.value.parent) {
            router.push({ path: `/requirement/${requirement.value.parent}` })
          }
        }
      })
    }

    function onCausedByAdded() {
      show_requirement_pick_dialog.value = false
      loadInitialData()
    }

    watch(
      () => route.params.id,
      () => {
        api.get(`/requirements/${route.params.id}`).then((response) => {
          requirement.value = response.data
          rows.value = requirement.value.caused_by
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
      show_requirement_pick_dialog,
      columns,
      rows,
      filter,

      onCreated,
      onUpdated,
      onRequirementDelete,
      onCausedByAdded,

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
    RequirementPickDialog,
  },
}
</script>
