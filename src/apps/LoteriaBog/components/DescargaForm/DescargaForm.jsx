import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import { useLoteria } from "../../utils/LoteriaHooks";
import { useState } from "react";
import Table from "../../../../components/Base/Table";
import { notifyError } from "../../../../utils/notify";

const DescargaForm = ({ closeModal, urls, setUrls }) => {
  const { descargaVentas_S3 } = useLoteria();
  const [disabledBtns] = useState(false);

  return (
    <>
      <div className="flex flex-col justify-center items-center mx-auto container">
        <Form grid>
          {Array.isArray(urls) && urls.length > 0 ? (
            <>
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
                    notifyError("Se canceló la descarga de archivos")
                  }}
                >
                  Cancelar
                </Button>
              </ButtonBar>
            </>
          ) : (
            ""
          )}
        </Form>
      </div>
    </>
  );
};

export default DescargaForm;