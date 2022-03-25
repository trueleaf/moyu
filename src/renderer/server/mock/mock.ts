import Mock from "mockjs";

const { Random } = Mock;

Random.extend({
    //时间戳
    timestamp() {
        return Date.now();
    },
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
