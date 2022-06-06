import { randomInt } from "@/helper";
import dayjs from "dayjs";
import Mock from "mockjs";

const { Random } = Mock;
let startTime = new Date();

Random.extend({
    //时间戳
    timestamp() {
        return Date.now();
    },
    //开始时间
    startTime(date, rule) {
        const dateParams = date || new Date(`202${randomInt(0, 3)}-0${randomInt(1, 12)}-0${randomInt(1, 12)}`);
        startTime = dateParams;
        const realRule = rule || "YYYY-MM-DD HH:mm"
        const result = dayjs(dateParams).format(realRule);
        return result;
    },
    //结束时间
    endTime(date, rule) {
        const dateParams = date || new Date(new Date(startTime).getTime() + 24 * 1000 * 60 * 60 * randomInt(1, 30));
        const realRule = rule || "YYYY-MM-DD HH:mm"
        const result = dayjs(dateParams).format(realRule);
        return result;
    }
    //结束时间
    // image(data, background) {
    //     let width = 0;
    //     let height = 0;
    //     const widthAndHeight = data?.split("x");
    //     if (!widthAndHeight) {
    //         width = 100;
    //         height = 100;
    //     } else {
    //         width = widthAndHeight[0];
    //         height = widthAndHeight[1];
    //     }
    //     const canvas = document.createElement("canvas");
    //     canvas.width = width;
    //     canvas.height = height;
    //     const ctx = canvas.getContext("2d");
    //     ctx.fillStyle = background || "#ccc";
    //     ctx.fillRect(0, 0, width, height);
    //     ctx.font = `${Math.min(width, height) / 2}px`;
    //     ctx.strokeText(`${width}x${height}`, 0, height / 2);
    //     return canvas.toDataURL("image/png");
    // },
});

export default Mock;
