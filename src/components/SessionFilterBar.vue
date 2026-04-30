<script setup lang="ts">
import { computed } from 'vue'

type FilterType = 'today' | 'month' | 'range'

const filterType = defineModel<FilterType>('filterType', { required: true })
const fromDate = defineModel<string>('fromDate', { required: true })
const toDate = defineModel<string>('toDate', { required: true })

defineProps<{
  loading: boolean
}>()

defineEmits<{
  fetch: []
}>()

const showRangeFields = computed(() => filterType.value === 'range')
</script>

<template>
  <section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div class="flex flex-col gap-3 md:flex-row md:items-end">
      <label class="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Date range
        <select
          v-model="filterType"
          class="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="today">Today</option>
          <option value="month">This month</option>
          <option value="range">Custom range</option>
        </select>
      </label>

      <div v-if="showRangeFields" class="grid gap-3 sm:grid-cols-2">
        <label class="flex flex-col gap-1 text-sm font-medium text-slate-700">
          From
          <input
            v-model="fromDate"
            type="date"
            class="h-10 rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label class="flex flex-col gap-1 text-sm font-medium text-slate-700">
          To
          <input
            v-model="toDate"
            type="date"
            class="h-10 rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>
      </div>

      <button
        type="button"
        :disabled="loading"
        class="h-10 rounded-md bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        @click="$emit('fetch')"
      >
        {{ loading ? 'Loading...' : 'Fetch sessions' }}
      </button>
    </div>
  </section>
</template>
