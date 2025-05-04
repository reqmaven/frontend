<template>
  <q-btn color="primary" label="Create project" @click="show_create_project_dialog = true" />
  <q-tree
    :nodes="lazy"
    default-expand-all
    node-key="id"
    label-key="name"
    @lazy-load="onLazyLoad"
    @update:selected="onUpdateSelected"
    selected-color="primary"
    v-model:selected="selected"
    no-selection-unset
    dense
  />
  <ProjectEditCreateDialog
    v-model="show_create_project_dialog"
    @onCreated="onProjectCreated"
  ></ProjectEditCreateDialog>
</template>

<script>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useRouter } from 'vue-router'
import ProjectEditCreateDialog from 'components/dialogs/ProjectEditCreateDialog.vue'

export default {
  setup() {
    const nodes = ref([])
    const selected = ref(null)
    const router = useRouter()
    const show_create_project_dialog = ref(false)

    function onUpdateSelected(target) {
      if (target[0] == 'p') {
        router.push({ path: `/project/${target.substring(1)}` })
      } else if (target[0] == 's') {
        router.push({ path: `/requirement-source/${target.substring(1)}` })
      } else {
        router.push({ path: `/requirement/${target}` })
      }
    }

    function onProjectCreated() {
      show_create_project_dialog.value = false
      loadInitialTree()
    }

    function loadInitialTree() {
      api.get('/project/').then((response) => {
        nodes.value = response.data.results
        for (let p in nodes.value) {
          nodes.value[p].id = 'p' + nodes.value[p].id
          nodes.value[p].lazy = true
        }
      })
    }

    function loadRequirementSourceForProject(node, done) {
      api
        .get(`/requirement-source/?page_size=1000&project=${node.id.substring(1)}`)
        .then((response) => {
          let tmp = response.data.results
          for (let s in tmp) {
            tmp[s].lazy = true
            tmp[s].id = 's' + tmp[s].id
          }
          done(tmp)
        })
    }

    function loadFirstStageRequirement(node, done) {
      api
        .get(
          `/requirements/?page_size=1000&project=${node.project}&source_reference=${node.id.substring(1)}&parent__isnull=true`,
        )
        .then((response) => {
          let tmp = response.data.results
          for (let s in tmp) {
            tmp[s].lazy = true
          }
          done(tmp)
        })
    }

    function loadRequirementsChildren(node, done) {
      api.get(`/requirement-childrens/${node.id}`).then((response) => {
        let tmp = response.data.children
        for (let s in tmp) {
          tmp[s].lazy = true
        }
        done(tmp)
      })
    }

    /*eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }]*/
    function onLazyLoad({ node, _key, done, _fail }) {
      // call fail() if any error occurs
      if (node.id[0] == 'p') {
        loadRequirementSourceForProject(node, done)
      } else if (node.id[0] == 's') {
        loadFirstStageRequirement(node, done)
      } else {
        loadRequirementsChildren(node, done)
      }
    }

    onMounted(() => {
      loadInitialTree()
    })

    return {
      lazy: ref(nodes),
      selected,
      show_create_project_dialog,

      onProjectCreated,
      onUpdateSelected,
      onLazyLoad,
    }
  },
  components: { ProjectEditCreateDialog },
}
</script>
