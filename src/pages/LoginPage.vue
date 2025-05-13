<template>
  <q-page class="row justify-center">
    <div class="column">
      <h5 class="text-h6 text-center full-width">Sign In</h5>

      <q-card square bordered>
        <q-card-section>
          <q-form class="q-gutter-md">
            <q-input square filled clearable v-model="email" type="email" label="email" />
            <q-input square filled clearable v-model="password" type="password" label="password" />
          </q-form>
        </q-card-section>
        <q-card-actions class="q-px-md">
          <q-btn
            unelevated
            color="primary"
            size="lg"
            class="full-width"
            label="Login"
            @click="authenticate"
          />
        </q-card-actions>
        <q-card-section class="text-center q-pa-none">
          <p class="text-grey-6">Not reigistered? Created an Account</p>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { useUsersStore } from 'stores/users'

export default {
  name: 'LoginPage',
  data() {
    const router = useRouter()
    const $q = useQuasar()
    const users_store = useUsersStore()
    const email = ref('')
    const password = ref('')

    function authenticate() {
      api
        .post('api-token-auth/', {
          username: email.value,
          password: password.value,
        })
        .then((response) => {
          $q.localStorage.set('token', response.data.token)
          api.defaults.headers.common['Authorization'] = 'Token ' + response.data.token

          users_store.fetchData()

          router.push({ path: '/' })
        })
        .catch(() => {
          password.value = ''

          $q.notify({
            color: 'negative',
            position: 'top',
            message: 'Login incorrect',
            icon: 'report_problem',
          })
        })
    }
    return {
      email,
      password,

      authenticate,
    }
  },
}
</script>
