<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import SessionCard from '@/components/SessionCard.vue'
import SessionFilterBar from '@/components/SessionFilterBar.vue'
import { useApi } from '@/composables/useApi'
import { useSessionDate } from '@/composables/useSessionDate'
import type { Session } from '@/types'

type FilterType = 'today' | 'month' | 'range'

const router = useRouter()
const api = useApi()
const { formatInputDate, getPresetDateRange } = useSessionDate()

const sessions = ref<Session[]>([])
const loading = ref(false)
const errorMessage = ref('')
const hasFetched = ref(false)

const filterType = ref<FilterType>('today')
const fromDate = ref('')
const toDate = ref('')

const dateRange = computed(() => {
  if (filterType.value !== 'range') {
    return getPresetDateRange(filterType.value)
  }

  return {
    from: formatInputDate(fromDate.value),
    to: formatInputDate(toDate.value),
  }
})

const emptyMessage = computed(() => {
  if (!hasFetched.value || loading.value || sessions.value.length > 0) return ''

  return 'There are no classes for the selected time.'
})

const fetchSessions = async () => {
  loading.value = true
  errorMessage.value = ''
  hasFetched.value = true

  try {
    sessions.value = await api.getSessions(dateRange.value.from, dateRange.value.to)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not load sessions.'
    sessions.value = []
  } finally {
    loading.value = false
  }
}

const goToSession = (sessionId: number) => {
  router.push(`/dashboard/sessions/${sessionId}`)
}

const handleLogout = () => {
  api.clearStoredToken()
  router.replace('/login')
}
</script>

<template>
  <main class="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-5xl space-y-6">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex flex-col gap-1">
          <p class="text-sm font-medium uppercase tracking-wide text-blue-700">Dashboard</p>
          <h1 class="text-2xl font-bold tracking-tight text-slate-950">Class sessions</h1>
        </div>

        <button
          type="button"
          class="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
          @click="handleLogout"
        >
          Logout
        </button>
      </header>

      <SessionFilterBar
        v-model:filter-type="filterType"
        v-model:from-date="fromDate"
        v-model:to-date="toDate"
        :loading="loading"
        @fetch="fetchSessions"
      />

      <p v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ errorMessage }}
      </p>

      <div v-if="loading" class="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        Loading sessions...
      </div>

      <div v-else-if="emptyMessage" class="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        {{ emptyMessage }}
      </div>

      <section v-else class="grid gap-4">
        <SessionCard
          v-for="session in sessions"
          :key="session.session_id"
          :session="session"
          @open="goToSession"
        />
      </section>
    </div>
  </main>
</template>
