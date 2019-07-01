import Vue from 'vue'
import {
  Aside,
  Button,
  Checkbox,
  Container,
  Collapse,
  CollapseItem,
  DatePicker,
  Dialog,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Footer,
  Form,
  FormItem,
  Header,
  Input,
  Image,
  Loading,
  Main,
  Menu,
  MenuItem,
  Pagination,
  Progress,
  Option,
  Radio,
  RadioGroup,
  Select,
  Submenu,
  Steps,
  Step,
  Tabs,
  TabPane,
  Table,
  TableColumn,
  Tag
} from 'element-ui'
import en from 'element-ui/lib/locale/lang/en'
import locale from 'element-ui/lib/locale'

locale.use(en)

Vue.use(Button)
Vue.use(Loading)

Vue.use(Collapse)
Vue.use(CollapseItem)

Vue.use(Dropdown)
Vue.use(DropdownMenu)
Vue.use(DropdownItem)

Vue.use(Progress)
Vue.use(Pagination)

Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(Submenu)

Vue.use(Container)
Vue.use(Footer)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)

Vue.use(Steps)
Vue.use(Step)

Vue.use(Tabs)
Vue.use(TabPane)

Vue.use(Table)
Vue.use(TableColumn)

Vue.use(Tag)

Vue.use(Form)
Vue.use(FormItem)
Vue.use(Select)
Vue.use(Option)
Vue.use(Input)
Vue.use(DatePicker)

Vue.use(Radio)
Vue.use(RadioGroup)

Vue.use(Checkbox)

Vue.use(Dialog)

Vue.use(Image)
