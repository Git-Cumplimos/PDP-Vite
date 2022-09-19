import { useState, useEffect, useCallback, Fragment } from "react";
import Input from "../../../../../components/Base/Input";
import { buscarNotas } from "../../../utils/fetchCaja";
import TableEnterprise from "../../../../../components/Base/TableEnterprise";
import {
  makeDateFormatter,
  makeMoneyFormatter,
  onChangeNumber,
} from "../../../../../utils/functions";
import { notifyError } from "../../../../../utils/notify";
import Select from "../../../../../components/Base/Select";

const formatMoney = makeMoneyFormatter(0);

const dateFormatter = makeDateFormatter(true);

const NotasHistorico = () => {
  const [receipt, setReceipt] = useState([]);
  const [pageData, setPageData] = useState({});
  const [maxPages, setMaxPages] = useState(1);
  const [searchInfo, setSearchInfo] = useState(
    new Map([
      ["id_usuario", ""],
      ["id_comercio", ""],
      ["date_ini", ""],
      ["date_end", ""],
      ["tipo_nota", ""],
    ])
  );

  const buscarNotasHistorico = useCallback(() => {
    buscarNotas({
      ...Object.fromEntries(
        Array.from(searchInfo).filter(
          ([, val]) => !(val === "" || val === null || val === undefined)
        )
      ),
      ...pageData,
    })
      .then((res) => {
        setReceipt(res?.obj?.results);
        setMaxPages(res?.obj?.maxPages);
      })
      .catch((err) => {
        if (err?.cause === "custom") {
          notifyError(err?.message);
          return;
        }
        console.error(err?.message);
        notifyError("Peticion fallida");
      });
  }, [searchInfo, pageData]);

  useEffect(() => {
    buscarNotasHistorico();
  }, [buscarNotasHistorico]);

  return (
    <Fragment>
      <TableEnterprise
        title="Históricos - Notas Débito y Crédito"
        headers={[
          "Id nota",
          "Id comercio",
          "Id cajero",
          "Tipo de movimiento",
          "Fecha y hora",
          "Responsable",
          "Razón ajuste",
          "Valor nota",
        ]}
        maxPage={maxPages}
        data={receipt?.map(
          ({
            created,
            id_cajero,
            id_comercio,
            pk_id_nota,
            razon_ajuste,
            responsable,
            tipo_nota,
            valor_nota,
          }) => ({
            pk_id_nota,
            id_comercio,
            id_cajero,
            tipo_nota: tipo_nota ? "Débito" : "Crédito",
            created: dateFormatter.format(new Date(created)),
            responsable,
            razon_ajuste: <p>{razon_ajuste}</p>,
            valor_nota: formatMoney.format(valor_nota),
          })
        )}
        onSetPageData={setPageData}
      >
        <Input
          id="dateInit"
          name={"date_ini"}
          label="Fecha inicial"
          type="date"
          onInput={(ev) =>
            setSearchInfo((old) => {
              const copy = new Map(old);
              copy.set(ev.target.name, ev.target.value);
              return new Map(copy);
            })
          }
        />
        <Input
          id="dateEnd"
          name={"date_end"}
          label="Fecha final"
          type="date"
          onInput={(ev) =>
            setSearchInfo((old) => {
              const copy = new Map(old);
              copy.set(ev.target.name, ev.target.value);
              return new Map(copy);
            })
          }
        />
        <Input
          id="id_comercio"
          name={"id_comercio"}
          label="Id comercio"
          type="tel"
          onInput={(ev) =>
            setSearchInfo((old) => {
              const copy = new Map(old);
              copy.set(ev.target.name, onChangeNumber(ev));
              return new Map(copy);
            })
          }
        />
        <Input
          id="id_cajero"
          name={"id_cajero"}
          label="Id cajero"
          type="tel"
          onInput={(ev) =>
            setSearchInfo((old) => {
              const copy = new Map(old);
              copy.set(ev.target.name, onChangeNumber(ev));
              return new Map(copy);
            })
          }
        />
        <Select
          id="searchByStatus"
          label="Tipo de movimiento"
          name="tipo_nota"
          options={[
            { value: "", label: "" },
            { value: "d", label: "Debito" },
            { value: "c", label: "Credito" },
          ]}
          onChange={(ev) =>
            setSearchInfo((old) => {
              const temp = {
                "": "",
                d: true,
                c: false,
              };
              const copy = new Map(old);
              copy.set(ev.target.name, temp[ev.target.value]);
              return new Map(copy);
            })
          }
        />
      </TableEnterprise>
    </Fragment>
  );
};

export default NotasHistorico;
