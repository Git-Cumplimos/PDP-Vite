import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import SimpleLoading from "../../../components/Base/SimpleLoading";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import useQuery from "../../../hooks/useQuery";
import { notify, notifyError } from "../../../utils/notify";
import {
  fetchConsultarReversosCashout,
  postRealizarReversoCashout,
} from "../utils/fetchMoviiRed";

const MoviiPDPReverseCashout = () => {
  const [
    {
      id_comercio = "",
      id_trx = "",
      cash_out_id = "",
      subscriber_num = "",
      date_ini = "",
      date_fin = new Date().toISOString().substring(0, 10),
    },
    setQuery,
  ] = useQuery();
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const handleClose = useCallback(() => {
    setShowModal(false);
    setState(false);
    setSelectedRever({
      amount: "",
      id_terminal: "",
      id_comercio: "",
      id_usuario: "",
      issuer_id_dane: "",
      nombre_comercio: "",
      subscriberNum: "",
      cashOutId: "",
      id_trx: "",
      transaction_date: "",
      message_reverse: "",
      oficina_propia: "",
    });
    fecthReversosCashOutFunc();
  }, []);
  const [selectedRever, setSelectedRever] = useState({
    amount: "",
    id_terminal: "",
    id_comercio: "",
    id_usuario: "",
    issuer_id_dane: "",
    nombre_comercio: "",
    subscriberNum: "",
    cashOutId: "",
    id_trx: "",
    transaction_date: "",
    message_reverse: "",
    oficina_propia: "",
  });
  const [reversosCashOut, setReversosCashOut] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const [state, setState] = useState(false);

  const tableReversosCashOut = useMemo(() => {
    return [
      ...reversosCashOut.map(
        ({
          id_transacciones_movii,
          id_trx,
          id_comercio,
          id_usuario,
          id_terminal,
          monto,
          id_tipo_transaccion,
          correlation_id,
          cash_out_id,
          message_trx,
          code,
          error_code,
          issuer_id_dane,
          nombre_comercio,
          subscriber_num,
          transaction_date,
          transaction_id,
          oficina_propia,
        }) => {
          return {
            id_trx,
            cashOutId: cash_out_id,
            subscriberNum: subscriber_num,
            amount: monto,
            transaction_date: Intl.DateTimeFormat("es-CO", {
              year: "2-digit",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }).format(
              new Date(new Date(transaction_date)).setHours(
                new Date(transaction_date).getHours() + 5
              )
            ),
            id_comercio,
            id_usuario,
            id_terminal,
            nombre_comercio,
            issuer_id_dane,
            transaction_id,
            oficina_propia: oficina_propia ? "Oficina propia" : "Comercio",
          };
        }
      ),
    ];
  }, [reversosCashOut]);
  const onSelectReversosCashOut = useCallback(
    (e, i) => {
      setShowModal(true);
      setSelectedRever({ ...tableReversosCashOut[i], message_reverse: "" });
    },
    [tableReversosCashOut]
  );
  const onChange = useCallback(
    (ev) => {
      const formData = new FormData(ev.target.form);
      setQuery(
        { [ev.target.name]: formData.get(ev.target.name) },
        { replace: true }
      );
    },
    [setQuery]
  );
  const onSubmit = useCallback((ev) => {
    ev.preventDefault();
  }, []);
  const onChangeFormat = useCallback((ev) => {
    setSelectedRever((old) => {
      return { ...old, [ev.target.name]: ev.target.value };
    });
  }, []);
  useEffect(() => {
    fecthReversosCashOutFunc();
  }, [
    page,
    limit,
    id_comercio,
    id_trx,
    subscriber_num,
    cash_out_id,
    date_ini,
    date_fin,
  ]);
  const fecthReversosCashOutFunc = useCallback(() => {
    let obj = {};
    if (date_fin !== "") {
      if (date_ini !== "") {
        if (new Date(date_fin) <= new Date(date_ini)) {
          notifyError("La fecha final debe ser mayor a la inicial");
          return;
        }
        if (new Date() <= new Date(date_fin)) {
          notifyError("La fecha final no puede ser mayor a la actual");
          return;
        }
        obj["date_ini"] = date_ini;
        obj["date_fin"] = date_fin;
      }
    }
    if (parseInt(id_comercio) && id_comercio !== "")
      obj["id_comercio"] = parseInt(id_comercio);
    if (parseInt(id_trx) && id_trx !== "") obj["id_trx"] = parseInt(id_trx);
    if (parseInt(subscriber_num) && subscriber_num !== "")
      obj["subscriber_num"] = parseInt(subscriber_num);
    if (parseInt(cash_out_id) && cash_out_id !== "")
      obj["cash_out_id"] = parseInt(cash_out_id);

    fetchConsultarReversosCashout({ ...obj, page, limit })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setReversosCashOut(autoArr?.results);
      })
      .catch((err) => console.error(err));
  }, [
    date_fin,
    date_ini,
    id_comercio,
    id_trx,
    cash_out_id,
    page,
    limit,
    subscriber_num,
  ]);
  const submitReverse = useCallback(
    (e) => {
      e.preventDefault();
      setIsUploading(true);
      postRealizarReversoCashout({
        amount: parseInt(selectedRever.amount),
        id_terminal: parseInt(selectedRever.id_terminal),
        id_comercio: parseInt(selectedRever.id_comercio),
        id_usuario: parseInt(selectedRever.id_usuario),
        issuer_id_dane: parseInt(selectedRever.issuer_id_dane),
        nombre_comercio: selectedRever.nombre_comercio,
        subscriberNum: selectedRever.subscriberNum,
        cashOutId: selectedRever.cashOutId,
        id_trx: parseInt(selectedRever.id_trx),
        message_reverse: selectedRever.message_reverse,
        oficina_propia:
          selectedRever.oficina_propia === "Oficina propia" ? true : false,
      })
        .then((res) => {
          if (res?.status) {
            setIsUploading(false);
            notify(res?.msg);
            handleClose();
          } else {
            setIsUploading(false);
            notifyError(res?.msg);
            handleClose();
          }
        })
        .catch((err) => {
          setIsUploading(false);
          notifyError("No se ha podido conectar al servidor");
          console.error(err);
        });
    },
    [selectedRever, handleClose]
  );
  return (
    <Fragment>
      <SimpleLoading show={isUploading} />
      <TableEnterprise
        title='Transacciones sin reversos realizados'
        maxPage={maxPages}
        headers={[
          "Id transaccion",
          "Id cash-out",
          "Telefono cliente",
          "Monto",
          "Fecha transaccion",
          "Id comercio",
          "Id usuario",
          "Id terminal",
          "Nombre comercio",
          "Id dane",
          "Id transaccion Movii",
          "Tipo de comercio",
        ]}
        data={tableReversosCashOut}
        onSelectRow={onSelectReversosCashOut}
        onSetPageData={setPageData}
        onChange={onChange}>
        <Input
          id='Id comercio'
          name='id_comercio'
          label={"Id comercio"}
          type='number'
          autoComplete='off'
          defaultValue={id_comercio}
        />
        <Input
          id='Id transaccion'
          name='id_trx'
          label={"Id transaccion"}
          type='number'
          autoComplete='off'
          defaultValue={id_trx}
        />
        <Input
          id='Id cash-out'
          name='cash_out_id'
          label={"Id cash-out"}
          type='number'
          autoComplete='off'
          defaultValue={cash_out_id}
        />
        <Input
          id='Telefono cliente'
          name='subscriber_num'
          label={"Telefono cliente"}
          type='number'
          autoComplete='off'
          defaultValue={subscriber_num}
        />
        <Input
          id='Fecha inicial'
          name='date_ini'
          label={"Fecha inicial"}
          type='date'
          autoComplete='off'
          defaultValue={date_ini}
        />
        <Input
          id='Fecha final'
          name='date_fin'
          label={"Fecha final"}
          type='date'
          autoComplete='off'
          defaultValue={date_fin}
        />
      </TableEnterprise>
      <Modal show={showModal} handleClose={handleClose}>
        <Fragment>
          {!state ? (
            <Form onSubmit={onSubmit} onChange={onChangeFormat} grid>
              <Input
                id='id_trx'
                name='id_trx'
                label={"Id transaccion"}
                type='text'
                autoComplete='off'
                value={selectedRever.id_trx}
                disabled={selectedRever.id_trx}
                required
              />
              <Input
                id='cashOutId'
                name='cashOutId'
                label={"Id cash-out"}
                type='text'
                autoComplete='off'
                value={selectedRever.cashOutId}
                disabled={selectedRever.cashOutId}
                required
              />
              <Input
                id='subscriberNum'
                name='subscriberNum'
                label={"Telefono cliente"}
                type='text'
                autoComplete='off'
                value={selectedRever.subscriberNum}
                disabled={selectedRever.subscriberNum}
                required
              />
              <Input
                id='amount'
                name='amount'
                label={"Monto"}
                type='text'
                autoComplete='off'
                value={selectedRever.amount}
                disabled={selectedRever.amount}
                required
              />
              <Input
                id='message_reverse'
                name='message_reverse'
                label={"Razón del reverso"}
                type='text'
                autoComplete='off'
                value={selectedRever.message_reverse}
                onChange={() => {}}
                required
              />
              <ButtonBar>
                <Button
                  type='submit'
                  onClick={() => {
                    if (
                      selectedRever.message_reverse &&
                      selectedRever.message_reverse !== ""
                    ) {
                      setState(true);
                      return;
                    }
                    notifyError("Ingrese una razón del reverso");
                  }}>
                  Realizar reverso del cash-out
                </Button>
              </ButtonBar>
            </Form>
          ) : (
            <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
              <h1 className='text-2xl font-semibold'>
                ¿Esta seguro de realizar el reverso?
              </h1>
              <ButtonBar>
                <Button type='submit' onClick={submitReverse}>
                  Aceptar
                </Button>
                <Button onClick={handleClose}>Cancelar</Button>
              </ButtonBar>
            </div>
          )}
        </Fragment>
      </Modal>
    </Fragment>
  );
};

export default MoviiPDPReverseCashout;
