<script setup lang="ts">
import { computed } from 'vue'
import { useSessionDate } from '@/composables/useSessionDate'
import type { Session } from '@/types'

const props = defineProps<{
  session: Session
}>()

defineEmits<{
  open: [sessionId: number]
}>()

const { formatSessionDateTime } = useSessionDate()

const scheduleText = computed(() => formatSessionDateTime(props.session.datetime))

</script>

<template>
  <article
    class="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
  >
    <button type="button" class="block w-full text-left" @click="$emit('open', session.session_id)">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
          <h2 class="truncate text-base font-semibold text-slate-950 group-hover:text-blue-700">
            {{ session.class_name }}
          </h2>
          <p class="mt-1 text-sm text-slate-500">{{ session.class_code }}</p>
        </div>

        <span class="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {{ session.session_type }}
        </span>
      </div>

      <div class="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
        <p class="min-w-0 truncate">
          <span class="font-medium text-slate-800">Chapter:</span>
          {{ session.session_chapter }}
        </p>
        <p>
          <span class="font-medium text-slate-800">Students:</span>
          {{ session.students_number }}
        </p>
        <p class="sm:text-right">
          {{ scheduleText }}
        </p>
      </div>
    </button>
  </article>
</template>
