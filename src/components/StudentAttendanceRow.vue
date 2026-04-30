<script setup lang="ts">
import { computed } from 'vue'
import type { AttendanceStatus, Student } from '@/types'

const props = defineProps<{
  student: Student
  loading: boolean
}>()

defineEmits<{
  mark: [student: Student, status: AttendanceStatus]
}>()

const statusLabel = computed(() => {
  if (props.student.attendance_status === 'YES') return 'Present'
  if (props.student.attendance_status === 'NO') return 'Absent'

  return 'Unmarked'
})
</script>

<template>
  <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <p class="truncate font-semibold text-slate-950">{{ student.full_name }}</p>
        <div class="mt-1 flex flex-wrap gap-2 text-sm text-slate-500">
          <span>{{ student.student_status }}</span>
          <span class="text-slate-300">/</span>
          <span>{{ statusLabel }}</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 sm:w-40">
        <button
          type="button"
          :disabled="loading"
          class="rounded-md px-3 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          :class="student.attendance_status === 'YES' ? 'bg-emerald-700' : 'bg-gray-600 hover:bg-emerald-700'"
          @click="$emit('mark', student, 'YES')"
        >
          Yes
        </button>

        <button
          type="button"
          :disabled="loading"
          class="rounded-md px-3 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          :class="student.attendance_status === 'NO' ? 'bg-red-700' : 'bg-gray-600 hover:bg-red-700'"
          @click="$emit('mark', student, 'NO')"
        >
          No
        </button>
      </div>
    </div>
  </article>
</template>
