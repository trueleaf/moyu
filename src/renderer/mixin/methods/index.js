import tips from "./tips"

export default {
    /**
        @description  随机生成提示信息
        @author       shuxiaokai
        @create       2019-06-25 13:33"
        @params       
        @return       
    */
    randomTip() {
        try {
            const len = tips.length;
            const randomIndex = Math.ceil(Math.random() * len) - 1;
            return tips[randomIndex];
        } catch (error) {
            console.error(error);
            return;
        }
    },

    /** 
     * @description        获取祖先组件
     * @author             shuxiaokai
     * @updateAuthor       shuxiaokai
     * @create             2020-02-13 15:22
     * @update             2020-02-13 15:22
     * @param {String}     componentName - 组件名称       
     * @return {any}       若查询到组件则返回组件，否则返回null
     */
    getAncestorComponent(componentName = "") {
        let parent = this.$parent || null;
        while (parent && parent.$options.name !== componentName) {
            parent = parent.$parent || null;
        }
        return parent;
    },

    /** 
     * @description        通过名称查找组件信息
     * @author             shuxiaokai
     * @create             2020-11-15 19:45
     * @param {String}     componentName - 组件名称       
     * @return {any}       若查询到组件则返回组件，否则返回null
     */
    getComponentByName(componentName = "") {
        const root = this.$root;
        const children = root.$children;
        let matchedComponent = null;
        const foo = (children) => {
            for (let i = 0; i < children.length; i++) {
                const component = children[i];
                if (component.$options.name === componentName) {
                    matchedComponent = component;
                    return;
                }
                if (component.$children && component.$children.length > 0) {
                    foo(component.$children);
                }
            }
        }
        foo(children);
        return matchedComponent;
    },

    /** 
     * @description        向父元素触发事件
     * @author             shuxiaokai
     * @updateAuthor       shuxiaokai
     * @param {String}     componentName - 组件名称       
     * @param {String}     eventName - 事件名称       
     * @param {String}     params - 参数      
     * @create             2020-02-10 11:21
     * @update             2020-02-10 11:21
     */

    dispatch(componentName, eventName, params) {
        let parent = this.$parent;
        if (parent.$options.name === componentName) {
            // console.log(parent)
            parent.$emit(eventName, params);
            return;
        }
        while (parent) {
            if (parent.$options.name !== componentName) {
                parent = parent.$parent;
            } else {
                // console.log(parent)
                parent.$emit(eventName, params);
                return;
            }
        }
    },

    /** 
     * @description        向子元素广播事件
     * @author             shuxiaokai
     * @updateAuthor       shuxiaokai
     * @param {String}     componentName - 组件名称       
     * @param {String}     eventName - 事件名称       
     * @param {String}     params - 参数      
     * @create             2020-02-10 11:21
     * @update             2020-02-10 11:21
     */
    broadcast(componentName, eventName, params) {
        const foo = (children, componentName, eventName, params) => {
            for(let i = 0; i < children.length; i++) {
                if (children[i].$options.name === componentName) {
                    children[i].$emit(eventName, params);
                }
                if (children[i].$children && children[i].$children.length > 0) {
                    foo(children[i].$children, componentName, eventName, params);
                }
            }
        }
        foo(this.$children, componentName, eventName, params);
    },

    /** 
     * @description        全局blob下载
     * @author              shuxiaokai
     * @create             2020-08-13 15:47
     * @param {Blob}       blob - blob对象       
     * @param {Number}     age - 数字类型       
     */
    blobDownload(blob, fileName) {
        let blobUrl = "";
        blobUrl = URL.createObjectURL(blob);
        const downloadElement = document.createElement("a");
        downloadElement.href = blobUrl;
        downloadElement.download = decodeURIComponent(fileName) || "未命名"; //下载后文件名
        document.body.appendChild(downloadElement);
        downloadElement.click(); //点击下载
        document.body.removeChild(downloadElement); //下载完成移除元素
        window.URL.revokeObjectURL(blobUrl); //释放掉blob对象
    },
    /** 
     * @description        判断一个变量是否为数字
     * @author              shuxiaokai
     * @create             2020-11-02 09:24
     * @param {any}        variable - 任意类型变量       
     * @return {boolean}   如果是数字则返回true，否则返回false
     * @remark   
     * null NaN undefined   => false
     * "0.2" "5" => false
     *  Infinity => false
     * 
     */
    _isNumber(val) {
        if (val == null) {
            return false;
        }
        if (typeof val === "number" && isFinite(val) && !isNaN(val)) {
            return true;
        }
    },

    /** 
     * @description        判断一个变量是否为类数字(严格意义数字或者可以转换为数字的字符串)
     * @author              shuxiaokai
     * @create             2020-11-02 09:29
     * @param {any}        variable - 任意类型变量       
     * @return {boolean}    返回字符串
     * @remark   
     * null NaN undefined   => false
     *  Infinity => false
     * "0.2" "5" => true
     */
    _isNumberLike(val) {
        if (val.toString().match(/^-?(0\.\d+|[1-9]+\.\d+|[1-9]\d{0,20}|[0-9])$/) || this._isNumber(val)) {
            return true;
        } else {
            return false;
        }
    },


};

