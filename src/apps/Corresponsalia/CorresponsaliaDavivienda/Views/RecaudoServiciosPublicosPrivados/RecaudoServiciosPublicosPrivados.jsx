import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import Modal from "../../../../../components/Base/Modal";
import MoneyInput from "../../../../../components/Base/MoneyInput";
import SimpleLoading from "../../../../../components/Base/SimpleLoading";
import TableEnterprise from "../../../../../components/Base/TableEnterprise";
import useQuery from "../../../../../hooks/useQuery";
import { notify, notifyError } from "../../../../../utils/notify";
import { postConsultaTablaConveniosEspecifico } from "../../utils/fetchRecaudoServiciosPublicosPrivados";

const RecaudoServiciosPublicosPrivados = () => {
  const { state } = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [datosTrans, setDatosTrans] = useState({
    ref1: "",
    ref2: "",
    valor: "",
  });
  const [isUploading, setIsUploading] = useState(true);
  const [convenio, setConvenio] = useState([]);

  useEffect(() => {
    fecthTablaConveniosEspecificoFunc();
  }, [state?.id]);

  const fecthTablaConveniosEspecificoFunc = () => {
    postConsultaTablaConveniosEspecifico({
      pk_tbl_transaccional_convenios_davivienda_cb: state?.id,
    })
      .then((autoArr) => {
        setConvenio(autoArr?.results[0]);
        setIsUploading(false);
      })
      .catch((err) => console.error(err));
  };
  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const onSubmitPago = (e) => {
    e.preventDefault();
    if (
      convenio?.num_ind_consulta_cnb === "0" ||
      convenio?.num_ind_consulta_cnb === "3"
    ) {
      console.log("realizar pago");
    } else {
      console.log("realizar consulta");
    }
  };
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl text-center'>
        Recaudo servicios publicos y privados
      </h1>
      <h1 className='text-3xl text-center'>{`Convenio: ${
        convenio?.nom_convenio_cnb ?? ""
      }`}</h1>

      <Form grid onSubmit={onSubmitPago}>
        {convenio?.ctrol_ref1_cnb === "1" && (
          <>
            <Input
              id='ref1'
              label={convenio?.nom_ref1_cnb}
              type='text'
              name='ref1'
              minLength='32'
              maxLength='32'
              required
              value={datosTrans.ref1}
              onInput={(e) => {
                setDatosTrans((old) => {
                  return { ...old, ref1: e.target.value };
                });
              }}></Input>
          </>
        )}
        {convenio?.ctrol_ref2_cnb === "1" && (
          <Input
            id='ref2'
            label={convenio?.nom_ref2_cnb}
            type='text'
            name='ref2'
            minLength='32'
            maxLength='32'
            required
            value={datosTrans.ref2}
            onInput={(e) => {
              setDatosTrans((old) => {
                return { ...old, ref2: e.target.value };
              });
            }}></Input>
        )}
        {(convenio?.num_ind_consulta_cnb === "0" ||
          convenio?.num_ind_consulta_cnb === "3") && (
          <MoneyInput
            id='valCashOut'
            name='valCashOut'
            label='Valor'
            type='text'
            autoComplete='off'
            maxLength={"15"}
            value={datosTrans.valor ?? ""}
            onInput={(e, valor) => {
              if (!isNaN(valor)) {
                const num = valor;
                setDatosTrans((old) => {
                  return { ...old, valor: num };
                });
              }
            }}
            required></MoneyInput>
        )}
        <ButtonBar className='lg:col-span-2'>
          <Button type='submit'>
            {convenio?.num_ind_consulta_cnb === "0" ||
            convenio?.num_ind_consulta_cnb === "3"
              ? "Realizar pago"
              : "Realizar consulta"}
          </Button>
        </ButtonBar>
      </Form>
    </>
  );
};

export default RecaudoServiciosPublicosPrivados;
