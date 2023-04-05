import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import useFetchDebounce from "../../../../hooks/useFetchDebounce";
import { notifyError } from "../../../../utils/notify";
import Input from "../../../../components/Base/Input";

const urlIAM = process.env.REACT_APP_URL_IAM_PDP;

const urlComercios = process.env.REACT_APP_URL_SERVICE_COMMERCE;

const mapGroups = (data) => data;
const mapCommerce = ({
  pk_comercio,
  nombre_comercio,
  numero_identificacion,
  comercio_padre,
}) => ({
  pk_comercio,
  nombre_comercio,
  numero_identificacion,
  comercio_padre: comercio_padre || "No asociado",
});

const SearchTables = ({ searchType, onSelectItem = () => {} }) => {
  const [seachUrl, setSearchUrl] = useState("");
  const [tableProps, setTableProps] = useState({
    title: "",
    headers: [],
  });
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [searchFilters, setSearchFilters] = useState({});
  const [urlSearchFilters, setUrlSearchFilters] = useState("");
  const [fetchOptions, setFetchOptions] = useState({});

  const [searchData, setSearchData] = useState(null);

  useEffect(() => {
    setSearchFilters({});
  }, [searchType]);

  useEffect(() => {
    const cleanSearchFilters = Object.fromEntries(
      Object.entries(searchFilters).filter(([, val]) => val)
    );
    switch (searchType) {
      case "groups":
        setSearchUrl(`${urlIAM}/groups`);
        setTableProps({
          title: "Buscar grupos",
          headers: ["Id de grupo", "Nombre de grupo"],
        });

        const urlParams = new URLSearchParams();
        Object.entries(cleanSearchFilters ?? {})
          .filter(([, val]) => val)
          .forEach(([key, val]) => {
            urlParams.set(key, val);
          });
        Object.entries(pageData).forEach(([key, val]) => {
          urlParams.set(key, val);
        });
        setUrlSearchFilters(`?${urlParams.toString()}`);
        setFetchOptions({});
        break;
      case "commerce":
        setSearchUrl(`${urlComercios}/comercios/consultar`);
        setTableProps({
          title: "Buscar comercios",
          headers: ["Id", "Comercio", "Documento", "Comercio padre"],
        });
        setUrlSearchFilters("");
        setFetchOptions({
          method: "POST",
          body: JSON.stringify({ ...cleanSearchFilters, ...pageData }),
          headers: { "Content-Type": "application/json" },
        });
        break;
      default:
        throw new Error("Type not supported");
    }
  }, [searchType, searchFilters, pageData]);

  useFetchDebounce(
    {
      url: useMemo(
        () => `${seachUrl}${urlSearchFilters}`,
        [seachUrl, urlSearchFilters]
      ),
      options: fetchOptions,
    },
    {
      onSuccess: useCallback((data) => setSearchData(data?.obj), []),
      onError: useCallback((error) => {
        if (error?.cause === "custom") {
          notifyError(error.message);
        } else {
          console.error(error);
        }
      }, []),
    }
  );

  const mappedData = useMemo(() => {
    if (!searchData) {
      return [];
    }
    switch (searchType) {
      case "groups":
        return searchData?.results?.map(mapGroups);
      case "commerce":
        return searchData?.results?.map(mapCommerce);
      default:
        throw new Error("Type not supported");
    }
  }, [searchType, searchData]);

  return (
    <Fragment>
      <TableEnterprise
        {...tableProps}
        data={mappedData}
        maxPage={searchData?.maxPages ?? searchData?.maxpages ?? 0}
        onSetPageData={setPageData}
        onSelectRow={(ev, i) => onSelectItem(searchData?.results?.[i])}
        onChange={(ev) =>
          setSearchFilters((old) => ({
            ...old,
            [ev.target.name]: ev.target.value,
          }))
        }
      >
        {searchType === "groups" && (
          <Fragment>
            <Input
              id="id_group"
              name="id_group"
              label={"Id de grupo"}
              type="tel"
              autoComplete="off"
            />
            <Input
              id="name_group"
              name="name_group"
              label={"Nombre de grupo"}
              type="text"
              autoComplete="off"
            />
          </Fragment>
        )}
        {searchType === "commerce" && (
          <Fragment>
            <Input
              id="co1.pk_comercio"
              name="co1.pk_comercio"
              label={"Id de comercio"}
              type="tel"
              autoComplete="off"
            />
            <Input
              id="co1.nombre_comercio"
              name="co1.nombre_comercio"
              label={"Nombre del comercio"}
              type="text"
              autoComplete="off"
            />
          </Fragment>
        )}
      </TableEnterprise>
    </Fragment>
  );
};

export default SearchTables;
