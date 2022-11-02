import React, { Fragment, useEffect, useState } from "react";
import Input from "../../../../components/Base/Input";
import Form from "../../../../components/Base/Form";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Modal from "../../../../components/Base/Modal";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
import { notifyError } from "../../../../utils/notify";
import { useFetch } from "../../../../hooks/useFetch";
import {
  PeticionConciliacionCargar,
  PeticionConciliacionBuscar,
} from "../utils/fetchMovistar";

const ConciliacionMovistarCarga = () => {
  const [paramts, setParamts] = useState({
    fechainicial: "",
    fechafinal: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [typePaymentSummary, setTypePaymentSummary] = useState(0);
  const [maxPage, setMaxPage] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState(null);
  const [subTitleCarga, setSubTitleCarga] = useState("");
  const [titleCarga, setTitleCarga] = useState("");
  const [summary, setSummary] = useState({});
  const [fechaBusqueda, setFechaBusqueda] = useState("");
  const [file, setFile] = useState(null);
  const [error_msg, setError_msg] = useState([]);

  const [loadingConciliacionCargar, fetchConciliacionCargar] = useFetch(
    PeticionConciliacionCargar
  );

  useEffect(() => {
    let arrayParamts = [];

    for (let nombreParamts in paramts) {
      if (paramts[nombreParamts] != "") {
        arrayParamts.push(`${nombreParamts}=${paramts[nombreParamts]}`);
      }
    }
    arrayParamts.push(`page=${page}&limit=${limit}`);
    const params = arrayParamts.length > 0 ? arrayParamts.join("&") : "";

    PeticionConciliacionBuscar(params)
      .then((response) => {
        setData(response?.obj?.result);
        setMaxPage(response?.obj?.maxPages);
      })
      .catch((e) => {
        notifyError("Falla en el sistema: " + e);
      });
  }, [paramts, page, limit, showModal]);

  function FunctionInput(e) {
    setParamts((anterior) => ({
      ...anterior,
      [e.target.name]: e.target.value,
    }));
  }

  function uploadFile() {
    fetchConciliacionCargar(file, `fecha=${fechaBusqueda}`)
      .then((resultPeticion) => {
        if (resultPeticion?.status) {
          setTypePaymentSummary(2);
          setTitleCarga("Carga de archivo Movistar EXITOSA");
          setSubTitleCarga("Resumen");
          setSummary({
            uno: "Nombre del Archivo: ",
            dos: "",
            tres: resultPeticion?.obj?.result?.nombreArchivo,
          });
        } else if (resultPeticion?.obj?.error) {
          throw resultPeticion?.obj?.error_msg[0];
        }
      })
      .catch((error) => {
        const errormom = error?.split(">>>>");
        const error_id = errormom[0].match(/\d/g);
        const error_vector_usuario = [2, 4, 5, 6, 9];
        const error_concidencia_usuario = error_vector_usuario.filter(
          (error_ind) => error_ind == error_id
        );

        if (error_concidencia_usuario.length > 0) {
          console.log(errormom[1]);
          setError_msg(errormom[1]);
        } else {
          setTypePaymentSummary(2);
          setTitleCarga("No se pudo cargar el archivo Movistar");
          setSubTitleCarga("Resumen");
          setSummary({
            uno: `Falla en el sistema: \n${errormom[0]} \n${errormom[1]}`,
            dos: "Inténtelo más tarde",
          });
        }
      });
  }

  const handleClose = () => {
    setShowModal(false);
    setSummary({});
    setTypePaymentSummary(0);
    setFile(null);
    setError_msg("");
  };

  return (
    <div className="w-full flex flex-col justify-center items-center my-8">
      <h1 className="text-3xl">Conciliaciones Movistar</h1>
      <Form grid>
        <TableEnterprise
          title="Archivos movistar"
          maxPage={maxPage}
          headers={["Fecha", "Movistar"]}
          data={
            data?.map((inf) => ({
              Fecha: inf.fechabusqueda,
              ArchivoMovistar: inf.movistar.status,
            })) ?? []
          }
          onSelectRow={(event, i) => {
            const especificar =
              data?.[i].movistar.url != null ? "remplazar" : "cargar";
            setTypePaymentSummary(1);
            setFechaBusqueda(data?.[i].fechabusqueda);
            setSubTitleCarga(
              `¿Está seguro de ${especificar} el archivo del día ${data?.[i].fechabusqueda}?`
            );
            setShowModal(true);
          }}
          onSetPageData={(pagedata) => {
            setPage(pagedata.page);
            setLimit(pagedata.limit);
          }}
        >
          <Input
            name="fechainicial"
            label="Fecha inicial"
            type="date"
            value={paramts.fechainicial}
            onChange={(e) => FunctionInput(e)}
          />
          <Input
            name="fechafinal"
            label="Fecha final"
            type="date"
            value={paramts.fechafinal}
            onChange={(e) => FunctionInput(e)}
          />
        </TableEnterprise>
      </Form>
      <Modal show={showModal} handleClose={handleClose}>
        {typePaymentSummary === 1 ? (
          <PaymentSummary
            title="Cargar archivo Movistar"
            subtitle={subTitleCarga}
          >
            <Input
              type="file"
              onChange={(e) => {
                setFile(e.target.files[0]);
              }}
            />
            <label className="whitespace-pre-line">{error_msg}</label>

            {!loadingConciliacionCargar ? (
              <ButtonBar>
                <Button type="button" onClick={uploadFile}>
                  Aceptar
                </Button>
                <Button type="button" onClick={handleClose}>
                  Cancelar
                </Button>
              </ButtonBar>
            ) : (
              <h1 className="text-2xl font-semibold">Procesando . . .</h1>
            )}
          </PaymentSummary>
        ) : (
          <></>
        )}

        {typePaymentSummary === 2 && !loadingConciliacionCargar ? (
          <PaymentSummary title={titleCarga} subtitle={subTitleCarga}>
            <label className="whitespace-pre-line">{summary.uno}</label>
            <label className="text-2xl font-semibold ">{summary.dos}</label>
            <label>{summary.tres}</label>
            <ButtonBar>
              <Button type="button" onClick={handleClose}>
                Cerrar
              </Button>
            </ButtonBar>
          </PaymentSummary>
        ) : (
          <></>
        )}
      </Modal>
    </div>
  );
};

export default ConciliacionMovistarCarga;
