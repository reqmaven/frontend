<template>
  <q-select
    ref="select"
    filled
    v-model="model"
    use-input
    input-debounce="0"
    :options="filterOptions"
    style="width: 250px"
    option-label="name"
    option-value="id"
    map-options
    @filter="filterFn"
  />
</template>

<script>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'

export default {
  name: 'SelectField',
  props: {
    url: String,
    options_field: String,
  },
  setup(props) {
    const model = ref()
    const stringOptions = ref([])
    const filterOptions = ref([])

    function filterFn(val, update) {
      model.value = stringOptions.value[3]
      update(() => {
        if (val === '') {
          filterOptions.value = stringOptions.value
        } else {
          const needle = val.toLowerCase()
          filterOptions.value = stringOptions.value.filter(
            (v) => v.name.toLowerCase().indexOf(needle) > -1,
          )
        }
      })
    }

    onMounted(() => {
      if (props.options_field) {
        api.options(props.url).then((response) => {
          stringOptions.value = response.data.actions.POST[props.options_field].choices.map((x) => {
            return { id: x.value, name: x.display_name }
          })
        })
      } else {
        api.get(`${props.url}`).then((response) => {
          stringOptions.value = response.data.results
          filterOptions.value = response.data.results
        })
      }
    })

    return {
      model,
      filterOptions,

      filterFn,
    }
  },
  methods: {
    validate(...args) {
      return this.$refs.select.validate(...args)
    },
  },
}
</script>
