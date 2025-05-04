<template>
  <q-card class="my-card" flat bordered>
    <q-card-actions>
      <div class="text-h5 q-mt-sm q-mb-xs">Filters</div>
      <q-space />

      <q-btn
        color="grey"
        round
        flat
        dense
        :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
        @click="expanded = !expanded"
      />
    </q-card-actions>

    <q-slide-transition>
      <div v-show="expanded">
        <q-separator />
        <q-card-section class="text-subtitle2 row">
          <FilterMultipleSelect
            class="col"
            label="Select project"
            v-model="model"
            url="/project/"
          ></FilterMultipleSelect>
          <FilterMultipleSelect
            class="col"
            label="Select Requirement Source"
            v-model="model2"
            url="/requirement-source/"
          ></FilterMultipleSelect>
          <FilterMultipleSelect
            label="Requirement Type"
            v-model="requirement_type"
            url="/requirements/"
            options_field="type"
          ></FilterMultipleSelect>
          <FilterMultipleSelect
            label="Applicability"
            v-model="applicability"
            url="/requirements/"
            options_field="applicability"
          ></FilterMultipleSelect>
        </q-card-section>
        <q-card-actions>
          <q-btn color="primary" label="Apply" @click="onApply" />
          <q-btn color="secondary" label="Clear" @click="onClear" />
        </q-card-actions>
      </div>
    </q-slide-transition>
  </q-card>
</template>

<script>
import { ref, onMounted } from 'vue'
import FilterMultipleSelect from 'components/FilterMultipleSelect.vue'

export default {
  emits: ['updateFilters'],
  props: {},
  setup(props, { emit }) {
    const model = ref([])
    const model2 = ref([])
    const requirement_type = ref([])
    const applicability = ref([])

    const expanded = ref(false)

    function onApply() {
      let filters = {}
      filters.project = model.value.map((x) => {
        return x.id
      })
      filters.requirement_sources = model2.value.map((x) => {
        return x.id
      })
      filters.applicability = applicability.value.map((x) => {
        return x.id
      })
      emit('updateFilters', filters)
    }

    function onClear() {
      model.value = []
      model2.value = []
      applicability.value = []
    }

    onMounted(() => {
      // get initial data from server (1st page)
    })

    return {
      model,
      model2,
      expanded,
      applicability,
      requirement_type,

      onApply,
      onClear,
    }
  },
  components: { FilterMultipleSelect },
}
</script>
