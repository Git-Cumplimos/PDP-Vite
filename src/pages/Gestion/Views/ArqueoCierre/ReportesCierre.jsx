import { Fragment, useState, useCallback } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import { onChangeNumber } from "../../../../utils/functions";
import { notifyPending } from "../../../../utils/notify";
import { buscarReportesArqueo } from "../../utils/fetchCaja";

const ReportesCierre = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchInfo, setSearchInfo] = useState({
    id_usuario: "",
    id_comercio: "",
    date_ini: "",
    date_end: "",
  });

  const buscarReportes = useCallback(
    (ev) => {
      ev.preventDefault();
      notifyPending(
        buscarReportesArqueo({
          ...Object.fromEntries(
            Object.entries(searchInfo).filter(([, val]) => val)
          ),
        }),
        {
          render: () => {
            setIsLoading(true);
            return "Buscando informacion";
          },
        },
        {
          render: ({ data: response }) => {
            setIsLoading(false);
            const filename = response.headers
              .get("Content-Disposition")
              .split("; ")?.[1]
              .split("=")?.[1];

            response.blob().then((blob) => {
              if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(blob, filename);
              } else {
                // other browsers
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
            return "Descarga de reporte de arqueo exitosa";
          },
        },
        {
          render: ({ data: err }) => {
            setIsLoading(false);
            if (err?.cause === "custom") {
              return err?.message;
            }
            console.error(err?.message);
            return "Descarga de reporte de arqueo fallida";
          },
        }
      );
    },
    [searchInfo]
  );

  return (
    <Fragment>
      <h1 className="text-3xl mt-10 mb-8">Reportes</h1>
      <Form onSubmit={buscarReportes} grid>
        <Input
          id="dateInit"
          name={"date_ini"}
          label="Fecha inicial"
          type="date"
          onInput={(ev) =>
            setSearchInfo((old) => ({
              ...old,
              [ev.target.name]: ev.target.value,
            }))
          }
        />
        <Input
          id="dateEnd"
          name={"date_end"}
          label="Fecha final"
          type="date"
          onInput={(ev) =>
            setSearchInfo((old) => ({
              ...old,
              [ev.target.name]: ev.target.value,
            }))
          }
        />
        <Input
          id="id_comercio"
          name={"id_comercio"}
          label="Id comercio"
          type="tel"
          onInput={(ev) =>
            setSearchInfo((old) => ({
              ...old,
              [ev.target.name]: onChangeNumber(ev),
            }))
          }
        />
        <Input
          id="id_usuario"
          name={"id_usuario"}
          label="Id usuario"
          type="tel"
          onInput={(ev) =>
            setSearchInfo((old) => ({
              ...old,
              [ev.target.name]: onChangeNumber(ev),
            }))
          }
        />
        <ButtonBar className="lg:col-span-2">
          <Button type="submit" disabled={isLoading}>
            Descargar reporte de arqueo
            <p className="w-full whitespace-pre-wrap"></p>
          </Button>
        </ButtonBar>
      </Form>
    </Fragment>
  );
};

export default ReportesCierre;
