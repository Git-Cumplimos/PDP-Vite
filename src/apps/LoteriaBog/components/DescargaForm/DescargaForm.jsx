import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import { useLoteria } from "../../utils/LoteriaHooks";
import { useState } from "react";
import Table from "../../../../components/Base/Table";
import { notify, notifyError } from "../../../../utils/notify";
const DescargaForm = ({ closeModal, selected }) => {
  const { descargaVentas_S3 } = useLoteria();
  const [disabledBtns] = useState(false);
  const [urls, setUrls] = useState(false);

  // const onSubmit = (e) => {
  //   e.preventDefault();
  //   descargaVentas_S3(selected).then((res) => {
  //     if (res != undefined) {
  //       if (!("msg" in res)) {
  //         setUrls(res);
  //       } else {
  //         //notifyError(res.msg)
  //       }
  //     }
  //   });
  // };
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
      } else if (res === []) {
        closeModal()
        console.log("Entro al if de onSubmit y esto es urls", urls)
        notifyError("No existen archivos para descargar")
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
  return (
    <>

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
            </>
          ) : (
            ""
          )}

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
        </Form>
      </div>
    </>
  );
};

export default DescargaForm;