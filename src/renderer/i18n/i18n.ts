import { App, ref, Ref } from "vue";
import { Language } from "@@/global";
import zhCn from "./zh-cn"
import zhTw from "./zh-tw"
import en from "./en"

//=========================================================================//
let localLanguage = localStorage.getItem("language") as (Language | null);
if (!localLanguage) {
    localLanguage = "zh-cn";
} else if (localLanguage !== "en" && localLanguage !== "ja" && localLanguage !== "zh-cn" && localLanguage !== "zh-tw") {
    localLanguage = "zh-cn";
}
const languageType: Ref<Language> = ref(localLanguage);
//=========================================================================//
export const $t = (str: string): string => {
    const cnValue = (zhCn as Record<string, string>)[str];
    if (languageType.value === "zh-cn") {
        return (zhCn as Record<string, string>)[str];
    }
    if (languageType.value === "zh-tw") {
        return (zhTw as Record<string, string>)[str] || cnValue;
    }
    if (languageType.value === "en") {
        return (en as Record<string, string>)[str] || cnValue;
    }
    return cnValue;
}
export default {
    install(app: App): void {
        app.config.globalProperties.$t = $t;
    },
}
//改变当前语言
export const changeLanguage = (type: Language): void => {
    languageType.value = type;
    localStorage.setItem("language", type);
}
