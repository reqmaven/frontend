<template>
  <q-card flat bordered>
    <q-card-section v-for="(task, i) in tasks.tasks" :key="i">
      <div>{{ tasks.tasks[i].data.progress.description }}</div>
      <div>Status: {{ tasks.tasks[i].data.state }}</div>
      <q-linear-progress
        size="25px"
        :value="tasks.tasks[i].data.progress.percent / 100"
        color="accent"
      >
        <div class="absolute-full flex flex-center">
          <q-badge
            color="white"
            text-color="accent"
            :label="tasks.tasks[i].data.progress.percent + '%'"
          />
        </div>
      </q-linear-progress>
    </q-card-section>
    <q-card-actions> </q-card-actions>
  </q-card>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useTasksStore } from 'stores/tasks'

export default {
  emits: [],
  props: {},
  setup() {
    const tasks = useTasksStore()
    const progress1 = ref(0.3)

    onMounted(() => {
      // get initial data from server (1st page)
    })

    return {
      tasks,
      progress1,
      progressLabel1: computed(() => (progress1.value * 100).toFixed(2) + '%'),
    }
  },
  components: {},
}
</script>
