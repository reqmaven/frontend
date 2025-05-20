<template>
  <q-toggle
    v-model="show_non_applicable"
    label="Show Non applicable"
    @update:model-value="loadData"
  />
  <q-markdown :src="page" />
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { storeToRefs } from 'pinia'
import { useRequirementsCacheStore } from 'stores/requirementsCache'
import { useSettingsStore } from 'stores/settings'

export default {
  name: 'RequirementsDocCard',
  props: {
    id: Number,
  },
  setup(props) {
    const requirementCache = useRequirementsCacheStore()
    const requirement = ref({ name: '' })
    const { show_non_applicable } = storeToRefs(useSettingsStore())
    const page = ref()
    const $q = useQuasar()

    function formatHeading(requirement, level) {
      let heading_preamble = '\n' + '#'.repeat(level) + ' '
      let heading_text = requirement.name
      if (requirement.ie_puid) {
        heading_text += ` - ${requirement.ie_puid}`
      }
      if (requirement.applicability == 2) {
        return heading_preamble + '~~' + heading_text + '~~\n'
      } else {
        return heading_preamble + heading_text + '\n'
      }
    }

    function formatReq(children, level) {
      let heading = formatHeading(children, level)
      if (children.applicability == 2) {
        if (show_non_applicable.value) {
          return (
            heading +
            `
<details>
${children.requirement}
</details>
`
          )
        } else {
          return ''
        }
      } else {
        if (children.type == 4) {
          return heading + `\n`
        } else {
          return heading + `${children.requirement}\n`
        }
      }
    }

    async function formatRequirement(id, level) {
      const result = requirementCache.getOrFetch(id)
      const req = await result
      let text = formatReq(req, level)

      for (let children_id of req.children) {
        const child_result = formatRequirement(children_id, level + 1)
        let c = await child_result
        text = text + c
      }
      return text
    }

    async function createPage() {
      $q.loading.show({
        message: 'Loading requirements',
      })
      // Preload requirements
      await requirementCache.fetchRequirementsSource(requirement.value.source_reference)
      const result = formatRequirement(requirement.value.id, 1)
      const text = await result
      page.value = text
      $q.loading.hide()
    }

    function loadData() {
      if (props.id) {
        api.get(`/requirements/${props.id}`).then((response) => {
          requirement.value = response.data

          createPage()
        })
      }
    }

    watch(
      () => props.id,
      () => {
        loadData()
      },
    )

    onMounted(() => {
      loadData()
    })

    return {
      page,
      show_non_applicable,
      loadData,
    }
  },
}
</script>
