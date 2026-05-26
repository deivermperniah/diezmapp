import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ConfirmationService from 'primevue/confirmationservice'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Aura from '@primeuix/themes/aura'
import Button from 'primevue/button'
import Card from 'primevue/card'
import ConfirmDialog from 'primevue/confirmdialog'
import FloatLabel from 'primevue/floatlabel'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Toast from 'primevue/toast'
import Toolbar from 'primevue/toolbar'

import 'primeicons/primeicons.css'
import './styles/base.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false,
    },
  },
})
app.use(ToastService)
app.use(ConfirmationService)
app.component('PButton', Button)
app.component('PCard', Card)
app.component('PConfirmDialog', ConfirmDialog)
app.component('PFloatLabel', FloatLabel)
app.component('PInputNumber', InputNumber)
app.component('PInputText', InputText)
app.component('PSelect', Select)
app.component('PToast', Toast)
app.component('PToolbar', Toolbar)

app.mount('#app')
