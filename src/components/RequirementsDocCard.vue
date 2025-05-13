<template>
  <q-markdown :src="page" />
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { api } from 'boot/axios'

export default {
  name: 'RequirementsDocCard',
  props: {
    id: Number,
  },
  setup(props) {
    const requirement = ref({ name: '' })
    const page = ref()

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
    }
  },
}
</script>
