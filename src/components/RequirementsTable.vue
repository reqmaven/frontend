<template>
  <q-table
    ref="tableRef"
    :title="props.title"
    :rows="rows"
    :columns="columns"
    v-model:pagination="pagination"
    :loading="loading"
    :filter="filter"
    row-key="id"
    @request="onRequest"
    wrap-cells
    virtual-scroll
  >
    <template v-slot:top-right>
      <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>
  </q-table>
</template>

<script>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'

const applic = ['Todo', 'Applicable', 'No', 'Modified']

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
  name: 'RequirementTable',
  props: {
    project_id: {
      type: Number,
    },
    title: {
      type: String,
    },
    filters: {
      type: Object,
    },
  },
  setup(props) {
    const tableRef = ref()
    const rows = ref([])
    const loading = ref(false)
    const filter = ref('')
    const pagination = ref({
      sortBy: 'desc',
      descending: false,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 100,
    })

    function onRequest(params) {
      const filter = params.filter

      loading.value = true

      api
        .get(`/requirements/`, {
          params: {
            page: params.pagination.page,
            search: filter,
            ...props.filters,
          },
        })
        .then((response) => {
          rows.value = response.data.results
          pagination.value.rowsNumber = response.data.count
          pagination.value.page = params.pagination.page
          loading.value = false
        })
    }

    onMounted(() => {
      tableRef.value.requestServerInteraction()
    })

    return {
      props,
      tableRef,

      columns,
      rows,
      loading,
      filter,
      pagination,

      onRequest,
    }
  },
}
</script>
