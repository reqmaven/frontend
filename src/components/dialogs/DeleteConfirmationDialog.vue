<template>
    <q-dialog>
        <q-card style="width: 700px; max-width: 80vw;">
            <q-card-section>
                <div class="text-h6">{{ title }}</div>
            </q-card-section>
            <q-separator />
        
            <q-card-section>
              <slot name="message"></slot>            
            </q-card-section>
            <q-card-actions align="right" class="bg-white text-teal">
                <q-btn flat label="Cancel" v-close-popup />
                <q-btn flat label="Delete" color="red" type="submit" @click="ondelete"/>
            </q-card-actions>
            
        </q-card>
    </q-dialog>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DeleteConfirmationDialog',
  props: {
    title: {
      type: String,
      required: true
    },
    ondelete: {
      type: Function    
    }
  }
})
</script>