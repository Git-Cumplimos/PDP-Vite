import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import { useLoteria } from "../../utils/LoteriaHooks";
import { useState } from "react";
import Table from "../../../../components/Base/Table";
import { notify, notifyError } from "../../../../utils/notify";

const DescargaForm = ({ closeModal, selected, showModal }) => {
  const { descargaVentas_S3 } = useLoteria();
  const [disabledBtns] = useState(false);
  const [urls, setUrls] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("Entro al onSubmit")
    descargaVentas_S3(selected).then((res) => {
      if (res !== undefined) {
        console.log("Entro al if de onSubmit y esto es res", res)
        if (!("msg" in res)) {
          console.log("Entro al segundo if de onSubmit y esto es res", res)
          // Si no llega el mensaje el setea res
          setUrls(res);
        } else {
          console.log("Entro al else del segundo if de onSubmit y esto es res", res)
          //notifyError(res.msg)
        }
      }
    });
  };
  if (showModal) {
    descargaVentas_S3(selected).then((res) => {
      console.log("ESTO ES res", res)
      if (res !== undefined) {
        console.log("Entro al if y esto es res", res)
        if (!("msg" in res)) {
          console.log("Entro al segundo if y esto es res", res)
          // Si no llega el mensaje el setea res
          setUrls(res);
        } else {
          //notifyError(res.msg)
        }
      }
    });
  }
  const cerrarModal = () => {
    console.log("Entro a cerrar el modal")

    closeModal()
  }
  return (
    <>
      {Array?.isArray(urls) && urls?.length > 0 ? (
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
              data={urls?.map(({ archivo, url }) => {
                return {
                  archivo,
                };
              })}
              onSelectRow={(_e, index) => {
                window.open(urls[index]?.url, "_blank");
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
        cerrarModal(),
        notifyError("No existen archivos para descargar")
      )}
      {urls?.length == 0 ? notifyError("No existen archivos para descargar") : "entro"}
    </>
  );
};

export default DescargaForm;
