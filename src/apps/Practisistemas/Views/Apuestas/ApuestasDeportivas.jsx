import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/AuthHooks";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Modal from "../../../../components/Base/Modal";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import Input from "../../../../components/Base/Input";
import { notify, notifyError } from "../../../../utils/notify";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { postConsultaCasasApuestas, postCasaApuestas, postInsertCasaApuestas, postDeleteCasaApuestas } from "../../utils/fetchServicioApuestas";
import Form from "../../../../components/Base/Form";

const ApuestasDeportivas = ({ subRoutes }) => {
  const [respuesta, setRespuesta] = useState(false);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [casas, setCasas] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const {roleInfo} = useAuth();
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [datosTrans, setDatosTrans] = useState({
    casaApuesta: "",
    inputCasa:"",
  });

  const tablaCasaApuestas = useMemo(() => {
    return [
      ...casas.map(({descripcion}) => {
        return {
          "Descripcion": descripcion,
        };
      }),
    ];
  }, [casas]);

  useEffect(() => {
    fecthTablaCasasApuestasPaginadoFunc();
  }, [datosTrans, page, limit]);

  const onSubmitCheck = (e) => {
    e.preventDefault();  
  };
  
  const fecthTablaCasasApuestasPaginadoFunc = () => {
    setRespuesta(true)
    postConsultaCasasApuestas({
      page,
      limit,
      casaApuesta: datosTrans.casaApuesta,
    })
      .then((autoArr) => {
        if (autoArr?.error_msg?.error_bd_logs?.description) {
          notifyError(autoArr?.error_msg.error_bd_logs.description);
        }
        setRespuesta(false)
        setMaxPages(autoArr?.maxPages);
        setCasas(autoArr?.response ?? []);
      })
      .catch((err) => console.error(err));
  };
  
  const onSelectHouse = useCallback(
    (e, i) => {
      setRespuesta(true)
      postCasaApuestas({
        idcomercio : roleInfo?.["id_comercio"],
        casaApuesta: casas[i]["descripcion"],
      })
        .then((response) => {
          setRespuesta(false)
          if (response.length != 0){
            navigate (
              "../apuestas-deportivas/Recargar",
              {
                state: {
                  casaApuesta: casas[i]["descripcion"],
                  producto: casas[i]["op"],
                },
              }
            )
          }
          else {
            postDeleteCasaApuestas({
              descripcion : casas[i]["descripcion"]
            })
              .then((response)=> {
                notify("La casa de apuestas "+casas[i]["descripcion"]+ " no tiene datos por mostrar");
                fecthTablaCasasApuestasPaginadoFunc();
              })
              .catch((err) => console.error(err));
          }
        })
        .catch((err) => console.error(err));
    },
    [navigate, casas]
  );

  const addNewHouse = () => {
    if (datosTrans?.inputCasa != ""){
      postConsultaCasasApuestas({
        page,
        limit,
        casaApuesta: datosTrans?.inputCasa,
      })
        .then((autoArr) => {
          if ( autoArr.response.length > 0 && autoArr.response[0].descripcion.toLowerCase() == datosTrans?.inputCasa.toLowerCase()){
            notify("Ya existe la casa de apuestas "+ datosTrans?.inputCasa)
            setDatosTrans((old)=>{
              return {
                ...old,
                inputCasa:"",
              }
            });
          }
          else{
            postCasaApuestas({
              idcomercio : roleInfo?.["id_comercio"],
              casaApuesta:  datosTrans?.inputCasa,
            })
              .then((res) => {
                if (res.response.length != 0){ 
                  postInsertCasaApuestas({
                    op : res.response[0]?.op,
                    isPack : res.response[0]?.isPack,
                    descripcion : res.response[0]?.desc
                  })
                    .then((resp)=> {
                      notify("Se agrego la casa de apuestas "+datosTrans?.inputCasa)
                      fecthTablaCasasApuestasPaginadoFunc();
                      setShowModal(false);
                      setDatosTrans((old)=>{
                        return {
                          ...old,
                          inputCasa:"",
                        }
                      });
                    })
                    .catch((err) => console.error(err));                             
                }
                else {
                  notify("La casa de apuestas " + datosTrans?.inputCasa +" no tiene datos por mostrar");
                  setDatosTrans((old)=>{
                    return {
                      ...old,
                      inputCasa:"",
                    }
                  });
                }
              })        
              .catch((err) => console.error(err)); 
          }
        })
        .catch((err) => console.error(err));       
    }
    else {
      notifyError("Debe completar los campos")
    }    
  };

  const handleClose = useCallback(() => {
    setShowModal(false);
    notify("Creación de nueva Casa de Apuestas cancelada")
    navigate("../apuestas-deportivas");
  }, []);

  return (
    <>
      <SimpleLoading show={respuesta} />
      <h1 className='text-3xl text-center'>
        Servicios de Apuestas Deportivas
      </h1>
      {/* <ButtonBar>
        <Button
          type="submit"
          onClick={() => {
            setShowModal(true);
          }}
        >
          Crear Casa de Apuestas Deportivas
        </Button>
      </ButtonBar> */}
      <TableEnterprise
        title='Tabla Casas de Apuestas Deportivas'
        maxPage={maxPages}
        headers={["Nombre"]}
        data={tablaCasaApuestas}
        onSelectRow={onSelectHouse}
        onSetPageData={setPageData}
      >
        <Input
          id='searchConvenio'
          name='searchConvenio'
          label={"Nombre Casa de Apuesta Deportiva"}
          minLength='1'
          maxLength='30'
          type='text'
          autoComplete='off'
          onInput={(e) => {
            setDatosTrans((old) => {
              return {...old, casaApuesta: e.target.value};
            });
          }}
        />
      </TableEnterprise>
      <Modal show={showModal}>
        <PaymentSummary
            title="Agregar nueva Casa de Apuestas"
            subtitle="Ingresar los siguientes datos :"
            >  
          <Form onSubmit={onSubmitCheck} grid>
            <Input
              id="nombreCasa"
              label="Nombre Casa de Apuestas"
              required
              type="text"
              minLength="3"
              autoComplete="off"
              value={datosTrans?.inputCasa}
              onInput={(e) => {
                setDatosTrans((old) => {
                  return {...old, inputCasa: e.target.value};
                });
              }}
              />
          </Form>
            <ButtonBar>
              <Button type={'button'} onClick={handleClose} >Cancelar</Button>
              <Button type={"submit"} onClick = {addNewHouse} >Aceptar</Button>
            </ButtonBar>
        </PaymentSummary>
      </Modal>
    </>
  );
};

export default ApuestasDeportivas;


