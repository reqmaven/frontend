<template>
  <q-timeline color="secondary">
    <q-timeline-entry
      v-for="(item, index) in history_items"
      :key="index"
      v-bind="history_items[index]"
    >
    </q-timeline-entry>
  </q-timeline>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { api } from 'boot/axios'
import { useUsersStore } from 'stores/users'

export default {
  name: 'HistoryCard',
  props: {
    id: Number,
  },
  setup(props) {
    const users_store = useUsersStore()
    const history_items = ref([])

    function create_history_item_body(previous, current) {
      if (!previous) {
        return current.requirement
      } else {
        const fields = {
          applicability: 'Applicability',
          applicability_comment: 'Applicability Comment',
          type: 'Requirement Type',
          requirement: 'Requirement',
          notes: 'Notes',
        }
        let text = ''
        for (let key in fields) {
          if (previous[key] !== current[key]) {
            text = text + ' Updated ' + fields[key] + ': ' + current[key] + ';'
          }
        }
        return text
      }
    }

    function process_history(history) {
      const actions = { '+': 'Created', '~': 'Edited' }

      let tmp_history = []
      let prev = null
      for (const item of history.reverse()) {
        tmp_history.push({
          title:
            actions[item.history_type] +
            ' by ' +
            users_store.getUserById(item.history_user_id).username,
          subtitle: item.history_date,
          body: create_history_item_body(prev, item),
        })
        prev = item
      }

      history_items.value = tmp_history.reverse()
    }

    function loadData() {
      if (props.id) {
        api.get(`/requirements/${props.id}`).then((response) => {
          process_history(response.data.history)
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
      history_items,
    }
  },
}
</script>
