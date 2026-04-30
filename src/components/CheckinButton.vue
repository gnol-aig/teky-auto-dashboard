<script setup lang="ts">
import { computed } from 'vue'
import type { Checkin } from '@/types'

const props = defineProps<{
  checkin: Checkin | null
  loading: boolean
}>()

defineEmits<{
  checkin: []
}>()

const stateText = computed(() => {
  switch (props.checkin?.state) {
    case 'MISSED':
      return 'Missed check-in'
    case 'NO_INFO':
      return 'Check-in unavailable'
    case 'INTIME':
      return 'Checked in on time'
    case 'LATE':
      return 'Checked in late'
    case 'AVAILABLE':
      return 'Check in now'
    default:
      return 'Loading check-in'
  }
})

const canCheckin = computed(() => props.checkin?.state === 'AVAILABLE' && !props.loading)

const buttonClasses = computed(() => {
  switch (props.checkin?.state) {
    case 'MISSED':
      return 'bg-red-50 text-red-700 ring-red-200'
    case 'NO_INFO':
      return 'bg-slate-100 text-slate-600 ring-slate-200'
    case 'INTIME':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    case 'LATE':
      return 'bg-amber-50 text-amber-700 ring-amber-200'
    case 'AVAILABLE':
      return 'bg-blue-600 text-white ring-blue-600 hover:bg-blue-700'
    default:
      return 'bg-slate-100 text-slate-500 ring-slate-200'
  }
})
</script>

<template>
  <button
    type="button"
    :disabled="!canCheckin"
    class="inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold shadow-sm ring-1 ring-inset transition disabled:cursor-not-allowed"
    :class="[buttonClasses, { 'opacity-70': loading }]"
    @click="$emit('checkin')"
  >
    {{ loading ? 'Checking in...' : stateText }}
  </button>
</template>
