import { Fragment, useCallback, useEffect, useState } from "react";
import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Fieldset from "../../../../components/Base/Fieldset/Fieldset";
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input/Input";
import Modal from "../../../../components/Base/Modal/Modal";
import Select from "../../../../components/Base/Select/Select";
import Table from "../../../../components/Base/Table/Table";
import useQuery from "../../../../hooks/useQuery";
import fetchData from "../../../../utils/fetchData";

const initTable = [
  {
    "Tipo de transaccion": "Recaudo",
    Convenio: "Enel",
  },
];

const initComission = {
  type: "trx",
  ranges: [
    {
      Minimo: 0,
      Maximo: 1000,
      Porcentaje: 1.2,
      Fija: 2000,
    },
    {
      Minimo: 1001,
      Maximo: 2000,
      Porcentaje: 1.5,
      Fija: 3000,
    },
  ],
};

const Com2Pay = () => {
  const { tipo_trx, comercio, convenio } = useQuery();

  const [inputData, setInputData] = useState({
    typeTrx: "",
    comercio: "",
    convenio: "",
  });

  const [comissions, setComissions] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const [selectedComission, setSelectedComission] = useState(null);

  const closeModal = useCallback(() => setShowModal(false), []);

  const onChange = useCallback((ev) => {
    setInputData((oldInput) => {
      return {
        ...oldInput,
        [ev.target.name]: ev.target.value,
      };
    });
  }, []);

  useEffect(() => {
    setInputData({
      typeTrx: "Recaudo",
      comercio: "Comercio 1",
      convenio: "Enel",
    });
    setComissions(initTable);
    if (tipo_trx || comercio || convenio) {
      // fetchData("", "GET", {
      //   tipo_op: tipo_trx,
      //   id_comercio: comercio,
      //   id_convenio: convenio,
      // })
      //   .then((res) => {
      //     if (res?.status) {
      //       setInputData({});
      //       setComissions(res?.obj);
      //     } else {
      //       console.error(res?.msg);
      //     }
      //   })
      //   .catch((err) => console.error(err));
    }
  }, [tipo_trx, comercio, convenio]);

  // useEffect(() => {
  //   const typeTrx = inputData.typeTrx;
  // fetchData("", "GET", { tipo_op: typeTrx })
  //   .then((res) => {
  //     if (res?.status) {
  //       setComissions(res?.obj);
  //     } else {
  //       console.error(res?.msg);
  //     }
  //   })
  //   .catch((err) => console.error(err));
  // }, [inputData.typeTrx]);

  // useEffect(() => {
  //   const comercio = inputData.comercio;
  //   fetchData("", "GET", { comercio })
  //     .then((res) => {
  //       if (res?.status) {
  //         setComissions(res?.obj);
  //       } else {
  //         console.error(res?.msg);
  //       }
  //     })
  //     .catch((err) => console.error(err));
  // }, [inputData.comercio]);

  // useEffect(() => {
  //   const convenio = inputData.convenio;
  //   fetchData("", "GET", { convenio })
  //     .then((res) => {
  //       if (res?.status) {
  //         setComissions(res?.obj);
  //       } else {
  //         console.error(res?.msg);
  //       }
  //     })
  //     .catch((err) => console.error(err));
  // }, [inputData.convenio]);

  return (
    <Fragment>
      <Form
        onLazyChange={{
          callback: onChange,
          timeOut: 500,
        }}
        grid
      >
        <Input
          label={"Tipo de transaccion"}
          name={"typeTrx"}
          type={"text"}
          defaultValue={inputData?.typeTrx}
        />
        <Input
          label={"Comercio"}
          name={"comercio"}
          type={"text"}
          defaultValue={inputData?.comercio}
        />
        {Array.isArray(comissions) &&
        comissions
          .map(({ "Tipo de transaccion": tipo_trx }) => tipo_trx)
          .includes("Recaudo") ? (
          <Input
            label={"Convenio"}
            name={"convenio"}
            type={"text"}
            defaultValue={inputData?.convenio}
          />
        ) : (
          ""
        )}
      </Form>
      {Array.isArray(comissions) && comissions.length > 0 ? (
        <Table
          headers={[...Object.keys(comissions[0])]}
          data={comissions}
          onSelectRow={(ev, indx) => {
            setShowModal(true);
            setSelectedComission(initComission);
          }}
        />
      ) : (
        ""
      )}
      <Modal show={showModal} handleClose={closeModal}>
        {selectedComission ? (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <h1>Tipo de comisión: {selectedComission?.type}</h1>
            <Form grid>
              <Select
                id="comissionType"
                name="comissionType"
                label="Tipo de comision"
                options={{ "": "", Transacciones: "trx", Dinero: "dinero" }}
                defaultValue={selectedComission?.type}
                required
              />
              {selectedComission?.ranges.map((comission, ind) => {
                return (
                  <Fieldset legend={`Rango ${ind + 1}`} key={ind}>
                    {Object.entries(comission).map(([key, val], idx) => {
                      return (
                        <Input
                          key={idx}
                          label={key}
                          name={key}
                          type={"number"}
                          step={
                            selectedComission?.type === "trx" &&
                            ["min", "max"].includes(key)
                              ? "1"
                              : "0.01"
                          }
                          defaultValue={val}
                          required
                        />
                      );
                    })}
                    <ButtonBar>
                      <Button>Remove</Button>
                    </ButtonBar>
                  </Fieldset>
                );
              })}

              <ButtonBar>
                <Button>Add</Button>
              </ButtonBar>
            </Form>
          </div>
        ) : (
          ""
        )}
      </Modal>
    </Fragment>
  );
};

export default Com2Pay;
