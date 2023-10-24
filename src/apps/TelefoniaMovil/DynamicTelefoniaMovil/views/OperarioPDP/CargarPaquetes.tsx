import React, { useCallback, useRef, useState } from "react";

//--components--
import SimpleLoading from "../../../../../components/Base/FileInput/FileInput";
import FileInput from "../../../../../components/Base/FileInput/FileInput";
import Button from "../../../../../components/Base/Button/Button";
import Input from "../../../../../components/Base/Input/Input";

import classes from "./CargarPaquetes.module.css";
import { useImgs } from "../../../../../hooks/ImgsHooks";

type PropsCargaPaquetes = {
  BackendCargaPaquetes: () => Promise<any>;
};

const {
  contendorPrincipalFormulario,
  contenedorForm,
  contenedorInput,
  titulo,
  nombreInput,
  contenedorArchivos,
  contenedorLabel,
  divinferior,
  fileInput,
  divsuperior,
  contenedorBtns,
  contenedorArchivosBasura,
  nombreArchivoStyle,
  nombreLabel,
  btnBasura,
} = classes;

const urlAssets = process.env.REACT_APP_ASSETS_URL;

const CargarPaquetes = ({ operadorCurrent }: { operadorCurrent: any }) => {
  const { svgs }: any = useImgs();
  const [nombreDocumento, setNombreDocumento] = useState("");
  const [archivo, setArchivo] = useState<any[]>([]);
  const [disabledBtn, setDisabledBtn] = useState(false);
  const [procesandoValidacion, setProcesandoValidacion] = useState(false);
  const [type1, setType1] = useState([]);
  const inputRef = useRef("");
  //------------------Guardar Archivos PDF---------------------//
  const onFileChange = useCallback((files) => {
    console.log(files);
    if (Array.isArray(Array.from(files))) {
      files = Array.from(files);
      console.log(files);
      setArchivo(files);
      setNombreDocumento(files[0]?.name);
      setDisabledBtn(false);
      const tipo_archivo = files[0]?.type.toString();
      console.log(tipo_archivo);

      // console.log(!/^.*\.fil$/.test(files[0].name));
      // if (tipo_archivo !== "text/csv" && banco_minuscula === "davivienda") {
      //   // Muestra una notificación si la extensión del archivo es diferente de ".fil" o ".csv"
      //document.getElementById("contingencia").value = ""; // <- limpia el valor del campo de archivo

      //   setArchivo([]);
      //   setNombreDocumento("");
      //   notifyError("La extensión del archivo debe ser de tipo csv");
      //   return;
      // } else if (
      // tipo_archivo !== "text/plain" &&
      //   !/^.*\.fil$/.test(files[0].name) &&
      //   banco_minuscula === "bancolombia";
      // ) {
      //   document.getElementById("contingencia").value = ""; // <- limpia el valor del campo de archivo
      //   setArchivo([]);
      //   setNombreDocumento("");
      //   notifyError("La extensión del archivo debe ser de tipo .fil");
      //   return;
      // }
    }
  }, []);

  // const onFileChange = useCallback((e) => {
  //   const p: any[] = [];
  //   p[0] = e.target.files[0];

  //   console.log(p[0]);
  //   setArchivo(p);
  //   setNombreDocumento("rrr");
  //   setDisabledBtn(false);
  // }, []);

  const EliminarDocumento = useCallback((e) => {
    e.preventDefault();

    if (document.getElementById("contingencia") !== null) {
      (document.getElementById("contingencia") as HTMLInputElement).value = "";
    }
    // const y = document.getElementById("contingencia");
    // console.log(y?.click);
    //document.getElementById("contingencia").value = ""; // <- limpia el valor del campo de archivo

    if (inputRef.current) {
      console.log("tttttttttttttttt");
      inputRef.current = "";
    }
    setArchivo([]);
    // setNombreDocumento("");
    // setDisabledBtn(true);
  }, []);

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current = "";
    }
  };

  return (
    <div className="py-10 flex items-center flex-col">
      <img
        className="w-24  "
        src={
          operadorCurrent?.logo?.includes("http")
            ? operadorCurrent?.logo
            : svgs?.[operadorCurrent?.logo]
        }
      ></img>
      <FileInput
        id="contingencia"
        label={"pppppppppppppppppppppppp"}
        className={fileInput}
        onGetFile={onFileChange}
        accept=".csv"
        allowDrop={true}
      ></FileInput>
    </div>
    // <div className={contendorPrincipalFormulario}>
    //   {/* <SimpleLoading show={procesandoValidacion}></SimpleLoading> */}
    //   <form className={contenedorForm}>
    //     <div className={contenedorInput}>
    //       <h2 className={titulo}>{`Cargar archivo de paquetes`}</h2>
    //       <p className={nombreInput}>Adjuntar archivo de contingencia</p>
    //       <div className={contenedorArchivos}>
    //         <label className={contenedorLabel}>
    //           <div className={divinferior}>
    //             {/* <input type="file" onChange={onFileChange} /> */}
    //             <FileInput
    //               id="contingencia"
    //               label={" "}
    //               className={fileInput}
    //               onGetFile={onFileChange}
    //               accept=".csv"
    //               allowDrop={false}
    //             ></FileInput>
    //             <div className={divsuperior}></div>
    //           </div>

    //           <img src={`${urlAssets}/assets/img/btnAgregar.png`} alt="" />
    //         </label>
    //       </div>
    //       {archivo[0] ? (
    //         <label className={contenedorArchivosBasura}>
    //           <div className={nombreArchivoStyle}>
    //             <h5 className={nombreLabel}>{nombreDocumento}</h5>
    //           </div>

    //           <button
    //             className={btnBasura}
    //             onClick={(e) => EliminarDocumento(e)}
    //           >
    //             <img src={`${urlAssets}/assets/img/basura25negra.png`} />
    //           </button>
    //         </label>
    //       ) : (
    //         ""
    //       )}
    //     </div>
    //     <div></div>
    //   </form>
    //   <div className={contenedorBtns}>
    //     <Button
    //     // disabled={disabledBtn}
    //     // onClick={(e) => setShowModal(true)} /* type="submit" */
    //     /*  className={btnEnviar} */
    //     >
    //       Cargar archivo
    //     </Button>
    //   </div>
    // </div>
  );
};

export default CargarPaquetes;
