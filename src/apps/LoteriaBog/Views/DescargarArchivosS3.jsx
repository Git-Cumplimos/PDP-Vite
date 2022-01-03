import { useState, useCallback } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import { useLoteria } from "../utils/LoteriaHooks";
import Form from "../../../components/Base/Form/Form";
import Table from "../../../components/Base/Table/Table";
import Input from "../../../components/Base/Input/Input";
import Modal from "../../../components/Base/Modal/Modal";
import DescargaForm from "../components/DescargaForm/DescargaForm";
import SubPage from "../../../components/Base/SubPage/SubPage";
import { useAuth } from "../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../utils/notify";

const DescargarArchivosS3 = ({ route }) => {
  const { label } = route;

  const [page, setPage] = useState(1);
  const [maxPages, setMaxPages] = useState(1);
  const [sorteo, setSorteo] = useState("");
  const [fecha_ini, setFecha_ini] = useState("");
  const [fecha_fin, setFecha_fin] = useState("");
  const [resp_con_sort, setResp_con_sort] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { con_SortVentas_S3 } = useLoteria();

 

  // const con_sort = (e) => {

  //   con_SortVentas_S3(sorteo,fecha_ini,fecha_fin,page).then((res) => {
  //
  //     if(!('msg' in res)){
  //       setResp_con_sort(res.info)
  //       setMaxPages(res.num_datos)
  //     }
  //     else{
  //       notifyError(res.msg)
  //     }
  //   });
  //   };
  // }

  const closeModal = useCallback(async () => {
    setShowModal(false);
  }, []);

  console.log(resp_con_sort);
  console.log(typeof resp_con_sort);
  return (
    <SubPage label={label}>
      <div>
        <Form grid>
          <Input
            id="num_sorteo"
            label="Numero de sorteo"
            type="search"
            minLength="1"
            maxLength="4"
            autoComplete="false"
            value={sorteo}
            onInput={(e) => {
              if (!isNaN(e.target.value)) {
                setFecha_ini("");
                setFecha_fin("");
                setSorteo(e.target.value);
              }
            }}
            onLazyInput={{
              callback: (e) => {
                if (e.target.value !== "") {
                  con_SortVentas_S3(e.target.value, null, null, page).then(
                    (res) => {
                      if (!("msg" in res)) {
                        setResp_con_sort(res.info);
                        setMaxPages(res.num_datos);
                      } else {
                        notifyError(res.msg);
                        setResp_con_sort("");
                      }
                    }
                  );
                }
              },
              timeOut: 500,
            }}
          />
          {sorteo === "" ? (
            <>
              <div className="flex flex-row justify-center w-full">
                {/* <hr className="border-black flex-auto" /> */}Ó
                {/* <hr className="border-black flex-auto" /> */}
              </div>

              <Input
                id="dateInit"
                label="Fecha inicial"
                type="date"
                value={fecha_ini}
                onInput={(e) => {
                  setFecha_ini(e.target.value);
                }}
                onLazyInput={{
                  callback: (e) => {
                    if (fecha_fin !== "") {
                      con_SortVentas_S3(
                        sorteo,
                        e.target.value,
                        fecha_fin,
                        page
                      ).then((res) => {
                        if (!("msg" in res)) {
                          setResp_con_sort(res.info);
                          setMaxPages(res.num_datos);
                        } else {
                          notifyError(res.msg);
                        }
                      });
                    }
                  },
                  timeOut: 500,
                }}
              />
              <Input
                id="dateEnd"
                label="Fecha final"
                type="date"
                value={fecha_fin}
                onInput={(e) => {
                  setFecha_fin(e.target.value);
                }}
                onLazyInput={{
                  callback: (e) => {
                    if (fecha_ini !== "") {
                      con_SortVentas_S3(
                        sorteo,
                        fecha_ini,
                        e.target.value,
                        page
                      ).then((res) => {
                        if (!("msg" in res)) {
                          setResp_con_sort(res.info);
                          setMaxPages(res.num_datos);
                        } else {
                          notifyError(res.msg);
                        }
                      });
                    }
                  },
                  timeOut: 500,
                }}
              />
            </>
          ) : (
            ""
          )}
          <ButtonBar className="col-span-1 md:col-span-2">
            <Button
              type="button"
              disabled={page < 2}
              onClick={() => {
                setPage(page - 1);
                con_SortVentas_S3(sorteo, fecha_ini, fecha_fin, page - 1).then(
                  (res) => {
                    if (!("msg" in res)) {
                      setResp_con_sort(res.info);
                      setMaxPages(res.num_datos);
                    } else {
                      notifyError(res.msg);
                    }
                  }
                );
              }}
            >
              Anterior
            </Button>
            <Button
              type="button"
              disabled={page >= maxPages}
              onClick={() => {
                setPage(page + 1);
                con_SortVentas_S3(sorteo, fecha_ini, fecha_fin, page + 1).then(
                  (res) => {
                    if (!("msg" in res)) {
                      setResp_con_sort(res.info);
                      setMaxPages(res.num_datos);
                    } else {
                      notifyError(res.msg);
                    }
                  }
                );
              }}
            >
              Siguiente
            </Button>
          </ButtonBar>
        </Form>
        {Array.isArray(resp_con_sort) && resp_con_sort.length > 0 ? (
          <>
            <div className="flex flex-row justify-evenly w-full my-4">
              <h1>Pagina: {page}</h1>
              <h1>Ultima pagina: {maxPages}</h1>
            </div>
            <Table
              headers={["Sorteo", "Fecha de juego"]}
              data={resp_con_sort.map(({ num_sorteo, fecha_juego }) => {
                return {
                  num_sorteo,
                  fecha_juego,
                };
              })}
              onSelectRow={(_e, index) => {
                setSelected(resp_con_sort[index]);
                setShowModal(true);
              }}
            />
          </>
        ) : (
          ""
        )}
        <Modal show={showModal} handleClose={closeModal}>
          <DescargaForm closeModal={closeModal} selected={selected} />
        </Modal>
      </div>
    </SubPage>
  );
};

export default DescargarArchivosS3;
