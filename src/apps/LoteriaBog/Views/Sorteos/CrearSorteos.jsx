import { useEffect, useState, useCallback, useMemo } from "react";
import Form from "../../../../components/Base/Form";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
import Modal from "../../../../components/Base/Modal";
import SortForm from "../../components/SortForm/SortForm";
import CloseForm from "../../components/SortForm/CloseForm";
import { useLoteria } from "../../utils/LoteriaHooks";
import SubPage from "../../../../components/Base/SubPage/SubPage";
import { useAuth } from "../../../../hooks/AuthHooks";
import fetchData from "../../../../utils/fetchData";
import { notify, notifyError } from "../../../../utils/notify";
import ParamsForm from "../../components/ParamsFomr/ParamsForm";

const url_consultaParams = `${process.env.REACT_APP_URL_LOTERIAS}/con_params`;

const CrearSorteos = ({ route }) => {
  const { label } = route;
  //const { notifyError, notify } = useAuth();
  const { ConsultaCrearSort, codigos_lot, setCodigos_lot } = useLoteria();
  const [resp_con, setResp_con] = useState(null);
  const [tip_sorteo, setTip_sorteo] = useState(null);
  const [sorteo, setSorteo] = useState(null);
  const [num_loteria, setNum_loteria] = useState(null);
  const [params, setParams] = useState(null);

  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [showparams, setShowparams] = useState(false);
  const [disabledBtns, setDisabledBtns] = useState(false);
  const [disable_botoOrdinario, setDisable_botoOrdinario] = useState(false);
  const [disable_botoExtra, setDisable_botoExtra] = useState(false);
  const [disabled_params, setDisabled_params] = useState(false);

  const [day, setDay] = useState(null);

  const sorteosLOT = useMemo(() => {
    var cod = "";
    if (codigos_lot?.length === 2) {
      cod = `${codigos_lot?.[0]?.cod_loteria},${codigos_lot?.[1]?.cod_loteria}`;
    } else {
      cod = `${codigos_lot?.[0]?.cod_loteria}`;
    }
    return cod;
  }, [codigos_lot]);

  // const sorteoOrdi = codigosLot[0];
  // const sorteoExtra = codigosLot[1];
  // const sorteosLOT = `${sorteoOrdi},${sorteoExtra}`;
  useEffect(() => {
    //Consulta sorteos de Lotería de Bogotá
    ConsultaCrearSort(sorteosLOT).then((res) => {
      setResp_con(res);
    });
    setDay(new Date().getDay());
  }, [sorteosLOT, disable_botoOrdinario, disabledBtns, disable_botoExtra, ConsultaCrearSort]);

  const onSubmit3 = (e) => {
    setTip_sorteo(2);
    setShowModal2(true);
    setDisabledBtns(false);
    setDisable_botoExtra(true);
  };

  const onSubmit4 = (e) => {
    setTip_sorteo(1);
    setShowModal2(true);
    setDisabledBtns(false);
    setDisable_botoOrdinario(true);
  };

  const closeModal = useCallback(() => {
    setShowModal1(false);
    //Consulta sorteos de Lotería de Bogotá
    ConsultaCrearSort(sorteosLOT).then((res) => {
      setResp_con(res);
    });
  });

  const closeModal2 = useCallback(() => {
    setShowModal2(false);
    //Consulta sorteos de Lotería de Bogotá
    ConsultaCrearSort(sorteosLOT).then((res) => {
      setResp_con(res);
    });
  });

  const onSubmit1 = (e) => {
    e.preventDefault();
    setTip_sorteo(1);
    setSorteo(String(parseInt(resp_con?.ordinario.num_sorteo) + 1));
    setNum_loteria(resp_con?.ordinario.num_loteria);
    setShowModal1(true);
    setDisable_botoOrdinario(false);
  };

  const onSubmit2 = (e) => {
    e.preventDefault();
    setTip_sorteo(2);
    setSorteo(String(parseInt(resp_con?.extra.num_sorteo) + 1));
    setNum_loteria(resp_con?.extra.num_loteria);
    setShowModal1(true);
    setDisable_botoExtra(false);
  };

  const con_params = useCallback(async () => {
    try {
      const res = await fetchData(url_consultaParams, "GET", {});
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  const closeparams = useCallback(() => {
    setShowparams(false);
    setParams(null);
  });
  return (
    <>
      <div>
        {resp_con?.extra?.Cerrar ? (
          <ButtonBar>
            <Button
              type="button"
              onClick={() => {
                onSubmit3();
              }}
              disabled={disable_botoExtra}
            >
              Cerrar sorteo extraordinario
            </Button>
          </ButtonBar>
        ) : (
          ""
        )}

        {resp_con?.ordinario?.Cerrar ? (
          <ButtonBar>
            <Button
              type="button"
              onClick={() => {
                onSubmit4();
              }}
              disabled={disable_botoOrdinario}
            >
              Cerrar sorteo ordinario
            </Button>
          </ButtonBar>
        ) : (
          ""
        )}

        {resp_con?.ordinario?.num_loteria !== undefined ? (
          <Form formDir="col" onSubmit={onSubmit1}>
            <ButtonBar>
              <Button type="submit" disabled={disabledBtns}>
                Crear sorteo ordinario
              </Button>
            </ButtonBar>
          </Form>
        ) : (
          ""
        )}
        {resp_con?.extra?.num_loteria !== undefined ? (
          <Form formDir="col" onSubmit={onSubmit2}>
            <ButtonBar>
              <Button type="submit" disabled={disabledBtns}>
                Crear sorteo extraordinario
              </Button>
            </ButtonBar>
          </Form>
        ) : (
          ""
        )}
        <ButtonBar>
          <Button
            type="button"
            onClick={() => {
              con_params().then((res) => {
                if ("msg" in res) {
                  notifyError(res.msg);
                  setDisabledBtns(true);
                } else {
                  setParams(res);
                  setDisabled_params(false);
                  setShowparams(true);
                }
              });
            }}
            disabled={disabled_params}
          >
            Parametrización
          </Button>
        </ButtonBar>
        <Modal show={showModal1} handleClose={() => closeModal()}>
          <SortForm
            closeModal={closeModal}
            tip_sorteo={tip_sorteo}
            sorteo={sorteo}
            setSorteo={setSorteo}
            num_loteria={num_loteria}
          ></SortForm>
        </Modal>
        <Modal show={showModal2} handleClose={() => closeModal2()}>
          <CloseForm
            closeModal={closeModal2}
            tip_sorteo={tip_sorteo}
            sorteo={sorteo}
            disable_botoExtra={setDisable_botoExtra}
            disabledBtns={setDisabledBtns}
            disable_botoOrdinario={setDisable_botoOrdinario}

          ></CloseForm>
        </Modal>
        <Modal show={showparams} handleClose={() => closeparams()}>
          <ParamsForm
            closeModal={closeparams}
            params={params}
            setParams={setParams}
          ></ParamsForm>
        </Modal>
      </div>
    </>
  );
};

export default CrearSorteos;
