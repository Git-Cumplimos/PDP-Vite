import {
  v4 as uuidv4,
  version as uuidVersion,
  validate as uuidValidate,
} from "uuid";

const getUUID4 = (): string => uuidv4();

export const validateUuidV4 = (uuid: string): boolean => {
  return uuidValidate(uuid) && uuidVersion(uuid) === 4;
}

export { NIL as NIL_UUID } from "uuid";

export default getUUID4;
