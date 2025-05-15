<template>
  <div class="q-pa-md q-gutter-sm">
    <FiltersCard @updateFilters="onFiltersUpdate"></FiltersCard>

    <q-table
      ref="tableRef"
      title="Requirements"
      :rows="rows"
      :columns="columns"
      v-model:pagination="pagination"
      :loading="loading"
      :filter="filter"
      row-key="id"
      @request="onRequest"
      wrap-cells
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
    </q-table>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import FiltersCard from 'components/FiltersCard.vue'
import { useProjectStore } from 'stores/projects'
import { useRequirementSourceStore } from 'stores/requirementSources'
import { useRequirementTypeStore } from 'stores/requirementType'

const applic = ['Todo', 'Applicable', 'No', 'Modified']
const projects = useProjectStore()
const requirement_source = useRequirementSourceStore()
const requirement_type = useRequirementTypeStore()

const columns = [
  {
    name: 'Project',
    required: true,
    label: 'Project name',
    align: 'left',
    field: 'project',
    format: (val) => projects.getProjectById(val).name,
  },
  {
    name: 'source',
    align: 'center',
    label: 'Source',
    field: 'source_reference',
    sortable: true,
    format: (val) => requirement_source.getSourceById(val).name,
  },
  { name: 'req_identifier', label: 'Identifier', field: 'req_identifier', sortable: true },
  {
    name: 'type',
    label: 'Type',
    field: 'type',
    format: (val) => {
      if (val) return requirement_type.getTypeById(val).name
    },
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
  setup() {
    const tableRef = ref()

    const rows = ref([])
    const loading = ref(false)
    const filter = ref('')
    const filters = ref({ project: [], requirement_sources: [], applicability: [], type: [] })
    const pagination = ref({
      sortBy: 'desc',
      descending: false,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 100,
    })

    function onRequest(props) {
      const filter = props.filter

      loading.value = true

      api
        .get(`/requirements/`, {
          params: {
            project__in: filters.value.project.join(),
            source_reference__in: filters.value.requirement_sources.join(),
            applicability__in: filters.value.applicability.join(),
            type__in: filters.value.type.join(),
            page: props.pagination.page,
            search: filter,
          },
        })
        .then((response) => {
          rows.value = response.data.results
          pagination.value.rowsNumber = response.data.count
          pagination.value.page = props.pagination.page
          loading.value = false
        })
    }

    function onFiltersUpdate(props) {
      console.log(props)
      filters.value = props

      pagination.value.page = 1

      let tmp = {}
      tmp.pagination = pagination.value
      onRequest(tmp)
    }

    onMounted(() => {
      // get initial data from server (1st page)
      tableRef.value.requestServerInteraction()
    })

    return {
      tableRef,
      columns,
      rows,
      pagination,
      loading,
      filter,
      onRequest,
      onFiltersUpdate,
    }
  },
  components: { FiltersCard },
}
</script>
