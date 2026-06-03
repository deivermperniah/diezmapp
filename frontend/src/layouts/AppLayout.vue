<script setup>
import { onMounted } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import AppTopbar from '@/components/AppTopbar.vue'
import { getIglesias } from '@/services/catalogos.service'
import {
  getIglesiaActivaId,
  iglesiaActivaNombre,
  setIglesiaActivaReady,
  setIglesiaActivaId,
} from '@/services/iglesia-activa.service'

onMounted(async () => {
  const activeId = getIglesiaActivaId()
  const iglesias = await getIglesias().catch(() => [])
  const fallback = iglesias[0] || null

  if (activeId) {
    const active = iglesias.find((iglesia) => String(iglesia.idIglesia) === String(activeId))
    if (active) {
      setIglesiaActivaId(active.idIglesia, active.nombreIglesia || iglesiaActivaNombre.value)
      setIglesiaActivaReady()
      return
    }

    if (fallback) {
      setIglesiaActivaId(fallback.idIglesia, fallback.nombreIglesia)
    } else {
      setIglesiaActivaId('')
    }
    setIglesiaActivaReady()
    return
  }

  if (fallback?.idIglesia) {
    setIglesiaActivaId(fallback.idIglesia, fallback.nombreIglesia)
  }
  setIglesiaActivaReady()
})
</script>

<template>
  <div class="app-shell">
    <PToast position="top-right" />
    <PConfirmDialog />
    <AppSidebar />
    <div class="main-shell">
      <AppTopbar />
      <main class="content-shell">
        <RouterView v-slot="{ Component, route }">
          <KeepAlive>
            <component :is="Component" v-if="route.meta.keepAlive" :key="route.name" />
          </KeepAlive>
          <component :is="Component" v-if="!route.meta.keepAlive" :key="route.fullPath" />
        </RouterView>
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
