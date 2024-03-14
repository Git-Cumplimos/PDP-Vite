import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchDatafonosTuLlave } from "../../utils/fetchTuLlave";
import TableEnterprise from "../../../../components/Base/TableEnterprise/TableEnterprise";
import Input from "../../../../components/Base/Input/Input";
import Select from "../../../../components/Base/Select/Select";
import { notifyError } from "../../../../utils/notify";
import useDelayedCallback from "../../../../hooks/useDelayedCallback";
import { makeDateFormatter } from "../../../../utils/functions";

const dateFormatter = makeDateFormatter(true);

const ConsultaDatafonos = ({
  navigate,
  type = "Gestion",
  id_comercio = null,
}) => {
  const [dataDatafonos, setDataDatafonos] = useState({
    pos_id: "",
    fk_comercio_asociado: "",
    estado: true,
  });
  const [datafonos, setDatafonos] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });

  const tableDatafonos = useMemo(() => {
    return [
      ...datafonos.map(
        ({
          pos_id,
          fk_comercio_asociado,
          numero_serie,
          estado,
          fecha_creacion,
          fecha_modificacion,
        }) => {
          if (type === "Gestion") {
            return {
              pos_id,
              fk_comercio_asociado: fk_comercio_asociado ?? "No asociado",
              estado: estado ? "Activo" : "Inactivo",
              fecha_creacion:
                dateFormatter.format(new Date(fecha_creacion)) ?? "",
              fecha_modificacion:
                dateFormatter.format(new Date(fecha_modificacion)) ?? "",
            };
          } else {
            return {
              pos_id: pos_id,
              numero_serie: numero_serie ?? "",
              fecha_creacion: fecha_creacion ?? "",
              fecha_modificacion: fecha_modificacion ?? "",
            };
          }
        }
      ),
    ];
  }, [datafonos, type]);
  useEffect(() => {
    if (type === "Gestion") {
      fetchDatafonosFunc();
    } else {
      fetchDatafonosOnlyCommerceFunc();
    }
  }, [page, limit, dataDatafonos, type]);
  const fetchDatafonosFunc = useDelayedCallback(
    useCallback(() => {
      let obj = {};
      if (dataDatafonos.pos_id) obj["pos_id"] = dataDatafonos.pos_id;
      if (dataDatafonos.fk_comercio_asociado)
        obj["fk_comercio_asociado"] = dataDatafonos.fk_comercio_asociado;
      if (dataDatafonos.estado !== "") obj["estado"] = dataDatafonos.estado;

      fetchDatafonosTuLlave({
        ...obj,
        page,
        limit,
        sortBy: "pk_tullave_datafonos",
        sortDir: "DESC",
      })
        .then((autoArr) => {
          setMaxPages(autoArr?.maxPages);
          setDatafonos(autoArr?.results ?? []);
        })
        .catch((err) => console.error(err));
    }, [page, limit, dataDatafonos]),
    500
  );
  const fetchDatafonosOnlyCommerceFunc = useDelayedCallback(
    useCallback(() => {
      let obj = {
        estado: true,
      };
      if (dataDatafonos.pos_id) obj["pos_id"] = dataDatafonos.pos_id;
      if (id_comercio) {
        obj["fk_comercio_asociado"] = id_comercio;
      } else {
        return notifyError("Error al obtener el id comercio");
      }

      fetchDatafonosTuLlave({
        ...obj,
        page,
        limit,
        sortBy: "pk_tullave_datafonos",
        sortDir: "DESC",
      })
        .then((autoArr) => {
          setMaxPages(autoArr?.maxPages);
          setDatafonos(autoArr?.results ?? []);
        })
        .catch((err) => console.error(err));
    }, [page, limit, dataDatafonos]),
    500
  );
  const selectDatafono = useCallback(
    (ev, i) => {
      ev.preventDefault();
      if (type === "Gestion") {
        navigate(`${datafonos[i]?.pk_tullave_datafonos}`);
      } else {
        navigate(`transaccion/${datafonos[i]?.pk_tullave_datafonos}`);
      }
    },
    [datafonos, type, id_comercio]
  );
  return (
    <>
      <TableEnterprise
        title={
          type === "Gestion"
            ? "Consulta Datáfonos"
            : "Seleccione el datáfono a recargar"
        }
        maxPage={maxPages}
        headers={
          type === "Gestion"
            ? [
                "Pos Id",
                "Id Comercio",
                "Estado",
                "Fecha de Registro",
                "Fecha de Modificación",
              ]
            : [
                "Pos Id",
                "Número de serie",
                "Fecha de Registro",
                "Fecha de Modificación",
              ]
        }
        data={tableDatafonos}
        onSelectRow={selectDatafono}
        onSetPageData={setPageData}
      >
        <Input
          id="pos_id"
          label="Id datáfono"
          type="text"
          name="pos_id"
          minLength="1"
          maxLength="10"
          value={dataDatafonos.pos_id}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const valor = e.target.value;
              const num = valor.replace(/[\s\.-]/g, "");
              setDataDatafonos((old) => {
                return { ...old, pos_id: num };
              });
            }
          }}
        ></Input>
        {type === "Gestion" && (
          <>
            <Input
              id="fk_comercio_asociado"
              label="Id comercio"
              type="text"
              name="fk_comercio_asociado"
              minLength="1"
              maxLength="10"
              value={dataDatafonos.fk_comercio_asociado}
              onInput={(e) => {
                if (!isNaN(e.target.value)) {
                  const valor = e.target.value;
                  const num = valor.replace(/[\s\.-]/g, "");
                  setDataDatafonos((old) => {
                    return { ...old, fk_comercio_asociado: num };
                  });
                }
              }}
            ></Input>
            <Select
              className="place-self-stretch"
              id="estado"
              name="estado"
              label="Estado del datáfono"
              required={true}
              options={{
                Inactivo: false,
                Activo: true,
              }}
              onChange={(e) => {
                setDataDatafonos((old) => {
                  return { ...old, estado: e.target.value };
                });
              }}
              value={dataDatafonos?.estado}
            />
          </>
        )}
      </TableEnterprise>
    </>
  );
};

export default ConsultaDatafonos;
