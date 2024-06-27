import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchCustom } from "../../utils/fetchComerciosBCS";
import TableEnterprise from "../../../../components/Base/TableEnterprise/TableEnterprise";
import Input from "../../../../components/Base/Input/Input";
import { useFetch } from "../../../../hooks/useFetch";
import Modal from "../../../../components/Base/Modal/Modal";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../../components/Base/Button/Button";
import { notifyError,notify } from "../../../../utils/notify";

const URL_CONSULTA_COMERCIOS_BLOQUEADOS = `${import.meta.env.VITE_URL_SERVICE_COMMERCE}`;
// const URL_CONSULTA_COMERCIOS_BLOQUEADOS = `http://127.0.0.1:5000`;

const ConsultaComerciosRechazados = () => {
  const [dataComercios, setDataComercios] = useState({
    id_comercio: "",
    name_comercio:"",
  });
  const [Comercios, setComercios] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [showModal, setShowModal] = useState(false);
  const [idDelete, setIdDelete] = useState({pk_comercio: ''});

  const tableComercio = useMemo(() => {
    return [
      ...Comercios.map(
        ({
          pk_comercio,
          descripcion,
        }) => {
          return {
            pk_comercio: pk_comercio,
            descripcion: descripcion ?? "",
          };  
        }
      ),
    ];
  }, [Comercios]);

  const [loadingPeticionConsultaConvenios, peticionConsultaConvenios] = useFetch(
    fetchCustom(`${URL_CONSULTA_COMERCIOS_BLOQUEADOS}/comercios_bloqueados/consultar_comercios`, "POST", "Consultar comercios bloqueados")
  );

  const [loadingPeticionEliminarComercio, peticionEliminarComercio] = useFetch(
    fetchCustom(`${URL_CONSULTA_COMERCIOS_BLOQUEADOS}/comercios_bloqueados/delete_comercio_bloqueado`, "POST", "Eliminar comercio bloqueado")
  );

  const fetchComerciosFunc = useCallback(() => {
      let obj = {};
      if (dataComercios.id_comercio) obj["pk_comercio"] = dataComercios.id_comercio;
      if (dataComercios.name_comercio) obj["descripcion"] = dataComercios.name_comercio;
      peticionConsultaConvenios({},{
        ...obj,
        page,
        limit,
        sortBy: "pk_comercio",
        sortDir: "DESC",
      })
        .then((autoArr) => {
          setMaxPages(autoArr?.obj?.maxPages);
          setComercios(autoArr?.obj?.results ?? []);
        })
        .catch((err) => console.error(err));
    }, [page, limit, dataComercios]);

  const delComercio = useCallback(() => {
    peticionEliminarComercio({},idDelete)
      .then((res) => {
        if (res?.status) {
          notify(res?.msg)
        }else{
          notifyError(res?.msg);
        }
        setShowModal(false);
      })
      .catch((err) => {
        if (err?.cause === "custom") {
          notifyError(err?.message);
          return;
        }
        console.error(err?.message);
        notifyError("Peticion fallida");
      });
  },[peticionEliminarComercio,idDelete]);

  useEffect(() => {
    fetchComerciosFunc();
  }, [dataComercios,page,limit,showModal]);

  const handleClose = useCallback(() => {
    setShowModal(false);
    notify('El usuario cancelo la eliminación del registro')
  }, []);

  const ShowAlert = useCallback((val) => {
    setIdDelete((old) => {return{...old, pk_comercio:val.pk_comercio}})
    setShowModal(true)
  },[]);

  return (
    <>
      <TableEnterprise
        title={'Comercios Rechazados'}
        maxPage={maxPages}
        headers={['Id Comercio','Nombre Comercio']}
        data={tableComercio}
        onSelectRow={(_e, index) => {
          ShowAlert(tableComercio[index])}}
        onSetPageData={setPageData}>
        <Input
          id='id_comercio'
          label='Id Comercio'
          type='text'
          name='id_comercio'
          maxLength='15'
          value={dataComercios.id_comercio}
          onChange={(e) => {
            if (!isNaN(e.target.value)) {
              const valor = e.target.value;
              const num = valor.replace(/[^\d]/g, '');
              setDataComercios((old) => {
                return { ...old, id_comercio: num };
              });
            }
          }}
        ></Input>
        <Input
          id='name_comercio'
          label='Nombre Comercio'
          type='text'
          name='name_comercio'
          maxLength='30'
          value={dataComercios.name_comercio}
          onInput={(e) => {
            const valor = e.target.value;
            setDataComercios((old) => {
              return { ...old, name_comercio: valor };
            });
          }}
        ></Input>
      </TableEnterprise>
      <Modal
        show={showModal}
        handleClose={handleClose}
        className='flex align-middle'>
        <>
          <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
            <h1 className='text-2xl text-center mb-5 font-semibold'>
              ¿Está seguro que desea eliminar el registro del comercio de la lista de rechazados?
            </h1>
            <>
              <ButtonBar>
                <Button onClick={() => {handleClose()}}
                  disabled={              
                    loadingPeticionConsultaConvenios ||
                    loadingPeticionEliminarComercio}
                  >
                  Cancelar
                </Button>
                <Button type='submit' onClick={() => delComercio()}
                  disabled={              
                    loadingPeticionConsultaConvenios ||
                    loadingPeticionEliminarComercio}
                  >
                  Aceptar
                </Button>
              </ButtonBar>
            </>
          </div>
        </>
      </Modal>
    </>
  );
};

export default ConsultaComerciosRechazados;
