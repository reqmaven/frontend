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
import { api } from 'boot/axios'
import { useRequirementsCacheStore } from 'stores/requirementsCache'

export default {
  name: 'RequirementsDocCard',
  props: {
    id: Number,
  },
  setup(props) {
    const requirementCache = useRequirementsCacheStore()
    const requirement = ref({ name: '' })
    const show_non_applicable = ref(true)
    const page = ref()

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
        return heading + `${children.requirement}\n`
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
      const result = formatRequirement(requirement.value.id, 1)
      const text = await result
      page.value = text
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
