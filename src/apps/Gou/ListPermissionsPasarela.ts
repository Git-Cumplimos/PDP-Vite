import { ListPermissionsRecargaCupoWithPasarela } from "../RecargaCupo/Gou/ListPermissionsRecargaCupoWithPasarela";

const DictPermissionsPasarela: { [key: string]: any } = Object.freeze({
  ...ListPermissionsRecargaCupoWithPasarela,
});

export const ListPermissionsPasarela = Object.keys(DictPermissionsPasarela).map(
  (key: string) => DictPermissionsPasarela[key]
);
