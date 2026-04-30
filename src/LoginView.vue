<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FormField from '@/components/FormField.vue'
import { useApi } from '@/composables/useApi'
import type { FieldErrors } from '@/types'

const router = useRouter()
const route = useRoute()
const api = useApi()

const mobileNumber = ref('')
const password = ref('')
const errors = ref<FieldErrors>({})
const errorMessage = ref('')
const isLoading = ref(false)
const isSuccess = ref(false)

const formDisabled = computed(() => isLoading.value || isSuccess.value)
const submitLabel = computed(() => {
  if (isSuccess.value) return 'Signed in'
  if (isLoading.value) return 'Signing in...'

  return 'Sign in'
})

const resetMessages = () => {
  errors.value = {}
  errorMessage.value = ''
  isSuccess.value = false
}

const handleSubmit = async () => {
  resetMessages()
  isLoading.value = true

  try {
    const result = await api.login({
      mobile_number: mobileNumber.value,
      password: password.value,
    })

    if (!result.success) {
      errorMessage.value = result.message || 'Login failed.'
      errors.value = result.errors
      return
    }

    api.setStoredToken(result.token)
    isSuccess.value = true

    window.setTimeout(() => {
      const redirect =
        typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
          ? route.query.redirect
          : '/dashboard'
      router.replace(redirect)
    }, 600)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Network error. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-950">
    <section class="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div class="mb-8 text-center">
        <p class="text-sm font-medium uppercase tracking-wide text-blue-700">Tutoro</p>
        <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-950">Sign in</h1>
      </div>

      <div
        v-if="isSuccess"
        class="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
      >
        Login successful. Redirecting...
      </div>

      <form class="space-y-5" :class="{ 'opacity-70': formDisabled }" @submit.prevent="handleSubmit">
        <p v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ errorMessage }}
        </p>

        <FormField
          v-model="mobileNumber"
          id="mobile_number"
          label="Mobile number"
          :disabled="formDisabled"
          :error="errors.mobile_number?.[0]"
        />

        <FormField
          v-model="password"
          id="password"
          label="Password"
          type="password"
          :disabled="formDisabled"
          :error="errors.password?.[0]"
        />

        <button
          type="submit"
          :disabled="formDisabled"
          class="flex h-10 w-full items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {{ submitLabel }}
        </button>
      </form>
    </section>
  </main>
</template>
