import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'boot/axios'

export const useReqTreeStore = defineStore('reqTreeStore', {
  state: () => ({ nodes: [] }),
  getters: {},
  actions: {
    getProjectIndex(project_id) {
      let i = 0
      project_id = 'p' + project_id
      for (let project of this.nodes) {
        if (project.id == project_id) {
          return i
        }
        i = i + 1
      }
      return -1
    },
    getRequirementSource(project_id, requirement_source_id) {
      let project_index = this.getProjectIndex(project_id)
      if (project_index != -1) {
        requirement_source_id = 's' + requirement_source_id
        let i = 0
        for (let req_source of this.nodes[project_index].children) {
          if (req_source.id == requirement_source_id) {
            return { proj_index: project_index, req_source_index: i }
          }
          i = i + 1
        }
      }
      return { proj_index: -1, req_source_index: -1 }
    },
    updateChildren(children, parent_id, tmp) {
      for (let req of children) {
        if (req.id == parent_id) {
          req.children = tmp
          return true
        } else if (req.children) {
          return this.updateChildren(req.children, parent_id, tmp)
        }
      }
      return false
    },
    deleteChildren(children, req_id) {
      let i = 0
      for (let req of children) {
        if (req.id == req_id) {
          children.splice(i, 1)
          return true
        } else if (req.children) {
          return this.deleteChildren(req.children, req_id)
        }
        i = i + 1
      }
      return false
    },
    async deleteProject(id) {
      let i = this.getProjectIndex(id)
      if (i != -1) {
        this.nodes.splice(i, 1)
      }
    },
    async deleteRequirementSource(project_id, requirement_source_id) {
      const { proj_index, req_source_index } = this.getRequirementSource(
        project_id,
        requirement_source_id,
      )
      if (proj_index != -1 && req_source_index != -1) {
        this.nodes[proj_index].children.splice(req_source_index, 1)
      }
    },
    async deleteRequirement(project_id, requirement_source_id, requirement_id) {
      const { proj_index, req_source_index } = this.getRequirementSource(
        project_id,
        requirement_source_id,
      )
      if (proj_index != -1 && req_source_index != -1) {
        let i = 0
        for (let req of this.nodes[proj_index].children[req_source_index].children) {
          if (req.id == requirement_id) {
            this.nodes[proj_index].children[req_source_index].children.splice(i, 1)
            break
          } else if (req.children) {
            if (this.deleteChildren(req.children, requirement_id)) {
              break
            }
          }
          i = i + 1
        }
      }
    },
    async refreshRequirementsSources(project_id) {
      let i = this.getProjectIndex(project_id)
      if (i != -1) {
        api.get(`/requirement-source/?page_size=1000&project=${project_id}`).then((response) => {
          let tmp = response.data.results
          for (let s in tmp) {
            tmp[s].lazy = true
            tmp[s].id = 's' + tmp[s].id
            if (tmp[s].applicability == 1 || tmp[s].applicability == 3) {
              tmp[s].icon = 'check'
            }
          }

          this.nodes[i].children = tmp
        })
      }
    },
    async refreshRequirementChildren(project_id, requirement_source_id, parent_id) {
      const { proj_index, req_source_index } = this.getRequirementSource(
        project_id,
        requirement_source_id,
      )
      if (proj_index != -1 && req_source_index != -1) {
        if (parent_id) {
          api.get(`/requirement-childrens/${parent_id}`).then((response) => {
            let tmp = response.data.children
            for (let s in tmp) {
              tmp[s].lazy = tmp[s].has_children
              if (tmp[s].applicability == 1 || tmp[s].applicability == 3) {
                tmp[s].icon = 'check'
              }
              if (tmp[s].type == 4 && tmp[s].requirement) {
                tmp[s].name = tmp[s].name + ' ' + tmp[s].requirement
              }
            }
            for (let req of this.nodes[proj_index].children[req_source_index].children) {
              if (req.id == parent_id) {
                req.children = tmp
                break
              } else if (req.children) {
                if (this.updateChildren(req.children, parent_id, tmp)) {
                  break
                }
              }
            }
          })
        } else {
          api
            .get(
              `/requirements/?page_size=1000&project=${project_id}&source_reference=${requirement_source_id}&parent__isnull=true`,
            )
            .then((response) => {
              let tmp = response.data.results
              for (let s in tmp) {
                tmp[s].lazy = tmp[s].has_children
                if (tmp[s].applicability == 1 || tmp[s].applicability == 3) {
                  tmp[s].icon = 'check'
                }
                if (tmp[s].type == 4 && tmp[s].requirement) {
                  tmp[s].name = tmp[s].name + ' ' + tmp[s].requirement
                }
              }

              this.nodes[proj_index].children[req_source_index].children = tmp
            })
        }
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useReqTreeStore, import.meta.hot))
}
