import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import { useLoteria } from "../../utils/LoteriaHooks";
import { useState } from "react";
import Table from "../../../../components/Base/Table";
import { notifyError } from "../../../../utils/notify";

const DescargaForm = ({ closeModal, selected, showModal }) => {
  const { descargaVentas_S3 } = useLoteria();
  const [disabledBtns] = useState(false);
  const [urls, setUrls] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    descargaVentas_S3(selected).then((res) => {
      if (res != undefined) {
        if (!("msg" in res)) {
          // Si no llega el mensaje el setea res
          setUrls(res);
        } else {
          //notifyError(res.msg)
        }
      }
    });
  };
  if (showModal) {
    descargaVentas_S3(selected).then((res) => {
      if (res != undefined) {
        if (!("msg" in res)) {
          // Si no llega el mensaje el setea res
          setUrls(res);
        } else {
          //notifyError(res.msg)
        }
      }
    });
  }
  return (
    <>
      {Array.isArray(urls) && urls.length > 0 ? (
        <div className="flex flex-col justify-center items-center mx-auto container">
          <Form onSubmit={onSubmit} grid>
            <div className="flex flex-row text-lg font-medium text-center items-center justify-center">
              <h1 className="text-center">
                ¿Desea descargar los archivos de ventas del sorteo{" "}
                {selected?.num_sorteo}?
              </h1>
            </div>
            {/* <div className="flex flex-row justify-evenly w-full my-4">
            <h1>Pagina: {page}</h1>
            <h1>Ultima pagina: {maxPages}</h1>
          </div> */}
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
                  notifyError("Se canceló la descarga de los archivos")
                }}
              >
                Cancelar
              </Button>
            </ButtonBar>
          </Form>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center mx-auto container"><h1>
          No existen archivos para descargar
        </h1></div>
      )}
    </>
  );
};

export default DescargaForm;
