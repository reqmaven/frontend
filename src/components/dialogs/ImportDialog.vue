<template>
  <q-dialog>
    <q-card style="width: 700px; max-width: 80vw" :loading="loading">
      <q-card-section>
        <div class="text-h6">Import</div>
      </q-card-section>

      <q-separator />

      <q-form method="post" enctype="multipart/form-data" class="q-gutter-md" @submit="onSubmit">
        <q-card-section style="max-height: 60vh" class="scroll">
          <q-file
            name="file"
            filled
            v-model="importer"
            label="Import data file"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Please select file']"
          />
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
import { useTasksStore } from 'stores/tasks'

export default defineComponent({
  name: 'ImportDialog',
  emits: ['onImport'],
  props: {
    url: {
      type: String,
    },
    params: {
      type: Object,
    },
  },
  setup(props, ctx) {
    const loading = ref()
    const importer = ref()
    const tasks = useTasksStore()

    function onSubmit() {
      var formData = new FormData()
      for (let key in props.params) {
        formData.append(key, props.params[key])
      }

      formData.append('file', importer.value)
      api
        .post(props.url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          tasks.addTask(response.data.task_id)
          ctx.emit('onUpdated')
        })
    }

    return {
      loading,
      importer,

      onSubmit,
    }
  },
})
</script>
