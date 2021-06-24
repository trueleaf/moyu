import { App } from "vue"

interface ElForm extends App {
    validate: (fn: (valid: boolean) => void) => void,
    validateField: (field: string) => void,
    resetFields: () => void,
}
export { ElForm }
