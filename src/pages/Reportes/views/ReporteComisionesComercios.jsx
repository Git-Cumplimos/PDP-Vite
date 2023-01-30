import { Fragment, useCallback, useEffect, useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Fieldset from "../../../components/Base/Fieldset";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import SimpleLoading from "../../../components/Base/SimpleLoading";
import { useAuth } from "../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../utils/notify";
import SearchAutorizador from "../components/SearchAutorizador";
import SearchTipoOperacion from "../components/SearchTipoOperacion";
import {
  postObtenerReporteComisionesAplicadas,
  postObtenerReporteComisionesAplicadasComercio,
} from "../utils/fetchReportesComisiones";

const ReporteComisionesComercios = () => {
  const [showModal, setShowModal] = useState(false);
  const { roleInfo } = useAuth();
  const [selectedOpt, setSelectedOpt] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [report, setReport] = useState({
    id_comercio: "",
    id_trx: "",
    date_ini: "",
    date_end: "",
  });
  useEffect(() => {
    setReport((old) => ({
      ...old,
      id_comercio: roleInfo?.id_comercio,
    }));

    return () => {};
  }, [roleInfo?.id_comercio]);

  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelectedOpt("");
  }, []);

  const removeReport = useCallback(
    (name) => (ev) => {
      ev.preventDefault();
      setReport((old) => {
        return { ...old, [name]: "Vacio" };
      });
    },
    []
  );
  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      if (new Date(report["date_end"]) > new Date()) {
        notifyError("La fecha final no puede ser mayor al dia de hoy");
        return;
      }

      if (report["date_end"] !== "") {
        if (report["date_ini"] !== "") {
          if (new Date(report["date_end"]) <= new Date(report["date_ini"])) {
            notifyError("La fecha final debe ser mayor a la inicial");
            return;
          }
        } else {
          notifyError("Debe existir una fecha inicial");
          return;
        }
      }
      let obj = { id_comercio: report["id_comercio"] };
      if (report["date_ini"] !== "") {
        obj["date_ini"] = report["date_ini"];
      }
      if (report["date_end"] !== "") {
        obj["date_end"] = report["date_end"];
      }
      if (report["id_trx"] !== "") {
        obj["id_trx"] = report["id_trx"];
      }
      setIsUploading(true);
      postObtenerReporteComisionesAplicadasComercio(obj)
        .then((res) => {
          if (res?.status) {
            notify(res?.msg);
            window.open(res?.obj?.url);
            setIsUploading(false);
          } else {
            notifyError(res?.msg);
            setIsUploading(false);
          }
        })
        .catch((err) => {
          console.error(err);
          notifyError("No se pudo conectar al servidor");
          setIsUploading(false);
        });
    },
    [report]
  );
  if (report.id_comercio === "") {
    return <h1 className='text-3xl'>No tiene asociado un ID de comercio</h1>;
  }
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl'>Reporte historico comisiones:</h1>
      {/* <SearchComissions comissionFace="pay" onSelectItem={onSelectItem} /> */}
      <Form grid>
        <Input
          id='id_trx'
          name='id_trx'
          label={"Id transacción"}
          type='number'
          autoComplete='off'
          value={report?.["id_trx"]}
          onChange={(e) => {
            setReport((old) => {
              return { ...old, id_trx: e.target.value };
            });
          }}
        />
        <Input
          id='date_ini'
          name='date_ini'
          label={"Fecha inicio"}
          type='datetime-local'
          autoComplete='off'
          value={report?.["date_ini"]}
          onChange={(e) => {
            setReport((old) => {
              return { ...old, date_ini: e.target.value };
            });
          }}
        />
        <Input
          id='date_end'
          name='date_end'
          label={"Fecha fin"}
          type='datetime-local'
          autoComplete='off'
          value={report?.["date_end"]}
          onChange={(e) => {
            setReport((old) => {
              return { ...old, date_end: e.target.value };
            });
          }}
        />
      </Form>
      <ButtonBar>
        <Button type='submit' onClick={onSubmit}>
          Generar reporte
        </Button>
      </ButtonBar>
    </>
  );
};

export default ReporteComisionesComercios;
