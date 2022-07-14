import { useCallback, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/Base/Button";
import FileInput from "../../components/Base/FileInput";
import Modal from "../../components/Base/Modal";
import PaymentSummary from "../../components/Compound/PaymentSummary";
import { notifyError, notify } from "../../utils/notify";
import { cargaArchivosS3 } from "./utils/fetchIfood";

const IFood = () => {
  const [file, setFile] = useState([]);
  const [modal, setModal] = useState(false);
  const [flag, setFlag] = useState(false);
  const [type, setType] = useState("");
  const [pagead, setPagead] = useState(false);
  const [loaded, setLoaded] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const onFileChange = useCallback((files) => {
    setFlag(true);
    files = Array.from(files);
    setFile(files);
    setSelectedFile(files[0]);
  });

  const urlService = "";

  let reader = new FileReader();
  reader.onload = function (e) {
    csvToArray(e.target.result);
  };

  function csvToArray(str, delimiter = "|") {
    const rows = str.slice(0).split("\n");

    const arr = rows.map(function (row) {
      const values = row.split(delimiter);
      return values;
    });
    try {
      if (arr[0][6].length <= 4) {
        setType("Voluntario");
      } else {
        setType("Obligatorio");
      }
    } catch {
      setType("Error");
    }

    arr.pop();
    let headers = [
      "id_driver",
      "tipo_doc",
      "documento",
      "nombre",
      "ciudad",
      "celular",
      "tipo_aporte",
      "aporte",
    ];
    arr.unshift(headers);
    let keys = arr[0];

    let newArr = arr.slice(1, arr.length);

    let formatted = [],
      data = newArr,
      cols = keys,
      l = cols.length;
    for (let i = 0; i < data.length; i++) {
      let d = data[i],
        o = {};
      for (let j = 0; j < l; j++) o[cols[j]] = d[j];
      formatted.push(o);
    }
    setLoaded(formatted);
    setPagead(true);
    setFlag(false);
    return arr;
  }

  useEffect(() => {
    if (flag) {
      try {
        reader.readAsText(selectedFile);
      } catch {
        setFlag(false);
      }
    }
  }, [flag, selectedFile]);

  const subirArchivos = useCallback(async (file) => {
    let formData = new FormData();
    try {
      cargaArchivosS3
        .then((res) => {
          if (res?.status) {
            for (const key in res?.obj?.fields) {
              formData.set(`${key}`, `${res?.obj?.fields[key]}`);
            }
            formData.set("file", file);
            fetch(res?.obj?.url, {
              body: formData,
              method: "POST",
            })
              .then((res) => {
                console.log(res);
              })
              .catch((err) => {
                console.log(err);
                notify(
                  "Se ha subido el archivo y se estan procesando los pagos"
                );
              });
          } else {
            notifyError("Se ha producido un error");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      setModal(false);
    }
  });

  return (
    <div>
      <FileInput
        label={"Elegir archivo"}
        onGetFile={onFileChange}
        name="file"
        accept=".csv,.xlsx"
        allowDrop={true}
      />
      {file.length > 0 && (
        <div>
          <h1>Archivo cargado: {selectedFile?.name}</h1>
          <Button onClick={() => setModal(true)}>Pagar</Button>
        </div>
      )}
      <Modal
        show={modal}
        handleClose={() => {
          setModal(false);
          setFile([]);
          setSelectedFile([]);
          navigate("/pagos-ifood");
        }}
      >
        <PaymentSummary
          title="Pago de aportes en linea iFood"
          summaryTrx={{
            "Cantidad de registros": `El archivo contiene ${loaded?.length}`,
          }}
        ></PaymentSummary>
        <Button>Subir Archivo y pagar</Button>
      </Modal>
    </div>
  );
};

export default IFood;
