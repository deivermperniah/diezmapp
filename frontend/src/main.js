import { createApp } from 'vue'
import ConfirmationService from 'primevue/confirmationservice'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Aura from '@primeuix/themes/aura'
import Button from 'primevue/button'
import Card from 'primevue/card'
import ConfirmDialog from 'primevue/confirmdialog'
import DatePicker from 'primevue/datepicker'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Menu from 'primevue/menu'
import Select from 'primevue/select'
import Skeleton from 'primevue/skeleton'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import Toolbar from 'primevue/toolbar'

import 'primeicons/primeicons.css'
import './styles/base.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false,
    },
  },
  locale: {
    firstDayOfWeek: 1,
    dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
    dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
    monthNames: [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ],
    monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
    today: 'Hoy',
    clear: 'Limpiar',
    weekHeader: 'Sem',
    emptySearchMessage: 'No se encontraron resultados',
    emptyFilterMessage: 'No se encontraron resultados',
    emptyMessage: 'Sin registros disponibles',
  },
})
app.use(ToastService)
app.use(ConfirmationService)
app.component('PButton', Button)
app.component('PCard', Card)
app.component('PConfirmDialog', ConfirmDialog)
app.component('PDatePicker', DatePicker)
app.component('PDialog', Dialog)
app.component('PInputNumber', InputNumber)
app.component('PInputText', InputText)
app.component('PMenu', Menu)
app.component('PSelect', Select)
app.component('PSkeleton', Skeleton)
app.component('PTag', Tag)
app.component('PToast', Toast)
app.component('PToolbar', Toolbar)

app.mount('#app')
