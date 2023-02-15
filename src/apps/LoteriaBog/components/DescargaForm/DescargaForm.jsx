import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import { useLoteria } from "../../utils/LoteriaHooks";
import { useCallback, useEffect, useState } from "react";
import Table from "../../../../components/Base/Table";
import { notify, notifyError } from "../../../../utils/notify";

const DescargaForm = ({ setShowModal, closeModal, selected, showModal }) => {
  const { descargaVentas_S3 } = useLoteria();
  const [disabledBtns] = useState(false);
  const [urls, setUrls] = useState(false);

  const onSubmit = () => {
    // e.preventDefault();
    console.log("Entro al onSubmit")
    descargaVentas_S3(selected).then((res) => {
      if (res !== undefined) {
        console.log("Entro al if de onSubmit y esto es res", res)
        if (!("msg" in res)) {
          console.log("Entro al segundo if de onSubmit y esto es res", res)
          // Si no llega el mensaje el setea res
          setUrls(res);
          setShowModal(true)
          if (res?.length > 0) {
            notifyError("Si exiten datos para descargar")
          }
        } else {
          console.log("Entro al else del segundo if de onSubmit y esto es res", res)
          //notifyError(res.msg)
        }
      }
    });
  };
  // if (showModal) {
  //   descargaVentas_S3(selected).then((res) => {
  //     console.log("ESTO ES res", res)
  //     if (res !== undefined) {
  //       console.log("Entro al if y esto es res", res)
  //       if (!("msg" in res)) {
  //         console.log("Entro al segundo if y esto es res", res)
  //         // Si no llega el mensaje el setea res
  //         setUrls(res);
  //         if (res === []) {

  //           notifyError("No existen archivos para descargar")
  //           console.log("ENTRO AL IF QUE ESTA SOLO", res)
  //         }
  //       } else {
  //         //notifyError(res.msg)
  //       }
  //     }
  //   });
  // }
  // const cerrarModal = () => {
  //   console.log("Entro a cerrar el modal y ESTO ES urls", urls)
  //   closeModal()
  // }
  const cerrarModal = useCallback(async () => {
    closeModal();
    setUrls(false);
  }, []);
  useEffect(() => {
    onSubmit()
  }, [selected]);
  console.log("ESTO ES urls", urls, selected)
  return (
    <>
      {Array?.isArray(urls) && urls?.length > 0 ? (
        onSubmit(),
        <div className="flex flex-col justify-center items-center mx-auto container">
          {console.log("Entro a donde deberia entrar", urls)}
          <Form onSubmit={onSubmit} grid>
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
        setShowModal(false), notifyError("No existen datos")
      )}
      {/* {urls?.length == 0 ? notifyError("No existen archivos para descargar diferente") : "entro"} */}
    </>
  );
};

export default DescargaForm;
