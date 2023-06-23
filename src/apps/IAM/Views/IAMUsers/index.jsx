import { Fragment, useCallback, useMemo, useState } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import useFetchDebounce from "../../../../hooks/useFetchDebounce";
import Input from "../../../../components/Base/Input";
import { onChangeNumber } from "../../../../utils/functions";
import { useNavigate } from "react-router-dom";
import useMap from "../../../../hooks/useMap";
import DataTable from "../../../../components/Base/DataTable/DataTable";

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
  const [searchFilters, { setAll: setSearchFilters, set: setSingleFilter }] =
    useMap(initialSearchFilters);

  // const [loadingUserData] = 
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

  return (
    <Fragment>
      <ButtonBar>
        <Button type={"submit"} onClick={() => navigate("/iam/users/new-user")}>
          Nuevo usuario
        </Button>
        {/* <Button
          type={"button"}
          onClick={() => {
            setShowModal(true);
            setMassiveUpload(true);
          }}
        >
          Creacion masiva de usuarios
        </Button> */}
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
    </Fragment>
  );
};

export default IAMUsers;
