import { useCallback, useMemo, useState } from "react";
import Input from "../../../components/Base/Input";
import TableEnterprise from "../../../components/Base/TableEnterprise";

const TablaCreditos = ({ dataCreditos, onSelectItem }) => {
  const [maxPages, setMaxPages] = useState(0);
  const [pageData, setPageData] = useState(1);
  const dataTable = useMemo(() => {
    return dataCreditos.map(
      ({
        Agrupacion,
        Calificacion,
        Calificacionactual,
        Codigoasesor,
        Codigore,
        Cuotasmora,
        Cuotaspagadas,
        Diasmoraacumulado,
        Diasmorapromedio,
        Estado,
        Fechadesembolso,
        Fechadeultimopago,
        Fechavencimientoproximo,
        Formapago,
        Frecuenciapagocapital,
        Frecuenciapagointeres,
        Id,
        Idsucursal,
        Idtercero,
        Nombreasesor,
        Nombrere,
        Numeroprestamo,
        Saldo,
        Sucursal,
        Tasaprestamo,
        Terceroprestamo,
        Tipocredito,
        Valorcuotaactual,
        Valordecuota,
        Valordesembolso,
        Valorinteresanticipado,
        Valorpagototal,
        Valorpagototalcausado,
        Valorparaestaraldia,
      }) => {
        return {
          Id: Id,
        };
      }
    );
  }, [dataCreditos]);
  const onChange = useCallback((ev) => {}, []);
  return (
    <>
      {/* <Pagination maxPage={maxPages} onChange={onChange} grid></Pagination> */}
      <TableEnterprise
        title={"Créditos activos comercio"}
        maxPage={maxPages}
        onChange={onChange}
        headers={["id"]}
        data={dataTable}
        onSelectRow={onSelectItem}
        onSetPageData={setPageData}
      >
        <>
          <Input
            id={"nombre_asignacion_comision"}
            label={"Nombre asignación"}
            name={"nombre_asignacion_comision"}
            type={"text"}
            maxLength={50}
            autoComplete="off"
            //   defaultValue={nombre_asignacion_comision}
          />
          <Input
            id={"fk_tipo_op"}
            label={"Tipo de transacción"}
            name={"fk_tipo_op"}
            type={"tel"}
            autoComplete="off"
            maxLength={30}
            // onChange={(ev) => (ev.target.value = onChangeNumber(ev))}
            //   defaultValue={fk_tipo_op}
          />
        </>
      </TableEnterprise>
    </>
  );
};

export default TablaCreditos;
