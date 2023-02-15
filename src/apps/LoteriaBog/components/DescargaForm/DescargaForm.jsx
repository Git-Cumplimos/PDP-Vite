import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import { useLoteria } from "../../utils/LoteriaHooks";
import { useCallback, useState } from "react";
import Table from "../../../../components/Base/Table";
import { notifyError } from "../../../../utils/notify";

const DescargaForm = ({ setShowModal, closeModal, selected }) => {
  const { descargaVentas_S3 } = useLoteria();
  const [disabledBtns] = useState(false);
  const [urls, setUrls] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    descargaVentas_S3(selected).then((res) => {
      if (res != undefined) {
        if (!("msg" in res)) {
          setUrls(res);
        } else {
          //notifyError(res.msg)
        }
      }
    });
  };
  const cerrarModal = () => {
    setShowModal(false);
    setUrls(false);
    notifyError("No existen datos")
  };
  return (
    <>
      {Array.isArray(urls) && urls.length > 0 ? (
        <div className="flex flex-col justify-center items-center mx-auto container">
          <Form onSubmit={onSubmit} grid>
            {Array.isArray(urls) && urls.length > 0 ? (
              <>
                <Table
                  headers={["Link de descarga"]}
                  data={urls.map(({ archivo, url }) => {
                    return {
                      archivo,
                    };
                  })}
                  onSelectRow={(_e, index) => {
                    window.open(urls[index].url, "_blank");
                  }}
                />
                <ButtonBar>
                  <Button
                    type="button"
                    onClick={() => {
                      closeModal();
                      setUrls(false);
                    }}
                  >
                    Cancelar
                  </Button>
                </ButtonBar>
              </>
            ) : null}
          </Form>
        </div>) : true ? (setShowModal(false), notifyError("No existen datos")) : ("")}
    </>
  );
};

export default DescargaForm;