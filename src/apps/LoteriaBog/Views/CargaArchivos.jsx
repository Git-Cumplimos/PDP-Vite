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

const url_cargueS3 = `${process.env.REACT_APP_URL_LOTERIAS}/cargueS3`;

AWS.config.update({
  accessKeyId: process.env.REACT_APP_accessKeyId,
  secretAccessKey: process.env.REACT_APP_secretAccessKey,
});

const CargaArchivos = ({ route }) => {
  const { codigos_lot, setCodigos_lot } = useLoteria();

  const { label } = route;
  const options = [
    { value: "", label: "" },
    { value: "PlanDePremios", label: "Plan de premios" },
    { value: "Asignacion", label: "Asignacion" },
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
  const saveFile = () => {
    setDisabledBtns(true);
    const f = new Date();
    const params = {
      Body: file,
      Bucket: S3_BUCKET,
      Key: `${tipoSorteo}${archivo}/${fisiVirtual}${f.getDate()}${
        f.getMonth() + 1
      }${f.getFullYear()}${fileName}`,
    };
    bucket
      .putObject(params)
      .on("httpUploadProgress", (evt) => {
        setProgress(Math.round((evt.loaded / evt.total) * 100));
        setTimeout(() => {
          closeModal();
          EstadoArchivos().then((res) => {
            if (typeof res != Object) {
              if ("Motivo" in res?.[0]) {
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
      })
      .send((err) => {
        if (err)
          notifyError("Error con servicio de almacenamiento en la nube", err);
        console.log(err);
      });
  };
  //------------------Funcion Para Subir El Formulario---------------------//
  // const handleSubmit = useCallback(
  //   (e) => {
  //     e.preventDefault();
  //     if (
  //       (archivos1[0] && archivos2[0]) ||
  //       (archivos1[0] && archivos2[0] && archivos3[0])
  //     ) {
  //       fetchData(
  //         url_cargueS3,
  //         {},
  //         {},

  //         {},
  //         false
  //       )
  //         .then((respuesta) => {
  //           console.log(respuesta);
  //           const formData = new FormData();

  //           formData.set(fileName, file);

  //           notify("Se ha comenzado la carga");

  //           fetch(
  //             /*  `http://servicios-comercios-pdp-dev.us-east-2.elasticbeanstalk.com/uploadfile`, */
  //             `${process.env.REACT_APP_URL_SERVICE_PUBLIC_SS}/uploadfile2?id_proceso=${respuesta.body.id_proceso}`,
  //             {
  //               method: "GET",

  //               /* body: formData, */
  //             }
  //           )
  //             .then((res) => res.json())
  //             .then((respuesta) => {
  //               if (!respuesta?.status) {
  //                 notifyError(respuesta?.msg);
  //               } else {
  //                 console.log(respuesta?.obj);
  //                 notify("Se han subido los archivos");
  //                 setEstadoForm(true);
  //                 const formData2 = new FormData();
  //                 const formData3 = new FormData();
  //                 const formData4 = new FormData();

  //                 if (archivos1 && archivos2 && !archivos3) {
  //                   var cont_rut = 0;
  //                   for (const datosS3 of respuesta?.obj) {
  //                     if (cont_rut == 0) {
  //                       for (const property in datosS3.fields) {
  //                         /*  console.log(datosS3.fields[property]); */
  //                         formData2.set(
  //                           `${property}`,
  //                           `${datosS3.fields[property]}`
  //                         );
  //                       }
  //                     }
  //                     cont_rut += 1;
  //                   }
  //                   formData2.set("file", archivos1[0]);
  //                   fetch(`${respuesta?.obj[0]?.url}`, {
  //                     method: "POST",

  //                     body: formData2,
  //                   })
  //                     .then((res) => res?.status)
  //                     .catch((err) => {
  //                       {
  //                       }
  //                     });

  //                   //------fetch cc----//
  //                   var cont_Cc = 0;
  //                   for (const datosS3 of respuesta?.obj) {
  //                     if (cont_Cc == 1) {
  //                       for (const property in datosS3.fields) {
  //                         /* console.log(datosS3.fields[property]); */
  //                         formData3.set(
  //                           `${property}`,
  //                           `${datosS3.fields[property]}`
  //                         );
  //                       }
  //                     }
  //                     cont_Cc += 1;
  //                   }
  //                   formData3.set("file", archivos2[0]);
  //                   fetch(`${respuesta?.obj[1]?.url}`, {
  //                     method: "POST",
  //                     body: formData3,
  //                   })
  //                     .then((res) => res?.status)
  //                     .catch((err) => {
  //                       {
  //                       }
  //                     });
  //                 } else if (archivos1 && archivos2 && archivos3) {
  //                   var cont_rut = 0;
  //                   for (const datosS3 of respuesta?.obj) {
  //                     if (cont_rut == 0) {
  //                       for (const property in datosS3.fields) {
  //                         /* console.log(datosS3.fields[property]); */
  //                         formData2.set(
  //                           `${property}`,
  //                           `${datosS3.fields[property]}`
  //                         );
  //                       }
  //                     }
  //                     cont_rut += 1;
  //                   }
  //                   formData2.set("file", archivos1[0]);
  //                   fetch(`${respuesta?.obj[0]?.url}`, {
  //                     method: "POST",
  //                     body: formData2,
  //                   })
  //                     .then((res) => res?.status)
  //                     .catch((err) => {
  //                       {
  //                       }
  //                     });

  //                   //------fetch cc----//
  //                   var cont_Cc = 0;
  //                   for (const datosS3 of respuesta?.obj) {
  //                     if (cont_Cc == 1) {
  //                       for (const property in datosS3.fields) {
  //                         /*  console.log(datosS3.fields[property]); */
  //                         formData3.set(
  //                           `${property}`,
  //                           `${datosS3.fields[property]}`
  //                         );
  //                       }
  //                     }
  //                     cont_Cc += 1;
  //                   }
  //                   formData3.set("file", archivos2[0]);

  //                   fetch(`${respuesta?.obj[1]?.url}`, {
  //                     method: "POST",
  //                     body: formData3,
  //                   })
  //                     .then((res) => res?.status)
  //                     .catch((err) => {
  //                       {
  //                       }
  //                     });

  //                   //------fetch Camara y Comercio----//
  //                   var cont_cam = 0;
  //                   for (const datosS3 of respuesta?.obj) {
  //                     if (cont_cam == 2) {
  //                       for (const property in datosS3.fields) {
  //                         /* console.log(datosS3.fields[property]); */
  //                         formData4.set(
  //                           `${property}`,
  //                           `${datosS3.fields[property]}`
  //                         );
  //                       }
  //                     }
  //                     cont_cam += 1;
  //                   }
  //                   formData4.set("file", archivos3[0]);
  //                   fetch(`${respuesta?.obj[2]?.url}`, {
  //                     method: "POST",
  //                     body: formData4,
  //                   })
  //                     .then((res) => res?.status)
  //                     .catch((err) => {
  //                       {
  //                       }
  //                     });
  //                 }
  //                 /*     setEstadoForm(true); */
  //                 navigate("/public/solicitud-enrolamiento/consultar");
  //               }
  //             })
  //             .catch((err) => {
  //               notifyError("Error al cargar Datos");
  //             }); /* notify("Se ha comenzado la carga"); */
  //         })
  //         .catch((err) => {
  //           console.log(err);
  //           notifyError("Error al cargar Datos");
  //         }); /*  notify("Se ha comenzado la carga"); */
  //     } else {
  //       notifyError("Adjunte los Documentos");
  //     }
  //   },
  //   [file, fileName]
  // );

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
