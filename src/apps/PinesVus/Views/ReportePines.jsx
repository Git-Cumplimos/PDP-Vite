import { useState, useRef, useMemo, useEffect } from "react";
import Input from "../../../components/Base/Input";
import Select from "../../../components/Base/Select";
import { usePinesVus } from "../utils/pinesVusHooks";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import { notifyError } from "../../../utils/notify";
import { useAuth } from "../../../hooks/AuthHooks";
import TableEnterprise from "../../../components/Base/TableEnterprise";

const dateFormatter = Intl.DateTimeFormat("es-CO", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

const ReportePines = () => {
  const { consultaPinesVus, con_estado_tipoPin } = usePinesVus();

  const formatMoney = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  const [table, setTable] = useState("");
  const [formatMon, setFormatMon] = useState("");
  const [selected, setSelected] = useState(true);
  const { roleInfo } = useAuth();
  const [maxPages, setMaxPages] = useState(1);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [optionsEstadoPin, setOptionsEstadoPin] = useState([]);
  const [estadoPin, setEstadoPin] = useState("");
  const [optionsTipoPines, setOptionsTipoPines] = useState([]);
  const [tipoPin, setTipoPin] = useState("");

  const pageStyle = `
  @page {
    size: 80mm 50mm;
  }

  @media all {
    .pagebreak {
      display: none;
    }
  }

  @media print {
    .pagebreak {
      page-break-before: always;
    }
  }
`;

  useEffect(() => {
    if (
      (fechaInicial !== "") & (fechaFinal !== "") ||
      estadoPin !== "" ||
      tipoPin != ""
    ) {
      console.log(estadoPin);
      consultaPinesVus(
        "",
        fechaInicial,
        fechaFinal,
        estadoPin,
        tipoPin,
        pageData
      )
        .then((res) => {
          setTable("");
          if (res?.status == false) {
            notifyError(res?.msg);
          } else {
            setTable(
              res?.obj?.results?.map((row) => {
                const fecha_vencimiento = new Date(row?.fecha_vencimiento);
                fecha_vencimiento.setHours(fecha_vencimiento.getHours() + 5);
                setFormatMon(row?.ValorPagar);
                return {
                  Id: row?.id_pin,
                  Cedula: row?.doc_cliente,
                  Estado: row?.name_estado_pin,
                  "Codigo Estado": row?.estado_pin,
                  Vencimiento: dateFormatter.format(fecha_vencimiento),
                  Valor: formatMoney.format(row?.valor),
                };
              })
            );
            setMaxPages(res?.obj?.maxPages);
          }
        })
        .catch((err) => console.log("error", err));
    }
  }, [pageData, fechaFinal, fechaInicial, estadoPin, tipoPin]);

  useEffect(() => {
    con_estado_tipoPin("estado_pines_vus")
      .then((res) => {
        if (res?.status == false) {
          notifyError(res?.msg);
        } else {
          setOptionsEstadoPin(res?.obj?.results);
        }
      })
      .catch((err) => console.log("error", err));

    con_estado_tipoPin("tipo_pines_vus")
      .then((res) => {
        console.log(res);
        if (res?.status === false) {
          notifyError(res?.msg);
        } else {
          setOptionsTipoPines(res?.obj?.results);
        }
      })
      .catch((err) => console.log("error", err));
  }, []);
  return (
    <>
      <>
        <TableEnterprise
          title="Información de credito"
          maxPage={maxPages}
          headers={[
            "Id",
            "Cedula",
            "Estado",
            "Codigo Estado",
            "Vencimiento",
            "Valor",
          ]}
          data={table || []}
          onSelectRow={(e, index) => {
            if (table[index]["Codigo Estado"] !== 1) {
              notifyError(table[index].Estado);
            } else {
              setSelected(table[index]);
            }
          }}
          onSetPageData={setPageData}
        >
          <Input
            id="dateInit"
            label="Fecha inicial"
            type="date"
            value={fechaInicial}
            onInput={(e) => setFechaInicial(e.target.value)}
          />
          <Input
            id="dateEnd"
            label="Fecha final"
            type="date"
            value={fechaFinal}
            onInput={(e) => setFechaFinal(e.target.value)}
          />
          <Select
            id="TipoPin"
            label="Tipo pin"
            options={
              Object.fromEntries([
                ["", ""],
                ...optionsTipoPines?.map(({ descripcion, id }) => {
                  return [descripcion, id];
                }),
              ]) || { "": "" }
            }
            value={tipoPin}
            required={true}
            onChange={(e) => setTipoPin(parseInt(e.target.value) ?? "")}
          />
          <Select
            id="estadoPin"
            label="Estado del pin"
            options={
              Object.fromEntries([
                ["", ""],
                ...optionsEstadoPin?.map(({ descripcion, id }) => {
                  return [descripcion, id];
                }),
              ]) || { "": "" }
            }
            value={estadoPin}
            required={true}
            onChange={(e) => setEstadoPin(parseInt(e.target.value) ?? "")}
          />
        </TableEnterprise>
      </>
    </>
  );
};
export default ReportePines;
