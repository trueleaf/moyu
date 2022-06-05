import { $t } from "@/i18n/i18n";

export default [{
    name: $t("新增文件夹"),
    icon: "#iconxinzengwenjian",
    op: "addRootFolder",
    shortcut: [],
    pin: true,
}, {
    name: $t("新增文件"),
    icon: "#iconwenjian",
    op: "addRootFile",
    shortcut: [],
    pin: true,
}, {
    name: $t("刷新banner"),
    icon: "#iconshuaxin",
    op: "freshBanner",
    shortcut: [],
    pin: true,
    viewOnly: true,
}, {
    name: $t("全局设置"),
    icon: "#iconshezhi",
    op: "config",
    shortcut: ["Ctrl", ","],
    pin: true,
}, {
    name: $t("回收站"),
    icon: "#iconhuishouzhan",
    op: "recycler",
    shortcut: ["Ctrl", "Alt", "R"],
    pin: true,
}, {
    name: $t("在线链接"),
    icon: "#iconlink",
    op: "generateLink",
    shortcut: ["Ctrl", "L"],
    pin: false,
}, {
    name: $t("导出文档"),
    icon: "#icondaochu1",
    op: "exportDoc",
    shortcut: ["Ctrl", "E"],
    pin: false,
}, {
    name: $t("导入文档"),
    icon: "#icondaoru",
    op: "importDoc",
    shortcut: ["Ctrl", "I"],
    pin: false,
}, {
    name: $t("操作审计"),
    icon: "#iconlishi",
    op: "history",
    shortcut: ["Ctrl", "H"],
    pin: false,
    viewOnly: true,
}, {
    name: $t("生成代码"),
    icon: "#iconshengchengdaima",
    op: "hook",
    shortcut: ["Ctrl", "H"],
    pin: false,
    viewOnly: true,
}];
