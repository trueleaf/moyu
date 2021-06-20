import { LoDashStatic } from "lodash"
import { forEachForest } from "@/helper/index"

type IsEqual = LoDashStatic["isEqual"];
type CloneDeep = LoDashStatic["CloneDeep"];

type Uuid = () => string;

type GetType = (variable: unknown) => string;

interface Helper {
    isEqual: IsEqual,
    cloneDeep: CloneDeep,
    uuid: Uuid,
    getType: GetType,
    /**
     * 遍历树形数据
     */
    forEachForest: typeof forEachForest,
}

export { Helper, IsEqual, CloneDeep, Uuid, GetType }
