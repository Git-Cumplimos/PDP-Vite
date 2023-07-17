import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchDatafonosTuLlave } from "../../utils/fetchTuLlave";
import TableEnterprise from "../../../../components/Base/TableEnterprise/TableEnterprise";
import Input from "../../../../components/Base/Input/Input";
import Select from "../../../../components/Base/Select/Select";
import { notifyError } from "../../../../utils/notify";

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
        ({ pos_id, fk_comercio_asociado, numero_serie, estado }) => {
          if (type === "Gestion") {
            return {
              pos_id,
              fk_comercio_asociado: fk_comercio_asociado ?? "No asociado",
              numero_serie,
              estado: estado ? "Activo" : "Inactivo",
            };
          } else {
            return {
              pos_id,
              numero_serie,
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
  const fetchDatafonosFunc = useCallback(() => {
    let obj = {};
    if (parseInt(dataDatafonos.pos_id))
      obj["pos_id"] = parseInt(dataDatafonos.pos_id);
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
  }, [page, limit, dataDatafonos]);
  const fetchDatafonosOnlyCommerceFunc = useCallback(() => {
    let obj = {};
    if (parseInt(dataDatafonos.pos_id))
      obj["pos_id"] = parseInt(dataDatafonos.pos_id);
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
  }, [page, limit, dataDatafonos]);
  const selectDatafono = useCallback(
    (ev, i) => {
      ev.preventDefault();
      if (type === "Gestion") {
        navigate(`editar/${datafonos[i]?.pk_tullave_datafonos}`);
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
            ? "Consulta Datafonos"
            : "Seleccione el datafono a recargar"
        }
        maxPage={maxPages}
        headers={
          type === "Gestion"
            ? ["Pos Id", "Id Comercio", "Número de serie", "Estado"]
            : ["Pos Id", "Número de serie"]
        }
        data={tableDatafonos}
        onSelectRow={selectDatafono}
        onSetPageData={setPageData}>
        <Input
          id='pos_id'
          label='Id datafono'
          type='text'
          name='pos_id'
          minLength='1'
          maxLength='10'
          // required
          value={dataDatafonos.pos_id}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setDataDatafonos((old) => {
                return { ...old, pos_id: num };
              });
            }
          }}></Input>
        {type === "Gestion" && (
          <>
            <Input
              id='fk_comercio_asociado'
              label='Id comercio'
              type='text'
              name='fk_comercio_asociado'
              minLength='1'
              maxLength='10'
              // required
              value={dataDatafonos.fk_comercio_asociado}
              onInput={(e) => {
                setDataDatafonos((old) => {
                  return { ...old, fk_comercio_asociado: e.target.value };
                });
              }}></Input>
            <Select
              className='place-self-stretch'
              id='estado'
              name='estado'
              label='Estado del datafono'
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
