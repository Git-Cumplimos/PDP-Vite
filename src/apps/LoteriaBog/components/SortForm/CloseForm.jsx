import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import { useLoteria } from "../../utils/LoteriaHooks";
import { useState, useEffect, useCallback } from "react";
import { notify, notifyError } from "../../../../utils/notify";
import SimpleLoading from "../../../../components/Base/SimpleLoading";

const CloseForm = ({ closeModal, tip_sorteo, sorteo, disable_botoOrdinario, disabledBtns, disable_botoExtra, setResp_con, sorteosLOT }) => {
  const { cargueVentasExtra_S3 } = useLoteria();
  const [disabledBtns1, setDisabledBtns] = useState(false);
  const [loadCerrarSorteo, setLoadCerrarSorteo] = useState(false);
  const { ConsultaCrearSort, codigos_lot, setCodigos_lot } = useLoteria();
  const [day, setDay] = useState(null);
  const onSubmit = (e) => {
    e.preventDefault();

    cargueVentasExtra_S3(tip_sorteo).then((res) => {
      setLoadCerrarSorteo(true)
      setTimeout(() => {
        if (res.estado === true) {
          notify(res.msg);
          disable_botoOrdinario(false)
          disable_botoExtra(false)
          disabledBtns(false)
        } else {
          notifyError(res.msg);
        }
        setLoadCerrarSorteo(false)
        closeModal();
      }, 2000)
    });
    // setTimeout(() => {
    // ConsultaCrearSort(sorteosLOT).then((res) => {
    //   setResp_con(res);
    // });
    // closeModal();
    // }, 5000)
  };
  const [tipo_sorteo, setTipo_sorteo] = useState(null);

  // useEffect(() => {
  //   if (tip_sorteo === 1) {
  //     setTipo_sorteo("ordinario");
  //   } else {
  //     setTipo_sorteo("extraordinario");
  //   }
  // }, [tip_sorteo, sorteo, disable_botoOrdinario, disable_botoExtra, disabledBtns]);

  const handleCloseCancelar = useCallback(() => {
    ConsultaCrearSort(sorteosLOT).then((res) => {
      setResp_con(res);
    });
    notifyError("Cierre de sorteo " + tipo_sorteo + " cancelado por el usuario");
    disable_botoOrdinario(false)
    disable_botoExtra(false)
    disabledBtns(false)
  })
  useEffect(() => {
    //Consulta sorteos de Lotería de Bogotá
    ConsultaCrearSort(sorteosLOT).then((res) => {
      setResp_con(res);
    });
    if (tip_sorteo === 1) {
      setTipo_sorteo("ordinario");
    } else {
      setTipo_sorteo("extraordinario");
    }
    setDay(new Date().getDay());
  }, [sorteosLOT, disable_botoOrdinario, disabledBtns, disable_botoExtra, ConsultaCrearSort, setResp_con, tip_sorteo, sorteo]);
  return (
    <>
      <div className="flex flex-col justify-center items-center mx-auto container">
        <Form onSubmit={onSubmit} grid>
          <div className="flex flex-row justify-center text-lg font-medium">
            <h1>¿Está seguro de cerrar el sorteo {tipo_sorteo}?</h1>
          </div>

          <ButtonBar>
            <Button type="submit" disabled={disabledBtns1}>
              Aceptar
            </Button>
            <SimpleLoading show={loadCerrarSorteo}></SimpleLoading>
            <Button
              type="button"
              onClick={() => {
                closeModal();
                handleCloseCancelar();
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

export default CloseForm;
