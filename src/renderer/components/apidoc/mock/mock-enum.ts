/**
 * @description        mock数据
 * @author             shuxiaokai
 * @create             2021-04-29 21:50
 */
import { $t } from "@/i18n/i18n";

export default [
    //=====================================中文文本====================================//
    {
        name: $t("中文名称"),
        value: "cname",
        tags: [$t("常用"), $t("中文文本")],
    },
    {
        name: $t("中文单词"),
        value: "cword",
        tags: [$t("中文文本")],
    },
    {
        name: $t("中文句子"),
        value: "csentence",
        tags: [$t("中文文本")],
    },
    {
        name: $t("中文段落"),
        value: "cparagraph",
        tags: [$t("中文文本")],
    },
    {
        name: $t("中文标题"),
        value: "ctitle",
        tags: [$t("中文文本")],
    },
    //=====================================英文文本====================================//
    {
        name: $t("英文名称"),
        value: "name",
        tags: [$t("英文文本")],
    },
    {
        name: $t("英文段落"),
        value: "paragraph",
        tags: [$t("英文文本")],
    },
    {
        name: $t("英文句子"),
        value: "sentence",
        tags: [$t("英文文本")],
    },
    {
        name: $t("英文单词"),
        value: "word",
        tags: [$t("英文文本")],
    },
    {
        name: $t("英文标题"),
        value: "title",
        tags: [$t("英文文本")],
    },
    //=====================================布尔值====================================//
    {
        name: $t("布尔值"),
        value: "boolean",
        tags: [$t("常用")],
    },
    //=====================================数字====================================//
    {
        name: $t("自然数(0,1,2,3,4)"),
        value: "natural",
        tags: [$t("数字")],
    },
    {
        name: $t("自然数(大于100)"),
        value: "natural(100)",
        tags: [$t("数字")],
    },
    {
        name: $t("自然数(大于100小于200)"),
        value: "natural(100,200)",
        tags: [$t("数字")],
    },
    {
        name: $t("整数(-22,1,23)"),
        value: "int",
        tags: [$t("数字")],
    },
    {
        name: $t("整数(大于100)"),
        value: "int(100)",
        tags: [$t("数字")],
    },
    {
        name: $t("整数(大于100小于200)"),
        value: "int(100,200)",
        tags: [$t("数字")],
    },
    {
        name: $t("浮点数"),
        value: "float",
        tags: [$t("数字")],
    },
    //=========================================================================//
    {
        name: $t("字符串"),
        value: "string",
        tags: [$t("英文文本")],
    },
    {
        name: $t("字符串(长度为5)"),
        value: "string(5)",
        tags: [$t("常用"), $t("英文文本")],
    },
    //=====================================日期时间====================================//
    {
        name: $t("时间戳(精确到毫秒13位)"),
        value: "timestamp",
        tags: [$t("常用"), $t("日期/时间")],
    },
    {
        name: $t("时间戳(精确到秒10位)"),
        value: "timestamp2",
        tags: [$t("常用"), $t("日期/时间")],
    },
    {
        name: $t("开始时间，可接受两个可选参数startTime('2022-xx-xx', 'YYYY-MM-DD')"),
        value: "startTime",
        tags: [$t("常用"), $t("日期/时间")],
    },
    {
        name: $t("结束时间(结束时间晚于开始时间)"),
        value: "endTime",
        tags: [$t("常用"), $t("日期/时间")],
    },

    {
        name: $t("日期(年月日)"),
        value: "date",
        tags: [$t("日期/时间")],
    },
    {
        name: $t("时间(时分秒)"),
        value: "time",
        tags: [$t("日期/时间")],
    },
    {
        name: $t("日期时间"),
        value: "datetime",
        tags: [$t("日期/时间")],
    },
    {
        name: $t("当前日期时间"),
        value: "now",
        tags: [$t("常用"), $t("日期/时间")],
    },
    //=====================================颜色====================================//
    {
        name: $t("颜色(#ff6600)"),
        value: "color",
        tags: [$t("颜色")],
    },
    {
        name: $t("颜色(#ff6600)"),
        value: "hex",
        tags: [$t("颜色")],
    },
    {
        name: $t("颜色(rgb(122,122,122))"),
        value: "rgb",
        tags: [$t("颜色")],
    },
    {
        name: $t("颜色rgb(122,122,122, 0.3)"),
        value: "rgba",
        tags: [$t("颜色")],
    },
    {
        name: $t("颜色hsl(222, 11, 31)"),
        value: "hsl",
        tags: [$t("颜色")],
    },
    //=====================================图片====================================//
    {
        name: $t("图片"),
        value: "image",
        tags: [$t("图片")],
    },
    {
        name: $t("图片(150x100)"),
        value: "image(150,100)",
        tags: [$t("图片"), $t("常用")],
    },
    {
        name: $t("base64图片数据"),
        value: "dataImage",
        tags: [$t("图片")],
    },
    {
        name: $t("base64图片数据100x100"),
        value: "dataImage(100x100)",
        tags: [$t("图片"), $t("常用")],
    },

    {
        name: $t("省"),
        value: "province",
        tags: [$t("地区相关")],
    },
    {
        name: $t("市"),
        value: "city",
        tags: [$t("地区相关")],
    },
    {
        name: $t("区"),
        value: "county",
        tags: [$t("地区相关")],
    },
];
