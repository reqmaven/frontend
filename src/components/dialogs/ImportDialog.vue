<template>
  <q-dialog>
    <q-card style="width: 700px; max-width: 80vw" :loading="loading">
      <q-card-section>
        <div class="text-h6">Import</div>
      </q-card-section>

      <q-separator />

      <q-form method="post" enctype="multipart/form-data" class="q-gutter-md" @submit="onSubmit">
        <q-card-section style="max-height: 60vh" class="scroll">
          <q-file name="file" filled v-model="importer" label="Import data file" />
          <br />
          <q-linear-progress size="25px" :value="import_progress" color="accent">
            <div class="absolute-full flex flex-center">
              <q-badge color="white" text-color="accent" :label="progressLabel" />
            </div>
          </q-linear-progress>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Import" color="primary" type="submit" />
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, defineComponent } from 'vue'
import { api } from 'boot/axios'

export default defineComponent({
  name: 'ImportDialog',
  props: {
    url: {
      type: String,
    },
    params: {
      type: Object,
    },
  },
  setup(props) {
    const loading = ref()
    const importer = ref()
    const import_progress = ref()
    const progressLabel = ref()

    function onSubmit() {
      var formData = new FormData()
      for (let key in props.params) {
        formData.append(key, props.params[key])
      }

      formData.append('file', importer.value)
      api.post(props.url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    }

    return {
      loading,
      importer,

      import_progress,
      progressLabel,

      onSubmit,
    }
  },
})
</script>
