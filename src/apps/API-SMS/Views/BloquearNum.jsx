import { useCallback, useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Modal from "../../../components/Base/Modal";
import Input from "../../../components/Base/Input";
import Form from "../../../components/Base/Form";
import { notify, notifyError } from "../../../utils/notify";
import fetchData from "../../../utils/fetchData";
import PaginationAuth from "../../../components/Compound/PaginationAuth/PaginationAuth";

const url_bloqueo = `${process.env.REACT_APP_URL_APISMS}/bloqueoCelular`;

const BloquearNum = () => {
  const [showModal, setShowModal] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  /*BloquearNum*/
  const BloquearNum = useCallback(async (phone, name) => {
    const body = {};
    body.name = name;
    body.phone = phone;
    try {
      const res = await fetchData(url_bloqueo, "POST", {}, body);
      console.log(res);
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setPhone("");
    setName("");
  });

  const onSubmit1 = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    closeModal();
    BloquearNum(phone, name).then((res) => {
      if (res.status === false) {
        notifyError(res.msg);
      } else {
        notify(res.msg);
        console.log(res);
      }
    });
  };

  console.log(typeof SMS);
  return (
    <>
      <h1 className="text-3xl">Bloquear Número</h1>
      <Form
        onSubmit={onSubmit1}
        className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center"
        grid
      >
        <Input
          id="phone"
          label="Celular"
          type="search"
          minLength="10"
          maxLength="10"
          required={true}
          autoComplete="off"
          value={phone}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              setPhone(e.target.value);
            }
          }}
        />
        <Input
          id="nombre"
          label="Nombre"
          type="search"
          autoComplete="off"
          required={true}
          value={name}
          onInput={(e) => {
            setName(e.target.value);
          }}
        />
        <ButtonBar className="lg:col-span-2">
          <Button type="submit" onClick={() => {}}>
            Bloquear
          </Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={() => closeModal()}>
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
          <h1 className="text-2xl font-semibold">
            Verifique el número que desea bloquear
          </h1>
          <Form onSubmit={onSubmit} grid>
            <Input
              id="phone"
              label="Celular"
              type="search"
              minLength="10"
              maxLength="10"
              autoComplete="off"
              required={true}
              value={phone}
              onInput={(e) => {
                if (!isNaN(e.target.value)) {
                  setPhone(e.target.value);
                }
              }}
            />
            <Input
              id="nombre"
              label="Nombre"
              type="search"
              autoComplete="off"
              required={true}
              value={name}
              onInput={(e) => {
                setName(e.target.value);
              }}
            />

            <ButtonBar>
              <Button type="submit">Bloquear</Button>
            </ButtonBar>
          </Form>
        </div>
        {/* )} */}
      </Modal>
    </>
  );
};

export default BloquearNum;
