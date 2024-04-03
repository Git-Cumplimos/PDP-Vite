import { Fragment, useCallback, useEffect, useState } from "react";
import Input from "../../../components/Base/Input";
import useDelayedCallback from "../../../hooks/useDelayedCallback";
import { useNavigate } from "react-router-dom";
import DataTable from "../../../components/Base/DataTable";
import {
  ErrorCustomFetch,
  descriptionErrorFront,
  fetchCustom,
} from "../utils/fetchUtils";
import { notifyError } from "../../../utils/notify";

//------ typíng--------
type TypeListaInd = {
  id_pdp_convenio: number;
  id_relacion_convenio_autorizador: number[];
  name_pdp_convenio: string;
  ean_convenio: string | null;
};
type TypeSearchFilters = {
  id_relacion_convenio_autorizador: string;
  name_pdp_convenio: string;
  ean_convenio: string;
  limit: number;
  page: number;
};

//------ constantes generales --------
const url = `${process.env.REACT_APP_URL_RECAUDO_GENERICO}/backend/recaudo-generico/convenios/consultar-convenios-manual`;
const searchFiltersInitial: TypeSearchFilters = {
  id_relacion_convenio_autorizador: "",
  name_pdp_convenio: "",
  ean_convenio: "",
  limit: 10,
  page: 1,
};

//------ componente--------
const RecaudoManual = () => {
  const navigate = useNavigate();
  const [searchFilters, setSearchFilters] =
    useState<TypeSearchFilters>(searchFiltersInitial);
  const [dataConsult, setDataConsult] = useState<TypeListaInd[] | null>(null);

  const PeticionSearchConvenios = useDelayedCallback(
    useCallback(async (): Promise<TypeListaInd[]> => {
      const function_name = "PeticionSearchConvenios";
      const name_service = "manual - consultar convenios";
      let response;
      try {
        let params: any = {
          limit: searchFilters.limit,
          page: searchFilters.page,
        };
        if (searchFilters.id_relacion_convenio_autorizador !== "") {
          params = {
            ...params,
            id_relacion_convenio_autorizador:
              searchFilters.id_relacion_convenio_autorizador,
          };
        }
        if (searchFilters.name_pdp_convenio !== "") {
          params = {
            ...params,
            name_pdp_convenio: searchFilters.name_pdp_convenio,
          };
        }
        if (searchFilters.ean_convenio !== "") {
          params = { ...params, ean_convenio: searchFilters.ean_convenio };
        }
        response = await fetchCustom(url, "GET", name_service, params);
        const lista: TypeListaInd[] = response.obj?.result?.lista ?? [];
        setDataConsult(lista);
        return lista;
      } catch (error: any) {
        if (!(error instanceof ErrorCustomFetch)) {
          notifyError(descriptionErrorFront.replace("%s", name_service));
          console.error("Error respuesta Front-end PDP", {
            "Error PDP": descriptionErrorFront.replace("%s", name_service),
            "Error Sequence": `RecaudoManual - ${function_name}`,
            "Error Console": `${error.message}`,
          });
        }
        return [];
      }
    }, [
      searchFilters.id_relacion_convenio_autorizador,
      searchFilters.name_pdp_convenio,
      searchFilters.ean_convenio,
      searchFilters.limit,
      searchFilters.page,
    ]),
    300
  );

  useEffect(() => {
    PeticionSearchConvenios();
  }, [PeticionSearchConvenios, navigate]);

  return (
    <div className="py-10 flex items-center flex-col">
      <DataTable
        title="Recaudo Servicios Públicos y Privados Manual"
        headers={[
          "Código de convenio",
          "Código de convenio(autorizador)",
          "Nombre de convenio",
          "EAN",
        ]}
        data={
          dataConsult?.map(
            ({
              id_pdp_convenio,
              id_relacion_convenio_autorizador,
              name_pdp_convenio,
              ean_convenio,
            }: TypeListaInd) => ({
              "Código de convenio": id_pdp_convenio,
              "Código de convenio(autorizador)":
                id_relacion_convenio_autorizador,
              "Nombre de convenio": name_pdp_convenio,
              EAN: ean_convenio,
            })
          ) ?? []
        }
        onClickRow={(_, index) => {
          if (dataConsult) {
            const dataConsultInd: TypeListaInd = dataConsult[index];
            navigate("../recaudo-generico/trx", {
              state: {
                id_pdp_convenio: dataConsultInd.id_pdp_convenio,
                name_pdp_convenio: dataConsultInd.name_pdp_convenio,
              },
            });
          }
        }}
        tblFooter={
          <Fragment>
            <DataTable.LimitSelector
              defaultValue={searchFilters.limit}
              onChangeLimit={(limit) =>
                setSearchFilters((old) => ({
                  ...old,
                  limit: limit,
                }))
              }
            />
            <DataTable.PaginationButtons
              onClickNext={(_) =>
                setSearchFilters((old) => ({
                  ...old,
                  page: old.page + 1,
                }))
              }
              onClickPrev={(_) =>
                setSearchFilters((old) => ({
                  ...old,
                  page: old.page - 1,
                }))
              }
            />
          </Fragment>
        }
        onChange={(ev) => {}}
      >
        <Input
          id="id_relacion_convenio_autorizador"
          name="id_relacion_convenio_autorizador"
          label="Código de convenio (autorizador) - Nura"
          type="text"
          maxLength={30}
          value={searchFilters.id_relacion_convenio_autorizador}
          onChange={(ev) =>
            setSearchFilters((old) => ({
              ...old,
              [ev.target.name]: (
                (ev.target.value ?? "").match(/\d/g) ?? []
              ).join(""),
            }))
          }
        />
        <Input
          id="name_pdp_convenio"
          name="name_pdp_convenio"
          label="Nombre convenio"
          type="text"
          maxLength={30}
          value={searchFilters.name_pdp_convenio}
          onChange={(ev) =>
            setSearchFilters((old) => ({
              ...old,
              [ev.target.name]: ev.target.value,
            }))
          }
        />
        <Input
          id="ean_convenio"
          name="ean_convenio"
          label="EAN"
          type="text"
          maxLength={30}
          value={searchFilters.ean_convenio}
          onChange={(ev) =>
            setSearchFilters((old) => ({
              ...old,
              [ev.target.name]: (
                (ev.target.value ?? "").match(/\d/g) ?? []
              ).join(""),
            }))
          }
        />
      </DataTable>
    </div>
  );
};

export default RecaudoManual;
