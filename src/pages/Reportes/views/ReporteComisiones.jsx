import { Fragment, useCallback, useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Fieldset from "../../../components/Base/Fieldset";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import SimpleLoading from "../../../components/Base/SimpleLoading";
import { notify, notifyError } from "../../../utils/notify";
import SearchAutorizador from "../components/SearchAutorizador";
import SearchTipoOperacion from "../components/SearchTipoOperacion";
import { postObtenerReporteComisionesAplicadas } from "../utils/fetchReportesComisiones";

const ReporteComisiones = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [report, setReport] = useState({
    id_comercio: "",
    id_tipo_transaccion: "",
    nombre_operacion: "Vacio",
    id_autorizador: "",
    nombre_autorizador: "Vacio",
    id_trx: "",
    date_ini: "",
    date_end: "",
    // .replace("/", "-"),
  });

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
      let obj = {};
      if (report["id_comercio"] !== "") {
        obj["id_comercio"] = report["id_comercio"];
      }
      if (report["nombre_autorizador"] !== "Vacio" && report["Autorizador"]) {
        obj["id_autorizador"] = report["id_autorizador"];
      }
      if (
        report["nombre_operacion"] !== "Vacio" &&
        report["nombre_operacion"]
      ) {
        obj["id_tipo_transaccion"] = report["id_tipo_transaccion"];
      }
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
      postObtenerReporteComisionesAplicadas(obj)
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
        .catch((err) => console.error(err));
    },
    [report]
  );
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl'>Reporte historico comisiones:</h1>
      {/* <SearchComissions comissionFace="pay" onSelectItem={onSelectItem} /> */}
      <Form grid>
        <Input
          id='id_comercio'
          name='id_comercio'
          label={"Id comercio"}
          type='number'
          autoComplete='off'
          value={report?.["id_comercio"]}
          onChange={(e) => {
            setReport((old) => {
              return { ...old, id_comercio: e.target.value };
            });
          }}
        />
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
        <Fieldset legend={"Tipo operación"} className='lg:col-span-2'>
          <Input
            id='nombre_operacion'
            name='nombre_operacion'
            label={"Operación"}
            type='text'
            autoComplete='off'
            // defaultValue={newComision?.["Convenio"]}
            value={report?.["nombre_operacion"]}
            disabled
            info={
              report?.["nombre_operacion"] !== "Vacio" ? (
                <button
                  className='bi bi-x'
                  style={{
                    position: "absolute",
                    top: "-35px",
                    right: "-235px",
                    fontSize: "30px",
                    backgroundColor: "#f4f4f5",
                  }}
                  onClick={removeReport("nombre_operacion")}></button>
              ) : (
                <></>
              )
            }
          />
          <ButtonBar>
            <Button
              type='button'
              onClick={() => {
                setShowModal(true);
                setSelectedOpt("operacion");
              }}>
              {report?.["nombre_operacion"] !== "Vacio"
                ? "Editar operación"
                : "Agregar operación"}
            </Button>
          </ButtonBar>
        </Fieldset>
        <Fieldset legend={"Autorizador"} className='lg:col-span-2'>
          <Input
            id='Autorizador'
            name='Autorizador'
            label={"Autorizador"}
            type='text'
            autoComplete='off'
            // defaultValue={newComision?.["Autorizador"]}
            value={report?.["nombre_autorizador"]}
            info={
              report?.["nombre_autorizador"] !== "Vacio" ? (
                <button
                  className='bi bi-x'
                  style={{
                    position: "absolute",
                    top: "-35px",
                    right: "-235px",
                    fontSize: "30px",
                    backgroundColor: "#f4f4f5",
                  }}
                  onClick={removeReport("nombre_autorizador")}></button>
              ) : (
                <></>
              )
            }
            disabled
          />
          <ButtonBar>
            <Button
              type='button'
              onClick={() => {
                setShowModal(true);
                setSelectedOpt("autorizador");
              }}>
              {report?.["nombre_autorizador"] !== "Vacio"
                ? "Editar autorizador"
                : "Agregar autorizador"}
            </Button>
          </ButtonBar>
        </Fieldset>
      </Form>
      <ButtonBar>
        <Button type='submit' onClick={onSubmit}>
          Generar reporte
        </Button>
      </ButtonBar>
      <Modal show={showModal} handleClose={handleClose}>
        {selectedOpt === "operacion" ? (
          <SearchTipoOperacion
            handleClose={handleClose}
            setReport={setReport}
            report={report}
          />
        ) : selectedOpt === "autorizador" ? (
          <SearchAutorizador
            handleClose={handleClose}
            setReport={setReport}
            report={report}
          />
        ) : (
          <></>
        )}
      </Modal>
    </>
  );
};

export default ReporteComisiones;
