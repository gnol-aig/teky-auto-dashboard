<script setup lang="ts">
import { computed } from 'vue'
import type { Checkin, SessionDateTime } from '@/types'
import { useCheckinRules } from '@/composables/useCheckinRules'

const props = defineProps<{
  checkin: Checkin | null
  sessionDatetime: SessionDateTime | null
  loading: boolean
}>()

defineEmits<{
  checkin: []
}>()

const { canCheckinNow, getCheckinButtonClasses, getCheckinButtonLabel } = useCheckinRules()

const stateText = computed(() => {
  return getCheckinButtonLabel(props.checkin, props.sessionDatetime, props.loading)
})

const canCheckin = computed(() => canCheckinNow(props.checkin, props.sessionDatetime) && !props.loading)

const buttonClasses = computed(() => {
  return getCheckinButtonClasses(props.checkin, props.sessionDatetime)
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
