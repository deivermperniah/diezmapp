import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ConfirmationService from 'primevue/confirmationservice'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Aura from '@primeuix/themes/aura'
import Button from 'primevue/button'
import Breadcrumb from 'primevue/breadcrumb'
import Card from 'primevue/card'
import ConfirmDialog from 'primevue/confirmdialog'
import DatePicker from 'primevue/datepicker'
import Dialog from 'primevue/dialog'
import FloatLabel from 'primevue/floatlabel'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import PanelMenu from 'primevue/panelmenu'
import Popover from 'primevue/popover'
import ProgressSpinner from 'primevue/progressspinner'
import Select from 'primevue/select'
import Skeleton from 'primevue/skeleton'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
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
app.component('PBreadcrumb', Breadcrumb)
app.component('PButton', Button)
app.component('PCard', Card)
app.component('PConfirmDialog', ConfirmDialog)
app.component('PDatePicker', DatePicker)
app.component('PDialog', Dialog)
app.component('PFloatLabel', FloatLabel)
app.component('PInputNumber', InputNumber)
app.component('PInputText', InputText)
app.component('PPanelMenu', PanelMenu)
app.component('PPopover', Popover)
app.component('PProgressSpinner', ProgressSpinner)
app.component('PSelect', Select)
app.component('PSkeleton', Skeleton)
app.component('PTag', Tag)
app.component('PTextarea', Textarea)
app.component('PToast', Toast)
app.component('PToolbar', Toolbar)

app.mount('#app')
