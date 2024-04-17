import { ListPermissionsRecargaCupoConGou } from "../RecargaCupo/Gou/ListPermissionsRecargaCupoConGou";

const DictPermissionsGou: { [key: string]: any } = Object.freeze({
  ...ListPermissionsRecargaCupoConGou,
});

export const ListPermissionsGou = Object.keys(DictPermissionsGou).map(
  (key: string) => DictPermissionsGou[key]
);
