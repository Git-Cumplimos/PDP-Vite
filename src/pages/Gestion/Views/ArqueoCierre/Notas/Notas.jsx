import { Fragment, useCallback, useEffect, useState } from "react";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import TextArea from "../../../../../components/Base/TextArea";
import { useAuth } from "../../../../../hooks/AuthHooks";
import useMoney from "../../../../../hooks/useMoney";
import { notifyPending } from "../../../../../utils/notify";
import { onChangeNumber } from "../../../../../utils/functions";
import { agregarNota } from "../../../utils/fetchCaja";
import { useNavigate } from "react-router-dom";

const Notas = ({ type }) => {
  const navigate = useNavigate();
  const { pdpUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [datosNota, setDatosNota] = useState(
    new Map([
      ["tipo_nota", type],
      ["id_usuario", ""],
      ["id_terminal", ""],
      ["id_comercio", ""],
      ["responsable", ""],
      ["valor_nota", ""],
      ["razon_ajuste", ""],
    ])
  );

  const onChangeMoney = useMoney({ limits: [5000, 10000000] });

  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      const tempMap = new Map(datosNota);
      tempMap.set("razon_ajuste", tempMap.get("razon_ajuste").trim());
      notifyPending(
        agregarNota(Object.fromEntries(tempMap)),
        {
          render: () => {
            setLoading(true);
            return "Procesando peticion";
          },
        },
        {
          render: ({ data: res }) => {
            setLoading(false);
            navigate("/gestion/arqueo");
            return res?.msg;
          },
        },
        {
          render: ({ data: error }) => {
            setLoading(false);
            if (error?.cause === "custom") {
              return error?.message;
            }
            console.error(error?.message);
            return "Peticion fallida";
          },
        }
      );
    },
    [datosNota, navigate]
  );

  useEffect(() => {
    setDatosNota((old) => {
      const copy = new Map(old);
      copy.set("responsable", pdpUser?.uuid);
      return new Map(copy);
    });
  }, [pdpUser?.uuid]);

  if (type === null || type === undefined || typeof type !== "boolean") {
    throw new Error("Tipo de nota invalido");
  }

  return (
    <Fragment>
      <h1 className="text-3xl mt-10 mb-8">Creación nota {type ? "débito": "crédito"}</h1>
      <Form onSubmit={onSubmit} grid>
        <Input
          id="id_comercio"
          name="id_comercio"
          label="Id de comercio"
          type="tel"
          autoComplete="off"
          onChange={(ev) =>
            setDatosNota((old) => {
              const copy = new Map(old);
              copy.set(ev.target.name, onChangeNumber(ev));
              return new Map(copy);
            })
          }
          required
        />
        <Input
          id="id_usuario"
          name="id_usuario"
          label="Id de usuario"
          type="tel"
          autoComplete="off"
          onChange={(ev) =>
            setDatosNota((old) => {
              const copy = new Map(old);
              copy.set(ev.target.name, onChangeNumber(ev));
              return new Map(copy);
            })
          }
          required
        />
        <Input
          id="id_terminal"
          name="id_terminal"
          label="Id de terminal"
          type="tel"
          autoComplete="off"
          onChange={(ev) =>
            setDatosNota((old) => {
              const copy = new Map(old);
              copy.set(ev.target.name, onChangeNumber(ev));
              return new Map(copy);
            })
          }
          required
        />
        <Input
          id="responsable"
          name="responsable"
          label={"Id de responsable"}
          value={pdpUser?.uuid ?? ""}
          readOnly
          required
        />
        <Input
          id="valor_nota"
          name="valor_nota"
          label={`Valor nota ${type ? "débito": "crédito"}`}
          type="tel"
          minLength={"5"}
          maxLength={"13"}
          autoComplete="off"
          onChange={(ev) =>
            setDatosNota((old) => {
              const copy = new Map(old);
              copy.set(ev.target.name, onChangeMoney(ev));
              return new Map(copy);
            })
          }
          required
        />
        <TextArea
          id="razon_ajuste"
          name="razon_ajuste"
          className="w-full place-self-stretch"
          autoComplete="off"
          maxLength={"100"}
          label={"Razón ajuste"}
          onInput={(ev) => {
            setDatosNota((old) => {
              const copy = new Map(old);
              copy.set(ev.target.name, ev.target.value.trimLeft());
              return new Map(copy);
            });
            ev.target.value = ev.target.value.trimLeft();
          }}
          required
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type="submit" disabled={loading}>
            Realizar nota {type ? "débito": "crédito"}
          </Button>
        </ButtonBar>
      </Form>
    </Fragment>
  );
};

export default Notas;
