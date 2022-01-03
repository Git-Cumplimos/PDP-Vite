import { Fragment, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Fieldset from "../../../components/Base/Fieldset/Fieldset";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import InputSuggestions from "../../../components/Base/InputSuggestions/InputSuggestions";
import MultipleSelect from "../../../components/Base/MultipleSelect/MultipleSelect";
import useQuery from "../../../hooks/useQuery";
import fetchData from "../../../utils/fetchData";
import { notify, notifyError } from "../../../utils/notify";
import {
  fetchAutosPerConv,
  fetchConveniosUnique,
} from "../utils/fetchRevalConvenios";

const urlAutorizadores = process.env.REACT_APP_URL_REVAL_AUTORIZADOR;

const ConvAuto = () => {
  const navigate = useNavigate();
  const [{ convenios_id_convenio }, setQuery] = useQuery();

  const [labelInputs, setLabelInputs] = useState([]);
  const [autorizadoresConv, setAutorizadoresConv] = useState([]);
  const [originalAutoConv, setOriginalAutoConv] = useState([]);

  const mapAutorizadores = useCallback((autorizadores) => {
    return [
      ...autorizadores?.map(({ id_autorizador, nombre_autorizador, nit }) => (
        <div className="grid grid-cols-1 place-items-center px-4 py-2">
          <h1 className="text-lg">ID: {id_autorizador}</h1>
          <h1 className="text-lg">Nombre: {nombre_autorizador}</h1>
          <h1 className="text-lg">Nit: {nit}</h1>
        </div>
      )),
    ];
  }, []);

  const consultLabels = useCallback(async () => {
    try {
      let inputs = [];
      if (convenios_id_convenio) {
        const resConv = await fetchConveniosUnique(convenios_id_convenio);
        inputs.push(["Convenio", resConv?.results?.[0]?.nombre_convenio]);
      }
      return inputs;
    } catch (err) {
      console.error(err);
      return [];
    }
  }, [convenios_id_convenio]);

  const searchAutorizadores = useCallback((e, index) => {
    const _nameAutorizador = e.target.value;
    if (_nameAutorizador.length > 1) {
      fetchData(`${urlAutorizadores}/infoauto`, "GET", {
        nombre_autorizador: _nameAutorizador,
        limit: 5,
      })
        .then((res) => {
          if (res?.status) {
            setAutorizadoresConv((old) => {
              const copy = [...old];
              copy[index] = {
                ...copy[index],
                foundAutos: [...res?.obj?.results],
              };
              return [...copy];
            });
          } else {
            console.error(res?.msg);
          }
        })
        .catch(() => {});
    } else {
      setAutorizadoresConv((old) => {
        const copy = [...old];
        copy[index] = {
          ...copy[index],
          foundAutos: [],
        };
        return [...copy];
      });
    }
  }, []);

  const onSubmit = useCallback(
    async (ev) => {
      ev.preventDefault();

      let totalCrear = 0;
      let successCrear = 0;
      let totalEditar = 0;
      let successEditar = 0;

      for (const {
        id_autorizador: autorizador_id_autorizador,
        pago_parcial: pagos_parciales,
        pago_vencido: pagos_vencidos,
        estado_relacion_convenio: estado,
        "identificador de convenio": id_convenio_auto,
      } of autorizadoresConv) {
        if (
          !originalAutoConv
            .map(({ id_autorizador }) => id_autorizador)
            .includes(autorizador_id_autorizador)
        ) {
          totalCrear++;
          const res = await fetchData(
            `${urlAutorizadores}/autoconv`,
            "POST",
            {},
            {
              convenios_id_convenio,
              autorizador_id_autorizador,
              pagos_parciales,
              pagos_vencidos,
              estado,
              id_convenio_auto,
              comision_cobrada: {
                type: "trx",
                ranges: [{ Minimo: 0, Maximo: -1, Porcentaje: 0, Fija: 0 }],
              },
            }
          );
          console.log("POST", res);
          if (res?.status) {
            successCrear++;
          }
        } else {
          totalEditar++;
          const res = await fetchData(
            `${urlAutorizadores}/autoconv`,
            "PUT",
            {
              convenios_id_convenio,
              autorizador_id_autorizador,
            },
            {
              pagos_parciales,
              pagos_vencidos,
              estado,
              id_convenio_auto,
            }
          );
          console.log("PUT", res);
          if (res?.status) {
            successEditar++;
          }
        }
      }

      if (successCrear > 0 && totalCrear > 0) {
        notify(
          `Se han creado ${successCrear} de ${totalCrear} relaciones convenio-autorizador`
        );
      } else if (totalCrear > 0) {
        notifyError(
          `No se creado relaciones convenio-autorizador se intentaron crear ${totalCrear} en total`
        );
      }

      if (successEditar > 0 && totalEditar > 0) {
        notify(
          `Se han editado ${successEditar} de ${totalEditar} relaciones convenio-autorizador`
        );
      } else if (totalEditar > 0) {
        notifyError(
          `No se editado relaciones convenio-autorizador se intentaron crear ${totalEditar} en total`
        );
      }

      if (
        (totalCrear > 0 || totalEditar > 0) &&
        (successCrear > 0 || successEditar > 0)
      ) {
        navigate(-1, { replace: true });
      } else {
        notifyError(
          "No se han realizado cambios a los autorizadores de este convenio"
        );
      }

      // TODO: Actualizar y/o crear relaciones convenio autorizador
    },
    [autorizadoresConv, convenios_id_convenio, originalAutoConv, navigate]
  );

  useEffect(() => {
    consultLabels().then((res) => setLabelInputs(res));
  }, [consultLabels]);

  useEffect(() => {
    if (convenios_id_convenio) {
      fetchAutosPerConv(convenios_id_convenio)
        .then((res) => {
          setAutorizadoresConv(res?.results);
          setOriginalAutoConv(res?.results);
        })
        .catch((err) => console.error(err));
    }
  }, [convenios_id_convenio, setQuery]);

  return (
    <Fragment>
      <h1 className="text-2xl">Relacionar autorizadores al convenio</h1>
      <Form grid>
        {labelInputs.map(([key, val]) => (
          <Input
            type={"text"}
            key={key}
            label={key}
            value={val}
            readOnly
            disabled
          />
        ))}
        {labelInputs.length === 1 ? <ButtonBar></ButtonBar> : ""}
      </Form>
      <Form onSubmit={onSubmit} grid>
        {autorizadoresConv?.map(
          (
            {
              id_autorizador: autorizador_id_autorizador,
              nombre_autorizador,
              pago_parcial: pagos_parciales,
              pago_vencido: pagos_vencidos,
              estado_relacion_convenio: estado,
              "identificador de convenio": id_convenio_auto,
              foundAutos,
            },
            index
          ) => {
            return (
              <Fieldset
                legend={`Autorizador ${index + 1}`}
                className={"lg:col-span-2"}
              >
                {autorizador_id_autorizador === -1 ? (
                  <Fragment>
                    <InputSuggestions
                      id={`autorizador_${index}`}
                      label={"Buscar autorizador"}
                      type={"search"}
                      autoComplete="off"
                      suggestions={mapAutorizadores(foundAutos || []) || []}
                      onLazyInput={{
                        callback: (ev) => searchAutorizadores(ev, index),
                        timeOut: 500,
                      }}
                      onSelectSuggestion={(idSug) =>
                        setAutorizadoresConv((old) => {
                          const copy = [...old];
                          const selected = copy[index].foundAutos[idSug];
                          copy[index] = {
                            ...copy[index],
                            foundAutos: [],
                            id_autorizador: selected.id_autorizador,
                            nombre_autorizador: selected.nombre_autorizador,
                          };
                          return [...copy];
                        })
                      }
                    />
                    <ButtonBar></ButtonBar>
                  </Fragment>
                ) : (
                  <Fragment>
                    <Input
                      id={"idAutorizador"}
                      name={"idAuto"}
                      label={"Id autorizador"}
                      type={"text"}
                      autoComplete="off"
                      value={`${autorizador_id_autorizador} - ${nombre_autorizador}`}
                      readOnly
                    />
                    <ButtonBar>
                      {!originalAutoConv
                        .map(({ id_autorizador }) => id_autorizador)
                        .includes(autorizador_id_autorizador) ? (
                        <Button
                          onClick={() =>
                            setAutorizadoresConv((old) => {
                              const copy = [...old];
                              copy[index] = {
                                ...copy[index],
                                foundAutos: [],
                                id_autorizador: -1,
                                nombre_autorizador: "",
                              };
                              return [...copy];
                            })
                          }
                        >
                          Quitar autorizador
                        </Button>
                      ) : (
                        ""
                      )}
                    </ButtonBar>
                  </Fragment>
                )}
                <MultipleSelect
                  options={{
                    "Pagos parciales": pagos_parciales,
                    "Pagos vencidos": pagos_vencidos,
                    Estado: estado,
                  }}
                  onChange={({
                    "Pagos parciales": pagos_parciales,
                    "Pagos vencidos": pagos_vencidos,
                    Estado: estado,
                  }) =>
                    setAutorizadoresConv((old) => {
                      const copy = [...old];
                      copy[index] = {
                        ...copy[index],
                        pago_parcial: pagos_parciales,
                        pago_vencido: pagos_vencidos,
                        estado_relacion_convenio: estado,
                      };
                      return [...copy];
                    })
                  }
                />
                <Input
                  id={"idConvenioAutorizador"}
                  name={"idConvAuto"}
                  label={"Id de convenio segun autorizador"}
                  type={"number"}
                  autoComplete="off"
                  value={id_convenio_auto}
                  onChange={(ev) =>
                    setAutorizadoresConv((old) => {
                      const copy = [...old];
                      const val = parseInt(ev.target.value);
                      copy[index] = {
                        ...copy[index],
                        "identificador de convenio": isNaN(val) ? "" : val,
                      };
                      return [...copy];
                    })
                  }
                  required
                />
              </Fieldset>
            );
          }
        )}
        <ButtonBar className={"lg:col-span-2"}>
          <Button
            type="button"
            onClick={() =>
              setAutorizadoresConv((old) => {
                const copy = [...old];
                copy?.push({
                  id_autorizador: -1,
                  pago_parcial: false,
                  pago_vencido: false,
                  estado_relacion_convenio: false,
                  "identificador de convenio": "",
                });
                return [...copy];
              })
            }
          >
            Añadir autorizador
          </Button>
          <Button type="submit">Actualizar autorizadores</Button>
        </ButtonBar>
      </Form>
    </Fragment>
  );
};

export default ConvAuto;
