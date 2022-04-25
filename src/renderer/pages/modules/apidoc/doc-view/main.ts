import { createApp } from "vue"
import { ElCheckbox, ElCheckboxGroup, ElSwitch, ElTable, ElTableColumn, ElImage, ElDatePicker, ElEmpty, ElBadge, ElOption, ElSelect, ElDropdown, ElDropdownItem, ElButton, ElLoading, ElTooltip, ElInput, ElTree, ElDialog, ElTabs, ElPopover, ElRadio, ElRadioGroup, ElDivider, ElTabPane } from "element-plus";
import "element-plus/dist/index.css"
import "@/../../public/font/iconfont"
import "@/../../public/font/iconfont.css"
import "@/assets/css/index.css"
import registeDirective from "@/directive/directive";
import i18n from "@/i18n/i18n"

//=====================================内部组件按需加载====================================//
import sLoading from "@/components/common/loading/g-loading.vue"
import sResizeX from "@/components/common/resize/g-resize-x.vue"
import sResizeY from "@/components/common/resize/g-resize-y.vue"
import sEmphasizeContent from "@/components/common/emphasize/g-emphasize.vue"
import sEllipsis from "@/components/common/ellipsis-content/g-ellipsis-content.vue"
import sFieldset from "@/components/common/fieldset/g-fieldset.vue"
import sValidInput from "@/components/common/valid-input/g-valid-input.vue"
import sDownload from "@/components/common/download/g-download.vue"
import sLabelValue from "@/components/common/label-value/g-label-value.vue"
import sContextmenu from "@/components/common/contextmenu/g-contextmenu.vue"
import sContextmenuItem from "@/components/common/contextmenu/g-contextmenu-item.vue"
import sDialog from "@/components/common/dialog/g-dialog.vue"
import sParamsTree from "@/components/apidoc/params-tree/g-params-tree.vue"
import sParamsView from "@/components/apidoc/params-view/g-params-view.vue"
import sRawEditor from "@/components/apidoc/raw-editor/g-raw-editor.vue"
import sMock from "@/components/apidoc/mock/g-mock.vue"
import router from "./router/index"
import { store, key } from "./store/index"
import { axiosPlugin } from "./api/api"
import App from "./App.vue"
//=========================================================================//
const app = createApp(App)

//组件注册
app.component("SLoading", sLoading);
app.component("SResizeX", sResizeX);
app.component("SResizeY", sResizeY);
app.component("SEmphasize", sEmphasizeContent);
app.component("SFieldset", sFieldset);
app.component("SLabelValue", sLabelValue);
app.component("SParamsTree", sParamsTree);
app.component("SParamsView", sParamsView);
app.component("SRawEditor", sRawEditor);
app.component("SEllipsisContent", sEllipsis);
app.component("SContextmenu", sContextmenu);
app.component("SDownload", sDownload);
app.component("SContextmenuItem", sContextmenuItem);
app.component("SValidInput", sValidInput);
app.component("SMock", sMock);
app.component("SDialog", sDialog);
//=====================================elementui按需加载====================================//
app.use(ElButton);
app.use(ElLoading);
app.use(ElTooltip);
app.use(ElInput);
app.use(ElTree);
app.use(ElDialog);
app.use(ElTabs);
app.use(ElPopover);
app.use(ElRadio);
app.use(ElRadioGroup);
app.use(ElDivider);
app.use(ElTabPane);
app.use(ElSwitch);
app.use(ElCheckbox);
app.use(ElCheckboxGroup);
app.use(ElDatePicker);
app.use(ElBadge);
app.use(ElOption);
app.use(ElSelect);
app.use(ElDropdown);
app.use(ElDropdownItem);
app.use(ElEmpty);
app.use(ElImage);
app.use(ElTable);
app.use(ElTableColumn);

//=========================================================================//
registeDirective(app); //注册全局指令
app.use(store, key);

app.use(router);
app.use(axiosPlugin);
app.use(i18n)
app.mount("#app")
