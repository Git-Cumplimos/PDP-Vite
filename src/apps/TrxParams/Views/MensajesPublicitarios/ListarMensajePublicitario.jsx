import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import InputSuggestions from "../../../../components/Base/InputSuggestions";
import Modal from "../../../../components/Base/Modal";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import TextArea from "../../../../components/Base/TextArea";
import { notify, notifyError } from "../../../../utils/notify";
import {
  postConsultaMensajesPublicitarios,
  postCrearMensajesPublicitarios,
  putModificarMensajesPublicitarios,
} from "../../utils/fetchMensajesPublicitarios";
import { fetchAutorizadores } from "../../utils/fetchRevalAutorizadores";

const ListarMensajePublicitario = () => {
  const navigate = useNavigate();
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState({
    autorizador: "",
    nombreMensaje: "",
    mensaje: "",
    modify: false,
  });
  const [comercios, setComercios] = useState([]);
  const [autorizadores, setAutorizadores] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const handleClose = useCallback(() => {
    setShowModal(false);
    setData({
      autorizador: "",
      nombreMensaje: "",
      mensaje: "",
      modify: false,
    });
    fetchMensajesPublicitariosFunc();
  }, []);
  const tableMensajes = useMemo(() => {
    return [
      ...comercios.map(({ autorizador, mensaje, nombreMensaje }) => {
        return {
          nombreMensaje,
          autorizador,
          mensaje,
        };
      }),
    ];
  }, [comercios]);
  const mapSuggestionsAutorizadores = useMemo(
    () =>
      autorizadores.map(({ nombre_autorizador }) => (
        <h1 className='py-2'>{nombre_autorizador}</h1>
      )),
    [autorizadores]
  );
  const onSelectMensajes = useCallback(
    (e, i) => {
      setData((old) => ({
        modify: true,
        autorizador: tableMensajes[i].autorizador,
        nombreMensaje: tableMensajes[i].nombreMensaje,
        mensaje: tableMensajes[i].mensaje,
      }));
      setShowModal(true);
    },
    [tableMensajes]
  );

  const onChange = useCallback((ev) => {}, []);

  useEffect(() => {
    fetchMensajesPublicitariosFunc();
  }, [page, limit]);
  const fetchMensajesPublicitariosFunc = useCallback(() => {
    let obj = {};
    postConsultaMensajesPublicitarios({ ...obj, page, limit })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setComercios(autoArr?.results ?? []);
      })
      .catch((err) => console.error(err));
  }, [page, limit]);
  const fecthAutorizadoresFunc = useCallback((e) => {
    fetchAutorizadores({ nombre_autorizador: e.target.value ?? "", limit: 5 })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setAutorizadores(autoArr?.results);
      })
      .catch((err) => console.error(err));
  }, []);
  const onSelectSuggestion = useCallback(
    (i, el) => {
      const copy = { ...data };
      copy.autorizador = autorizadores[i].nombre_autorizador;
      setData({ ...copy });
    },
    [autorizadores, data]
  );
  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      if (data?.modify) {
        putModificarMensajesPublicitarios(
          { nombreMensaje: data.nombreMensaje, autorizador: data.autorizador },
          {
            mensaje: data.mensaje,
          }
        )
          .then((res) => {
            if (res?.status) {
              notify(res?.msg);
              handleClose();
            } else {
              notifyError(res?.msg);
            }
          })
          .catch((err) => console.error(err));
      } else {
        postCrearMensajesPublicitarios({
          nombreMensaje: data.nombreMensaje,
          autorizador: data.autorizador,
          mensaje: data.mensaje,
        })
          .then((res) => {
            if (res?.status) {
              notify(res?.msg);
              handleClose();
            } else {
              notifyError(res?.msg);
            }
          })
          .catch((err) => console.error(err));
      }
    },
    [data, handleClose]
  );
  const onChangeData = (ev) => {
    // console.log(ev.target.name);
    setData((old) => ({ ...old, [ev.target.name]: ev.target.value }));
  };
  return (
    <Fragment>
      <ButtonBar>
        <Button
          type='submit'
          onClick={() => {
            setShowModal(true);
          }}>
          Crear mensaje publicitario
        </Button>
      </ButtonBar>
      <TableEnterprise
        title='Mensajes publicitarios'
        maxPage={maxPages}
        headers={["Nombre mensaje", "Autorizador", "Mensaje"]}
        data={tableMensajes}
        onSelectRow={onSelectMensajes}
        onSetPageData={setPageData}
        onChange={onChange}></TableEnterprise>
      <Modal show={showModal} handleClose={handleClose}>
        <Form onSubmit={onSubmit} grid>
          <Input
            id='nombreMensaje'
            name='nombreMensaje'
            label={"Nombre mensaje"}
            type='text'
            autoComplete='off'
            value={data?.nombreMensaje}
            onChange={onChangeData}
            maxLength={100}
            required
          />
          <TextArea
            id='mensaje'
            name='mensaje'
            label={"Mensaje"}
            type='text'
            minLength='1'
            maxLength='256'
            autoComplete='off'
            value={data?.mensaje}
            onChange={onChangeData}
            required
          />
          <InputSuggestions
            id='autorizador'
            name='autorizador'
            label={"Autorizador"}
            type='search'
            autoComplete='off'
            suggestions={mapSuggestionsAutorizadores || []}
            onLazyInput={{
              callback: fecthAutorizadoresFunc,
              timeOut: 500,
            }}
            onSelectSuggestion={onSelectSuggestion}
            value={data?.autorizador || ""}
            onChange={onChangeData}
            required
          />

          <ButtonBar>
            <Button type='button' onClick={handleClose}>
              Cancelar
            </Button>
            <Button type='submit'>
              {data?.modify ? "Editar mensaje" : "Crear mensaje"}
            </Button>
          </ButtonBar>
        </Form>
      </Modal>
    </Fragment>
  );
};

export default ListarMensajePublicitario;
