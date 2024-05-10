import { ListPermissionsRecargaCupoWithPasarela } from "../RecargaCupo/Gou/ListPermissionsRecargaCupoWithPasarela";

const DictPermissionsGou: { [key: string]: any } = Object.freeze({
  ...ListPermissionsRecargaCupoWithPasarela,
});

export const ListPermissionsGou = Object.keys(DictPermissionsGou).map(
  (key: string) => DictPermissionsGou[key]
);
