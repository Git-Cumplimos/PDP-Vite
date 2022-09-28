import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Input from "../../../../components/Base/Input";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { useAuth } from "../../../../hooks/AuthHooks";
import { onChangeNumber } from "../../../../utils/functions";
import { notifyError } from "../../../../utils/notify";
import { getConveniosRecaudoList } from "../../utils/fetchFunctions";

const ConsultaManual = () => {
  const navigate = useNavigate();
  const { roleInfo } = useAuth();

  const [listaConveniosRecaudo, setListaConveniosRecaudo] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [searchFilters, setSearchFilters] = useState({
    pk_codigo_convenio: "",
    codigo_ean_iac: "",
    nombre_convenio: "",
    activo: true,
  });

  const getConvRecaudo = useCallback(() => {
    getConveniosRecaudoList({ ...pageData, ...searchFilters })
      .then((res) => {
        setListaConveniosRecaudo(res?.obj?.results ?? []);
        setMaxPages(res?.obj?.maxPages ?? []);
      })
      .catch((err) => {
        if (err?.cause === "custom") {
          notifyError(err?.message);
          return;
        }
        console.error(err?.message);
      });
  }, [pageData, searchFilters]);

  
  useEffect(() => {
    getConvRecaudo();
  }, [getConvRecaudo]);

  /**
   * Check if has commerce data
   */

  const hasData = useMemo(() => {
    if (!roleInfo || (roleInfo && Object.keys(roleInfo).length === 0)) {
      return false;
    }
    const keys = [
      "id_comercio",
      "id_usuario",
      "tipo_comercio",
      "id_dispositivo",
      "ciudad",
      "direccion",
      "codigo_dane",
    ];
    for (const key of keys) {
      if (!(key in roleInfo)) {
        return false;
      }
    }
    return true;
  }, [roleInfo]);

  if (!hasData) {
    notifyError(
      "El usuario no cuenta con datos de comercio, no se permite la transaccion"
    );
    return <Navigate to={"/"} replace />;
  }

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Consulta recaudo manual</h1>
      <TableEnterprise
        title="Convenios de recaudo"
        headers={[
          "Código convenio",
          "Código ean o iac",
          "Nombre convenio",
        ]}
        data={listaConveniosRecaudo.map(
          ({
            pk_codigo_convenio,
            codigo_ean_iac,
            nombre_convenio,
          }) => ({
            pk_codigo_convenio,
            codigo_ean_iac,
            nombre_convenio,
          })
        )}
        maxPage={maxPages}
        onSetPageData={setPageData}
        onSelectRow={(e, i) =>
          navigate(
            `/corresponsalia/colpatria/recaudo/${listaConveniosRecaudo[i]?.pk_codigo_convenio}`
          )
        }
        onChange={(ev) =>
          setSearchFilters((old) => ({
            ...old,
            [ev.target.name]: ev.target.value,
          }))
        }
      >
        <Input
          id={"pk_codigo_convenio"}
          label={"Código de convenio"}
          name={"pk_codigo_convenio"}
          type="tel"
          autoComplete="off"
          maxLength={"6"}
          onChange={(ev) => {
            ev.target.value = onChangeNumber(ev);
          }}
          required
        />
        <Input
          id={"codigo_ean_iac_search"}
          label={"Código ean o iac"}
          name={"codigo_ean_iac"}
          type="tel"
          autoComplete="off"
          maxLength={"4"}
          onChange={(ev) => {
            ev.target.value = onChangeNumber(ev);
          }}
          required
        />
        <Input
          id={"nombre_convenio"}
          label={"Nombre del Convenio"}
          name={"nombre_convenio"}
          type="text"
          autoComplete="off"
          maxLength={"30"}
          required
        />
      </TableEnterprise>
    </Fragment>
  );
};

export default ConsultaManual;
