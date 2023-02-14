import Table from "../../../../components/Base/Table";
import { useEffect, useState } from "react";
import { useLoteria } from "../../utils/LoteriaHooks";
import { notifyError } from "../../../../utils/notify";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Input from "../../../../components/Base/Input";

const ReporteInventario = ({ subRoutes, route: { label } }) => {
	const initReporte = [
		{
			num_sorteo: "",
			num_loteria: "",
			estado_sorteo: "",
			fecha_creacion: "",
			inventario: "",
			total_asignaciones: "",
			total_inventario: "",
			inconcistencia: "",
			comentario: "",
		},
	];
	const dateFormatter = Intl.DateTimeFormat("es-CO", {
		year: "numeric",
		month: "numeric",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
	});
	const [pageData, setPageData] = useState({ page: 1, limit: 10 });
	const [reporteInventario, setReporteInventario] = useState(initReporte);
	const [numeroSorteo, setNumeroSorteo] = useState("");
	const [showTabla, setShowTabla] = useState(false);
	const [maxPages, setMaxPages] = useState(1)
	const { consultaInventarioReporte } = useLoteria();
	useEffect(() => {
		loadDocument(numeroSorteo, pageData);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [numeroSorteo, pageData]);

	const loadDocument = async (numeroSorteo, pageData) => {
		consultaInventarioReporte(numeroSorteo, pageData).then((res) => {
			if (!res?.status) {
				notifyError("error");
			} else {
				setReporteInventario(res?.Respuesta);
				setMaxPages(res?.maxPage);
				setShowTabla(true);
			}
		});
	};

	return (
		<>

			<h1 class="text-3xl">Reporte Inventario</h1>
			<div>
				{showTabla ? (
					<TableEnterprise
						title="Reporte Inventario"
						maxPage={maxPages}
						headers={[
							"Sorteo",
							"Loteria",
							"cod_distribuidor",
							"cod_sucursal",
							"Fecha Inicio",
							"Inventario",
							"Total Asignado",
							"Total Inventariado",
							// "inconcistencia",
							"Comentario",
						]}
						data={
							reporteInventario &&
							reporteInventario?.map(
								({
									num_sorteo,
									num_loteria,
									cod_distribuidor,
									cod_sucursal,
									fecha_creacion,
									inventario,
									total_asignaciones,
									total_inventario,
									// inconcistencia,
									comentario,
								}) => {
									const tempDate = new Date(fecha_creacion);
									tempDate.setHours(tempDate.getHours() + 5);
									fecha_creacion = dateFormatter.format(tempDate);
									return {
										num_sorteo,
										num_loteria,
										cod_distribuidor,
										cod_sucursal,
										fecha_creacion,
										inventario,
										total_asignaciones,
										total_inventario,
										// inconcistencia,
										comentario,
									};
								}
							)
						}
					>
						<Input
							id="numSorteo"
							label="Numero de sorte: "
							type="text"
							value={numeroSorteo}
							onInput={(e) => setNumeroSorteo(e.target.value)}
						/>
						{/* onSetPageData={setPageData} */}
					</TableEnterprise>
				) : (
					""
				)}
			</div>
		</>
	);
};

export default ReporteInventario;
