import { Fragment, useCallback, useMemo, useState } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import useFetchDebounce from "../../../../hooks/useFetchDebounce";
import Input from "../../../../components/Base/Input";
import { onChangeNumber } from "../../../../utils/functions";
import { useNavigate } from "react-router-dom";
import useMap from "../../../../hooks/useMap";
import DataTable from "../../../../components/Base/DataTable/DataTable";
import Modal from "../../../../components/Base/Modal";
import Form from "../../../../components/Base/Form";
import { notifyError, notifyPending } from "../../../../utils/notify";
import {updateUserMassive} from "../../utils/fetchFunctions";

const url = process.env.REACT_APP_URL_IAM_PDP;

const initialSearchFilters = new Map([
  ["uuid", ""],
  ["email", ""],
  ["uname", ""],
  ["page", 1],
  ["limit", 10],
]);

const IAMUsers = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState([]);
  const [isNextPage, setIsNextPage] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showMainModal, setShowMainModal] = useState(false);
  const [showModalErrors, setShowModalErrors] = useState(false);
  const [file, setFile] = useState(null);
  const typoArchivos = ["text/csv"] 
  const [searchFilters, { setAll: setSearchFilters, set: setSingleFilter }] =
    useMap(initialSearchFilters);

  useFetchDebounce(
    useMemo(() => {
      const tempMap = new Map(searchFilters);

      tempMap.forEach((val, key, map) => {
        if (!val) {
          map.delete(key);
        }
      });

      const queries = new URLSearchParams(tempMap.entries()).toString();
      return { url: `${url}/users?${queries}` };
    }, [searchFilters]),
    {
      onSuccess: useCallback((res) => {
        setIsNextPage(res?.obj?.next_exist);
        setUserData(res?.obj?.results);
      }, []),
      onError: useCallback((error) => console.error(error), []),
    }
  );

  const handleClose = useCallback(() => {
    setShowModal(false);
    setShowMainModal(false);
    setShowModalErrors(false);
  }, []);

  const CargarArchivo = useCallback(
    async (e) => {
      e.preventDefault();
      if (!typoArchivos.includes(file.type)){
        notifyError('Tipo de archivo incorrecto')
        return;
      }
      notifyPending(
        updateUserMassive(
          file,
        ),
        {
          render() {
            return "Enviando solicitud";
          },
        },
        {
          render({ data: res }) {
            handleClose();
            return res?.msg;
          },
        },
        {
          render({ data: err }) {
            if (err.msg !== "Error: Archivo vacio"){
              setShowModalErrors({ msg: err.msg, errores: err.obj?.error[0].complete_info })
              return `Archivo erróneo`;
            }
            handleClose()
            return err.msg
          },
        }
      );
  }, [handleClose, file]);

  const DescargarErrores = useCallback(
    async () => {
      let errores = []

      if (Array.isArray(showModalErrors?.errores)) {
        errores.push(['Linea', 'Columna', 'Descripcion'])
        showModalErrors?.errores.map((err_esp) => {
          Object.keys(err_esp.error).map((item) => {
            errores.push([err_esp.line, item, err_esp.error[item]])
            return null
          })
          return null
        })
      } else {
        errores.push(['ERRORES EN HEADERS', ''], ['Columna', 'Descripcion'])
        Object.keys(showModalErrors?.errores).map((item) => {
          errores.push([item, showModalErrors?.errores[item]])
          return null
        })
      }
      // descargarCSV('Errores_del_archivo', errores)
      handleClose();
    }, [handleClose, showModalErrors]);


  return (
    <Fragment>
      <ButtonBar>
        <Button type={"submit"} onClick={() => navigate("/iam/users/new-user")}>
          Nuevo usuario
        </Button>
        <Button
          type={"button"}
          onClick={() => {
            setShowModal(true);
            // setMassiveUpload(true);
          }}
        >
          Creacion masiva de usuarios
        </Button>
      </ButtonBar>
      <DataTable
        title="Usuarios punto de pago"
        headers={["Id de usuario", "Nombre de usuario", "Email", "Estado"]}
        data={
          userData?.map(({ uuid, uname, email, active }) => ({
            uuid,
            uname,
            email,
            active: active ? "Activo" : "Inactivo",
          })) ?? []
        }
        onClickRow={(_, i) => 
          navigate(`/iam/users/${userData?.[i]?.uuid}`)
        }
        tblFooter={
          <Fragment>
            <DataTable.LimitSelector
              defaultValue={searchFilters.get("limit")}
              onChangeLimit={(limit) => {
                setSingleFilter("limit", limit);
              }}
            />
            <DataTable.PaginationButtons
              onClickNext={(_) =>
                setSingleFilter("page", (oldPage) =>
                  isNextPage ? oldPage + 1 : oldPage
                )
              }
              onClickPrev={(_) =>
                setSingleFilter("page", (oldPage) =>
                  oldPage > 1 ? oldPage - 1 : oldPage
                )
              }
            />
          </Fragment>
        }
        onChange={(ev) => {
          setSearchFilters((old) => {
            const copy = new Map(old)
              .set(
                ev.target.name,
                ["uuid"].includes(ev.target.name)
                  ? onChangeNumber(ev)
                  : ev.target.value
              )
              .set("page", 1);
            return copy;
          });
        }}
      >
        <Input
          id="search_uuid"
          name="uuid"
          label={"Id de usuario"}
          type="tel"
          maxLength={20}
          autoComplete="off"
          />
        <Input
          id="search_name"
          name="uname"
          label={"Nombre de usuario"}
          type="text"
          maxLength={60}
          autoComplete="off"
          />
        <Input
          id="search_email"
          name="email"
          label={"Email"}
          type="email"
          maxLength={80}
          autoComplete="off"
        />
      </DataTable>
      <Modal show={showModal} handleClose={handleClose}>
        <h2 className="text-3xl mx-auto text-center mb-4">
          Gestión de archivo carga masiva de usuarios
        </h2>
        <ButtonBar>
          <Button
            onClick={() => {
              setShowMainModal(true);
              // setShowModalOptions(true);
            }}
          >
            Cargar Archivo
          </Button>
        </ButtonBar>
      </Modal>
      <Modal show={showMainModal} handleClose={handleClose}>
        <h2 className="text-3xl mx-auto text-center mb-4">
          Gestión de archivo carga masiva de usuarios
        </h2>
        <Form onSubmit={CargarArchivo}>
            <Input
              type="file"
              autoComplete="off"
              onChange={(e) => {
                setFile(e.target.files[0]);
              }}
              accept=".csv"
              required
            />
          <ButtonBar>
            <Button type="submit">
              Cargar Archivo
            </Button>
          </ButtonBar>
        </Form>
      </Modal>
      <Modal show={showModalErrors} handleClose={handleClose}>
        <h2 className="text-2xl mx-auto text-center mb-4">
          {showModalErrors?.msg ?? "Errores en el archivo"}
        </h2>
        <ButtonBar>
          <Button onClick={() => { DescargarErrores() }}>
            Descargar errores del archivo
          </Button>
        </ButtonBar>
      </Modal >
    </Fragment>

  );
};

export default IAMUsers;
