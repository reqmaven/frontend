<template>
  <div class="q-pa-md row justify-center">
    <div style="width: 100%">
      <div v-for="message in messages" :key="message.id">
        <q-chat-message
          :name="message.name"
          :avatar="message.avatar"
          :sent="message.sent"
          :text="message.text"
        />
      </div>
    </div>
  </div>
  <div class="row">
    <q-input class="col-11" type="textarea" v-model="newMessageText" autofocus autogrow filled />
    <q-btn
      class="col-1"
      flat
      label="Send"
      color="negative"
      :disable="!newMessageText"
      @click="newMessage"
    />
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { useUsersStore } from 'stores/users'

export default {
  name: 'CommentsCard',
  props: {
    id: Number,
  },
  setup(props) {
    const $q = useQuasar()
    const users_store = useUsersStore()
    const newMessageText = ref()
    const messages = ref([])

    function newMessage() {
      const data = {
        requirement: props.id,
        text: newMessageText.value,
      }
      api
        .post('/message/', data)
        .then(() => {
          newMessageText.value = null
          loadInitialData()
        })
        .catch(() => {
          $q.notify({
            color: 'negative',
            position: 'top',
            message: 'Unable to send message',
            icon: 'report_problem',
          })
        })
    }

    function loadInitialData() {
      if (props.id) {
        api.get(`/message/?requirement=${props.id}`).then((response) => {
          messages.value = []
          let previous_created_by = null
          for (const msg of response.data.results) {
            if (previous_created_by === msg.created_by) {
              messages.value.at(-1).text.push(msg.text)
            } else {
              messages.value.push({
                name: users_store.getUserById(msg.created_by).username,
                // avatar: users_store.getUserById(msg.created_by).avatar,
                text: [msg.text],
                sent: msg.created_by == users_store.me.id,
                id: msg.id,
              })
            }
            previous_created_by = msg.created_by
          }
        })
      }
    }

    watch(
      () => props.id,
      () => {
        loadInitialData()
      },
    )

    onMounted(() => {
      loadInitialData()
    })

    return {
      newMessageText,
      messages,

      newMessage,
    }
  },
}
</script>
