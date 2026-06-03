<script setup>
import { onMounted } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import AppTopbar from '@/components/AppTopbar.vue'
import { getIglesias } from '@/services/catalogos.service'
import {
  getIglesiaActivaId,
  iglesiaActivaNombre,
  setIglesiaActivaId,
} from '@/services/iglesia-activa.service'

onMounted(async () => {
  const activeId = getIglesiaActivaId()
  const iglesias = await getIglesias().catch(() => [])

  if (activeId) {
    const active = iglesias.find((iglesia) => String(iglesia.idIglesia) === String(activeId))
    if (active && !iglesiaActivaNombre.value) {
      setIglesiaActivaId(active.idIglesia, active.nombreIglesia)
    }
    return
  }

  if (iglesias[0]?.idIglesia) {
    setIglesiaActivaId(iglesias[0].idIglesia, iglesias[0].nombreIglesia)
  }
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
