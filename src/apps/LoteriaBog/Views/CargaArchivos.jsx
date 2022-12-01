import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import Form from "../../../components/Base/Form";
import InputX from "../../../components/Base/InputX/InputX";
import Select from "../../../components/Base/Select";
import AWS, { CostExplorer } from "aws-sdk";
import ProgressBar from "../../../components/Base/ProgressBar/ProgressBar";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import Modal from "../../../components/Base/Modal";
import CargarForm from "../components/CargarForm/CargarForm";
import { useLoteria } from "../utils/LoteriaHooks";
import SubPage from "../../../components/Base/SubPage/SubPage";
import fetchData from "../../../utils/fetchData";

const url_cargueS3 = `${process.env.REACT_APP_URL_LOTERIAS}/cargueS3`;

const CargaArchivos = ({ route }) => {
  const { codigos_lot, setCodigos_lot } = useLoteria();

  const { label } = route;
  const options = [
    { value: "", label: "" },
    { value: "PlanDePremios", label: "Plan de premios" },
    { value: "Asignacion", label: "Asignación" },
    { value: "Resultados", label: "Resultados" },
    { value: "Liquidacion", label: "Liquidacion de premios" },
  ];

  const optionsTipoSorteo = useMemo(() => {
    const options = [
      { value: "", label: "" },
      {
        value: `${codigos_lot?.[0]?.cod_loteria}_Ordinario/`,
        label: "Sorteo Ordinario",
      },
    ];

    if (codigos_lot?.length === 2) {
      options.push({
        value: `${codigos_lot?.[1]?.cod_loteria}_Extra/`,
        label: "Sorteo Extraordinario",
      });
    }

    return options;
  }, [codigos_lot]);

  const [archivo, setArchivo] = useState("");
  const [tipoSorteo, setTipoSorteo] = useState("");
  const [fisiVirtual, setFisiVirtual] = useState("");
  const [file, setFile] = useState("");
  const [fileName, setFileName] = useState("");

  const optionsFisiVir = [
    { value: "", label: "" },
    { value: "Fisico/", label: `${archivo} Fisicos` },
    { value: "Virtual/", label: `${archivo} Virtuales` },
  ];

  const [showModal, setShowModal] = useState(false);

  const [progress, setProgress] = useState(0);

  const S3_BUCKET = process.env.REACT_APP_BUCKET;
  const REGION = process.env.REACT_APP_REGION;
  //console.log(S3_BUCKET)
  const bucket = new AWS.S3({
    params: { Bucket: S3_BUCKET },
    region: REGION,
  });
  console.log(`${tipoSorteo}${archivo}/${fisiVirtual}`);
  // const saveFile = () => {
  //   setDisabledBtns(true);
  //   const f = new Date();
  //   const params = {
  //     Body: file,
  //     Bucket: S3_BUCKET,
  //     Key: `${tipoSorteo}${archivo}/${fisiVirtual}${f.getDate()}${
  //       f.getMonth() + 1
  //     }${f.getFullYear()}${fileName}`,
  //   };
  //   bucket
  //     .putObject(params)
  //     .on("httpUploadProgress", (evt) => {
  //       setProgress(Math.round((evt.loaded / evt.total) * 100));
  //       setTimeout(() => {
  //         closeModal();
  //         EstadoArchivos().then((res) => {
  //           if (typeof res != Object) {
  //             if ("Motivo" in res?.[0]) {
  //               if (res[0]["Estado"] === 1) {
  //                 notify(res[0]["Motivo"]);
  //               } else {
  //                 notifyError(res[0]["Motivo"]);
  //               }
  //             } else {
  //               notifyError("Consulte con soporte");
  //             }
  //           }
  //         });
  //       }, 3000);
  //     })
  //     .send((err) => {
  //       if (err)
  //         notifyError("Error con servicio de almacenamiento en la nube", err);
  //       console.log(err);
  //     });
  // };
  //------------------Funcion Para Subir El Formulario---------------------//
  const saveFile = useCallback(
    (e) => {
      setDisabledBtns(true);
      const f = new Date();
      const query = {
        contentType: "application/text",
        filename: `${tipoSorteo}${archivo}/${fisiVirtual}${f.getDate()}${
          f.getMonth() + 1
        }${f.getFullYear()}${fileName}`,
      };
      fetchData(url_cargueS3, "GET", query)
        .then((respuesta) => {
          if (!respuesta?.status) {
            notifyError(respuesta?.msg);
          } else {
            // setEstadoForm(true);
            const formData2 = new FormData();
            if (file) {
              for (const property in respuesta?.obj?.fields) {
                formData2.set(
                  `${property}`,
                  `${respuesta?.obj?.fields[property]}`
                );
              }

              formData2.set("file", file);
              console.log(formData2, `${respuesta?.obj?.url}`);
              fetch(`${respuesta?.obj?.url}`, {
                method: "POST",
                body: formData2,
              }).then((res) => {
                if (res?.ok) {
                  setTimeout(() => {
                    EstadoArchivos().then((res) => {
                      if (typeof res != Object) {
                        if ("Motivo" in res?.[0]) {
                          closeModal();
                          if (res[0]["Estado"] === 1) {
                            notify(res[0]["Motivo"]);
                          } else {
                            notifyError(res[0]["Motivo"]);
                          }
                        } else {
                          notifyError("Consulte con soporte");
                        }
                      }
                    });
                  }, 3000);
                } else {
                  notifyError("No fue posible conectar con el Bucket");
                }
              });
            }
          }
        })
        .catch((err) => {
          notifyError("Error al cargar Datos");
        }); /* notify("Se ha comenzado la carga"); */
    },
    [file, fileName, archivo, tipoSorteo, fisiVirtual]
  );

  const { EstadoArchivos } = useLoteria();

  const notifyError = (msg) => {
    toast.warn(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const notify = (msg) => {
    toast.info(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };
  if (progress === 100) {
  }
  const onChange = (files) => {
    console.log(file);
    if (Array.isArray(Array.from(files))) {
      files = Array.from(files);
      if (files.length === 1) {
        const m_file = files[0];
        // console.log(m_file);
        setFile(m_file);
        setFileName(m_file.name);
      } else {
        if (files.length > 1) {
          notifyError("Se debe ingresar un solo archivo para subir");
        }
      }
    }
  };
  const [disabledBtns, setDisabledBtns] = useState(false);

  const onSubmit = (event) => {
    event.preventDefault();
    //saveFile();
    setShowModal(true);
    setDisabledBtns(false);
  };

  useEffect(() => {
    setProgress(0);
    setFile("");
    setFileName("");
  }, [archivo]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setProgress(0);
    setFile("");
    setFileName("");
  }, []);

  console.log(file && progress === 0);
  return (
    <>
      <div>
        <Select
          id="archivos"
          label="Archivo a subir"
          options={options}
          disabled={progress !== 0 && progress !== 100}
          value={archivo}
          onChange={(e) => {
            setArchivo(e.target.value);
            setProgress(0);
            setTipoSorteo("");
            setFisiVirtual("");
          }}
        />
        {archivo === "PlanDePremios" ||
        archivo === "Asignacion" ||
        archivo === "Resultados" ? (
          <Select
            id="tip_sorteo"
            label={`Tipo de sorteo para ${archivo}`}
            options={optionsTipoSorteo}
            disabled={progress !== 0 && progress !== 100}
            value={tipoSorteo}
            onChange={(e) => {
              setTipoSorteo(e.target.value);
            }}
          />
        ) : (
          ""
        )}
        {archivo !== "PlanDePremios" && tipoSorteo !== "" ? (
          <Select
            id="FisiVir"
            label={`${archivo} fisicos/Virtuales`}
            options={optionsFisiVir}
            disabled={progress !== 0 && progress !== 100}
            value={fisiVirtual}
            onChange={(e) => {
              setFisiVirtual(e.target.value);
            }}
          />
        ) : (
          ""
        )}
        {(archivo === "PlanDePremios" && tipoSorteo !== "") ||
        fisiVirtual !== "" ? (
          <Form formDir="col" onSubmit={onSubmit}>
            <InputX
              id={`archivo_${archivo}`}
              label={`Elegir archivo: ${
                options.find(({ value }) => {
                  return value === archivo;
                }).label
              }`}
              type="file"
              disabled={progress !== 0}
              accept=".txt,.csv"
              onGetFile={onChange}
            />
            {file && progress === 0 ? (
              <ButtonBar>
                <Button type="submit">Subir</Button>
              </ButtonBar>
            ) : (
              ""
            )}
          </Form>
        ) : (
          ""
        )}
        {file ? (
          <>
            <h1>
              {fileName} -{" "}
              {progress === 0
                ? "Listo para subir"
                : progress === 100
                ? "Subido"
                : "Subiendo"}
            </h1>
            <ProgressBar value={progress} max="100"></ProgressBar>
          </>
        ) : (
          ""
        )}
        <Modal show={showModal} handleClose={() => closeModal()}>
          <CargarForm
            selected={archivo}
            file={fileName}
            disabledBtns={disabledBtns}
            closeModal={closeModal}
            handleSubmit={() => {
              saveFile();
            }}
          />
        </Modal>
      </div>
    </>
  );
};

export default CargaArchivos;
