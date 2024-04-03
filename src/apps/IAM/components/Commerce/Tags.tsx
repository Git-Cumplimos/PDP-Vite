import React, {
  Dispatch,
  Fragment,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import ButtonBar from "../../../../components/Base/ButtonBar";
import useFetchDebounce from "../../../../hooks/useFetchDebounce";
import Button from "../../../../components/Base/Button";
import Fieldset from "../../../../components/Base/Fieldset";
import CommerceTableIam from "./Table";
import Modal from "../../../../components/Base/Modal";
import useFetchDispatchDebounce from "../../../../hooks/useFetchDispatchDebounce";
import { useNavigate } from "react-router-dom";

type Props = {
  setIsNotEmpty: Dispatch<SetStateAction<boolean>>;
  setUpdateCommerces: Dispatch<SetStateAction<(_: number) => void>>;
  uuid?: number | null;
  show: boolean;
};

const urlComercios = `${process.env.REACT_APP_URL_SERVICE_COMMERCE}`;

const CommerceTagsIam = ({
  setIsNotEmpty,
  setUpdateCommerces,
  uuid,
  show = false,
}: Props) => {
  const navigate = useNavigate();
  const [comercios, setComercios] = useState<any[]>([]);
  const [searchCommerce, setSearchCommerce] = useState(false);
  const handleClose = useCallback(() => setSearchCommerce(false), []);

  useFetchDebounce(
    {
      url: useMemo(() => {
        const currentFilters = { fk_id_user: uuid };
        const url = `${urlComercios}/comercios/usuario-padre?${new URLSearchParams(
          Object.entries(currentFilters)
            .filter(([_, val]) => !(val == null))
            .map(([key, val]) => [key, `${val}`])
        )}`;
        return url;
      }, [uuid]),
      autoDispatch: !(uuid == null),
    },
    {
      onSuccess: useCallback(
        (res) => {
          const foundCommerces = res?.obj?.results ?? [];
          setComercios(foundCommerces);
          setIsNotEmpty(foundCommerces?.length !== 0);
        },
        [setIsNotEmpty]
      ),
      onError: useCallback((error) => console.error(error), []),
    }
  );

  const [putCommerces] = useFetchDispatchDebounce(
    {
      onPending: useCallback(() => "Actualizando comercios hijo", []),
      onSuccess: useCallback(() => {
        navigate("/iam/users");
        return "Comercios hijos actualizados";
      }, [navigate]),
      onError: useCallback((error) => {
        if (error?.cause === "custom") {
          return error?.message;
        }
        console.error(error);
        return "Error actualizando comercios hijos";
      }, []),
    },
    { notify: true }
  );

  const updateCommerces = useCallback(
    (uuid) =>
      putCommerces(`${urlComercios}/comercios/usuario-padre`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uuid,
          pk_comercios: comercios.map(
            ({ pk_comercio }: { pk_comercio: number }) => pk_comercio
          ),
        }),
      }),
    [putCommerces, comercios]
  );

  useEffect(() => {
    setUpdateCommerces(() => updateCommerces);
  }, [setUpdateCommerces, updateCommerces]);

  if (!show) {
    return <Fragment />;
  }

  return (
    <Fragment>
      <Fieldset legend={"Comercios relacionados"} className={"lg:col-span-2"}>
        {!comercios?.length ? (
          <ButtonBar className={"lg:col-span-2"}>
            <h1 className="text-xl text-center my-auto">
              No hay comercios relacionados
            </h1>
          </ButtonBar>
        ) : (
          <ButtonBar className={"lg:col-span-2"}>
            {comercios?.map(({ pk_comercio, nombre_comercio }, ind) => (
              <button
                type="button"
                className="rounded-md bg-primary-light px-4 py-2 my-2 text-base text-white"
                title={nombre_comercio}
                key={ind}
              >
                {pk_comercio}) {nombre_comercio} &nbsp;&nbsp;
                <span
                  className="bi bi-x-lg pointer-events-auto"
                  onClick={() =>
                    setComercios((old) => {
                      const copy = structuredClone(old);
                      copy.splice(ind, 1);
                      setIsNotEmpty(copy?.length !== 0);
                      return copy;
                    })
                  }
                />
              </button>
            ))}
          </ButtonBar>
        )}
        <ButtonBar className={"lg:col-span-2"}>
          <Button type="button" onClick={() => setSearchCommerce(true)}>
            Agregar comercio
          </Button>
        </ButtonBar>
      </Fieldset>
      <Modal show={searchCommerce} handleClose={handleClose}>
        <CommerceTableIam
          type="SEARCH_TABLE_SONS"
          onSelectComerce={(comm) =>
            setComercios((old) => {
              handleClose();
              const copy = structuredClone(old);
              copy.push(comm);
              return copy.filter(
                (
                  { pk_comercio }: { pk_comercio: number },
                  index: number,
                  self: Array<{ pk_comercio: number }>
                ) =>
                  index ===
                  self.findIndex(
                    ({ pk_comercio: id_compare }) => pk_comercio === id_compare
                  )
              );
            })
          }
        />
      </Modal>
    </Fragment>
  );
};

export default CommerceTagsIam;
