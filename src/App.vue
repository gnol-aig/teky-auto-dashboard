<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive include="DashboardView">
      <component
        :is="Component"
        v-if="route.name === 'dashboard'"
      />
    </keep-alive>

    <component
      :is="Component"
      v-if="route.name !== 'dashboard'"
    />
  </router-view>
</template>

<style scoped>
</style>
