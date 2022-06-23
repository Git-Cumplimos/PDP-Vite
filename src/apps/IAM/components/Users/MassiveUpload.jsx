import { useCallback, useState } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import fetchData from "../../../../utils/fetchData";
import SimpleLoading from "../../../../components/Base/SimpleLoading/SimpleLoading";
import sendFormData from "../../../../utils/sendFormData";
import PaginationAuth from "../../../../components/Compound/PaginationAuth/PaginationAuth";
import Table from "../../../../components/Base/Table";
import { notify, notifyError } from "../../../../utils/notify";

const baseCsv = [
  [
    "Email",
    "Nombre completo",
    "Documento",
    "Tipo de documento",
    "Telefono",
    "Direccion",
  ],
  [
    "david32@gmail.com",
    "Nicholas David",
    "1003564323",
    "CC",
    "3008789080",
    "Calle 100 # 13 - 6",
  ],
  [
    "david33@gmail.com",
    "Nicholas David",
    "1003564324",
    "CC",
    "3008789080",
    "Calle 100 # 13 -88",
  ],
];

const url_iam = process.env.REACT_APP_URL_IAM_PDP;

const MassiveUpload = ({ onCloseModal }) => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [usersFile, setUsersFile] = useState(null);

  const [maxPage, setMaxPage] = useState(1);
  const [foundGroups, setFoundGroups] = useState([]);

  const onFileCharge = useCallback((files) => {
    if (Array.isArray(Array.from(files))) {
      files = Array.from(files);
      if (files.length === 1) {
        const [m_file] = files;
        setUsersFile({ file: m_file, fileName: m_file.name });
      } else {
        if (files.length > 1) {
          notifyError("Se debe ingresar un solo archivo para subir");
        }
      }
    }
  }, []);

  const searchGroups = useCallback(async (gname, _page) => {
    const queries = { limit: 5 };
    if (gname && gname !== "") {
      queries.name_group = gname;
    }
    if (_page) {
      queries.page = _page;
    }
    if (Object.keys(queries).length > 0) {
      try {
        const res = await fetchData(`${url_iam}/groups`, "GET", queries);
        if (res?.status) {
          return res?.obj;
        }
        return [];
      } catch (err) {
        notifyError(err);
      }
    } else {
      return [];
    }
  }, []);

  const onChange = useCallback(
    (_formData) => {
      searchGroups(_formData.get("name_group"), _formData.get("page"))
        .then((res) => {
          setFoundGroups(res?.results);
          setMaxPage(res?.maxpages);
        })
        .catch(() => {});
    },
    [searchGroups]
  );

  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (!usersFile) {
      notifyError("No se ha selecionado un archivo para subir");
      return;
    }
    if (!selectedGroup) {
      notifyError(
        "No se ha selecionado un grupo al cual añadir a los ususarios"
      );
      return;
    }

    setIsUploading(true);

    formData.append("file", usersFile.file);
    formData.append("id_group", selectedGroup.id_group);

    sendFormData(
      `${url_iam}/users-massive`,
      "POST",
      formData,
      (xhr) => {
        setIsUploading(false);
        if (xhr.status === 200) {
          const res = xhr.response;
          if (!res?.status) {
            notifyError(res?.msg);
          } else {
            const {
              added_users,
              all_users,
              // failed_to_add,
              // failed_to_group,
              grouped_users,
            } = res?.obj;
            if (added_users.length === 0) {
              notifyError(
                `Se han creado ${added_users.length} de ${all_users.length} usuarios`
              );
            } else {
              onCloseModal?.();
              notify(
                `Se han creado ${added_users.length} de ${all_users.length} usuarios`
              );
              if (added_users.length > 0) {
                notify(
                  `Se han agrupado ${grouped_users.length} de ${added_users.length} usuarios creados`
                );
              }
            }
          }
        }
      },
      (xhr) => {
        setIsUploading(false);
        notifyError("Error de red");
      },
      "json"
    );
  };

  return (
    <div className="flex flex-col justify-center items-center mx-auto">
      <h1 className="text-2xl my-4">Creacion de usuarios</h1>
      <SimpleLoading show={isUploading} />
      <ButtonBar>
        <Button
          onClick={() => {
            const fileName = `(${Intl.DateTimeFormat("es-CO", {
              year: "2-digit",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            }).format(new Date())}) Subida masiva de usuarios`;
            console.log(fileName);
            const str = `${baseCsv.map((row) => row.join(";")).join("\r\n")}`;
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
              const blob = new Blob([str], {
                type: "text/csv;charset=iso-8859-1",
              });
              window.navigator.msSaveOrOpenBlob(blob, fileName);
            } else {
              // other browsers
              const file = new File([str], fileName, {
                type: "text/csv;charset=iso-8859-1",
              });
              const exportUrl = URL.createObjectURL(file);
              window.location.assign(exportUrl);
              URL.revokeObjectURL(exportUrl);
            }
            // const data = new Blob([str], {
            //   type: "text/csv;charset=iso-8859-1",
            // });
            // const csv = window.URL.createObjectURL(data);
            // window.open(csv, "_blank");
          }}
        >
          Descargar csv base
        </Button>
      </ButtonBar>
      <PaginationAuth
        filters={{
          file: {
            label: "Elegir archivo de usuarios",
            type: "file",
            disabled: isUploading,
            accept: ".csv",
            onGetFile: onFileCharge,
            required: false,
          },
          name_group: { label: "Grupo para los usuarios" },
        }}
        maxPage={maxPage}
        onChange={onChange}
        lgButtons={false}
      />
      {selectedGroup ? (
        <ButtonBar className={"col-span-1"}>
          <Button
            type={"button"}
            onClick={() => {
              setSelectedGroup(null);
            }}
          >
            {`${selectedGroup.id_group}) ${selectedGroup.name_group}`}{" "}
            <span className="bi bi-trash-fill" />
          </Button>
        </ButtonBar>
      ) : (
        ""
      )}
      {Array.isArray(foundGroups) && foundGroups.length > 0 ? (
        <Table
          headers={["Id", "Nombre del grupo"]}
          data={foundGroups.map(({ id_group, name_group }) => {
            return { id_group, name_group };
          })}
          onSelectRow={(e, i) => {
            setSelectedGroup(foundGroups[i]);
            setFoundGroups([]);
            setMaxPage(1);
          }}
        />
      ) : (
        ""
      )}
      <Form onSubmit={onSubmit} grid>
        <ButtonBar>
          <Button type={"submit"}>Crear usuarios</Button>
        </ButtonBar>
      </Form>
    </div>
  );
};

export default MassiveUpload;
