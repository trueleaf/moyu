/**
 * @description        自动计算高度适配屏幕
 * @author             shuxiaokai
 * @create             2021-03-22 22:44
 */

export default {
    update(el, binding) {
        const offsetY = el.getBoundingClientRect().y;
        const { value } = binding;
        el.style.height = `calc(100vh - ${offsetY + value}px)`;
        el.style.overflowY = `auto`;
    },
};
