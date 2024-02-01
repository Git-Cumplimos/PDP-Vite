import { Fragment, useCallback, useMemo, useState } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import useFetchDebounce from "../../../../hooks/useFetchDebounce";
import Input from "../../../../components/Base/Input";
import { onChangeNumber } from "../../../../utils/functions";
import { descargarCSV } from "../../utils/functions";
import { useNavigate } from "react-router-dom";
import useMap from "../../../../hooks/useMap";
import DataTable from "../../../../components/Base/DataTable/DataTable";
import Modal from "../../../../components/Base/Modal";
import Form from "../../../../components/Base/Form";
import { notifyError, notifyPending } from "../../../../utils/notify";
import {updateUserMassive} from "../../utils/fetchFunctions";
import { useAuth } from "../../../../hooks/AuthHooks";

const url = process.env.REACT_APP_URL_IAM_PDP;

const initialSearchFilters = new Map([
  ["uuid", ""],
  ["email", ""],
  ["uname", ""],
  ["page", 1],
  ["limit", 10],
]);

const IAMUsers = () => {
  const { pdpUser } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState([]);
  const [isNextPage, setIsNextPage] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showMainModal, setShowMainModal] = useState(false);
  const [showModalErrors, setShowModalErrors] = useState(false);
  const [showModalReport, setShowModalReport] = useState(false);
  const [file, setFile] = useState(null);
  const typoArchivos = ["text/csv"] 
  const [filerror, setFilerror] = useState(false);
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
      const formData = new FormData();
      formData.append('file', file);
      formData.append('usuario_ultima_actualizacion', pdpUser?.uuid);
      notifyPending(
        updateUserMassive(
          formData
        ),
        {
          render() {
            return "Enviando solicitud";
          },
        },
        {
          render({ data: res }) {
            const filename = res.headers
            .get("Content-Disposition")
            .split("; ")?.[1]
            .split("=")?.[1];
            if (filename !== 'Reporte_usuarios.csv') {
              setFilerror(res)
              setShowModalErrors(true)
              setShowModalReport(false)
              return 'Archivo erróneo'
            }else{
              setFilerror(res)
              setShowModalErrors(true)
              setShowModalReport(true)
              return 'Usuarios Creados Exitosamente'
            }
          },
        },
        {
          render({ data: err }) {
            if (err.msg !== "Error: Archivo vacio"){
              handleClose()
              return `Archivo erróneo`;
            }
            handleClose()
            return err.msg
          },
        }
      );
  }, [handleClose, file, pdpUser?.uuid]);

  const DescargarErrores = useCallback(
    async () => {
      const filename = filerror.headers
      .get("Content-Disposition")
      .split("; ")?.[1]
      .split("=")?.[1];
      filerror.blob().then((blob) => {
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(blob, filename);
        } else {
          const exportUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = exportUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(exportUrl);
          document.body.removeChild(a);
        }
      });
      handleClose();
    }, [filerror,handleClose]);

  const [res] = useState([
    ["Correo", 
    "Primer_nombre","Segundo_nombre", 
    "Primer_apellido","Segundo_apellido",
    "Tipo_documento","Numero_documento",
    "Numero_telefono","Direccion","Estado",
    "Grupo_usuarios","Comercio_relacionado"],
    ["desarrollador.web@gmail.com","ANDRES", "FELIPE","GUZMAN","MARTINEZ","CC",1032147425,3165788259,"Cr 100 # 45A Sur- 30","True","[]",""],
    ["desarrollado@cumplimos.co","ANDRES","FELIPE","GUZMAN","HERRERA","CC",1031147427,3165788250,"Cr 100 # 45A Sur- 30","True",["[1,2]"],"59"],
  ])
  
  const descargarPlantilla = useCallback(() => {
    descargarCSV('Ejemplo_de_archivo_usuarios_masivo', res)
  }, [res]);

  return (
    <Fragment>
      <ButtonBar>
        <Button type={"submit"} onClick={() => navigate("/iam/users/new-user")}>
          Nuevo usuario
        </Button>
        <Button
          type={"submit"}
          onClick={() => {
            setShowModal(true);
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
            }}
          >
            Cargar Archivo
          </Button>
          <Button
            onClick={() => {
              descargarPlantilla();
            }}
          >
            Formato de Archivo
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
        {showModalReport?'Reporte de usuarios':'Errores en el archivo'}
        </h2>
        <ButtonBar>
          <Button onClick={() => { DescargarErrores() }}>
            {showModalReport?'Descargar Reporte de Usuarios':'Descargar errores del archivo'}
          </Button>
        </ButtonBar>
      </Modal >
    </Fragment>

  );
};

export default IAMUsers;
