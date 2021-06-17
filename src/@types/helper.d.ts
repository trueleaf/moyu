import { LoDashStatic } from "lodash"

type IsEqual = LoDashStatic["isEqual"];
type CloneDeep = LoDashStatic["CloneDeep"];


type Uuid = () => string;

type GetType = (variable: unknown) => string;

type ForestData<T> = {
    [propName: string]: T[]
}
// type ForEachForest<T extends ForestData<T>, K extends keyof T> =  (forest: Array<T>, fn: (arg: T) => void, options: ForEachForestOptions<K>) => void
interface Helper {
    isEqual: IsEqual,
    cloneDeep: CloneDeep,
    uuid: Uuid,
    getType: GetType,
    forEachForest<T extends ForestData<T>, K extends keyof T>(forest: Array<T>, fn: (arg: T) => void, options?: ForEachForestOptions<K>): void,
}


export { Helper, IsEqual, CloneDeep, Uuid, GetType }