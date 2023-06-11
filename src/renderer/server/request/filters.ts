/*
  |--------------------------------------------------------------------------
  | 支持的全局过滤函数
  |--------------------------------------------------------------------------
*/

/**
 * 将字符串转换为json字符串
 */
export function toJsonStr<T = unknown>(str: unknown): T {
    try {
        return JSON.stringify(str) as T;
    } catch (error) {
        return str as T;
    }
}

export const filters = {
    toJsonStr
}
