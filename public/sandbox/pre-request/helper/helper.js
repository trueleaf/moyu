/*
|--------------------------------------------------------------------------
| 全局工具函数
|--------------------------------------------------------------------------
*/
const Helper = {
    /**
     * 将数组类型的key，value转换为
     */
    convertArrayDataToObjectData(arrData) {
        const result = {};
        arrData.forEach(v => {
            if (v.key) {
                result[v.key] = v.value;
            }
        })
        return result;
    }
}