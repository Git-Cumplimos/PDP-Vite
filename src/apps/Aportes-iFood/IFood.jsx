import { useCallback, useState } from "react";
import ButtonBar from "../../components/Base/ButtonBar/ButtonBar";
import Button from "../../components/Base/Button";
import FileInput from "../../components/Base/FileInput";
import Modal from "../../components/Base/Modal";

const IFood = () => {
  const [file, setFile] = useState([]);
  const [modal, setModal] = useState(false);
  const onFileChange = useCallback((files) => {
    files = Array.from(files);
    setFile(files);
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
          <h1>Nombre archivo:{file?.[0]?.name}</h1>
          <button onClick={setModal(true)}>Pagar</button>
        </div>
      )}
      <Modal show={modal} handleClose></Modal>
    </div>
  );
};

export default IFood;
