
type IsEqual = (value: any, other: any) => boolean;

type CloneDeep = <T>(value: T) => T;

type Uuid = () => string;

type GetType = (variable: any) => string;

interface Helper {
    isEqual: IsEqual,
    cloneDeep: CloneDeep,
    uuid: Uuid,
    getType: GetType,
}


export { Helper, IsEqual, CloneDeep, Uuid, GetType }