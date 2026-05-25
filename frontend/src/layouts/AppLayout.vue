<script setup>
import AppSidebar from '@/components/AppSidebar.vue'
import AppTopbar from '@/components/AppTopbar.vue'
</script>

<template>
  <div class="app-shell">
    <AppSidebar />
    <div class="main-shell">
      <AppTopbar />
      <main class="content-shell">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.main-shell {
  min-height: 100vh;
  margin-left: var(--sidebar-width);
}

.content-shell {
  padding: 28px 30px 40px;
}

@media (max-width: 860px) {
  .main-shell {
    margin-left: 0;
  }

  .content-shell {
    padding: 20px 18px 32px;
  }
}
</style>
