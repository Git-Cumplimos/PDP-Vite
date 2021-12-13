import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import { useLoteria } from "../../utils/LoteriaHooks";
import { useState } from "react";
import {toast}  from "react-toastify";
import Input from "../../../../components/Base/Input/Input";
import Table from "../../../../components/Base/Table/Table";

const DescargaForm = ({

  closeModal,
  selected,
 

}) => {

  const {descargaVentas_S3} = useLoteria();
  const [disabledBtns, setDisabledBtns] = useState(false);
  const [urls, setUrls] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    descargaVentas_S3(selected).then((res) => {
                    
      if(!('msg' in res)){
        setUrls(res)
      }
      else{
        //notifyError(res.msg)
      }
    });

    
  }

  
  
 


  console.log(urls)
  return (
    <>

      <div className="flex flex-col justify-center items-center mx-auto container">
        <Form  onSubmit={onSubmit} grid>
            <div
              className="flex flex-row justify-between text-lg font-medium grid"
            >
             <h1>Desea descargar los archivos de ventas del sorteo {selected?.num_sorteo}</h1>
             <h1>Fecha de juego: {selected?.fecha_juego}</h1>              
            </div>

            {Array.isArray(urls) && urls.length > 0 ? (
        <>
          {/* <div className="flex flex-row justify-evenly w-full my-4">
            <h1>Pagina: {page}</h1>
            <h1>Ultima pagina: {maxPages}</h1>
          </div> */}
          {/* <Table
            headers={["Link de descarga"]}
            data={urls.map(({ archivo, url }) => {              
              return {
                archivo,
              };
            })}
            onSelectRow={(_e, index) => {
              console.log(urls[index].url);
              
              // setSelected(urls[index]);
              // setShowModal(true);
            }}
          /> */}
          <table>
            <thead>
              <tr>Link de descarga</tr>
            </thead>
            <tbody>
              {urls.map((url) => {
                console.log(url.url)
                return(
                <tr>
                  <a
                  href={url.url}
                  target="_blank"
                  rel="noreferrer" 
                  >
                    {url.archivo}
                  </a>
                </tr>)
              })}
            </tbody>

          </table>
        </>
      ) : (
        ""
      )}
                       
        
          <ButtonBar>
            <Button type="submit" disabled={disabledBtns}>Descargar</Button>
            <Button
              type="button"
              onClick={() => {
                closeModal();
                
               
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
