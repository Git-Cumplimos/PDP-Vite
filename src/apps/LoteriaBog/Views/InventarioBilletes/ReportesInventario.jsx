import Table from "../../../../components/Base/Table";
import { useEffect, useState } from "react";
import { useLoteria } from "../../utils/LoteriaHooks";
import { notifyError } from "../../../../utils/notify";
import TableEnterprise from "../../../../components/Base/TableEnterprise";

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
	const { consultaInventarioReporte } = useLoteria();
	const [reporteInventario, setReporteInventario] = useState(initReporte);
	const [showTabla, setShowTabla] = useState(false);

	useEffect(() => {
		loadDocument();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const loadDocument = async () => {
		consultaInventarioReporte().then((res) => {
			if (!res?.status) {
				notifyError("error");
			} else {
				setReporteInventario(res?.Respuesta);
				setShowTabla(true);
				// console.log("reportese _ a", reporteInventario);
			}
		});
	};
	return (
		<div>
			{showTabla ? (
				<TableEnterprise
					title="Reporte Inventario"
					headers={[
						"Sorteo",
						"Loteria",
						"Estado",
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
								estado_sorteo,
								fecha_creacion,
								inventario,
								total_asignaciones,
								total_inventario,
								// inconcistencia,
								comentario,
							}) => {
								return {
									num_sorteo,
									num_loteria,
									estado_sorteo,
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
					// onSelectRow={console.log("a")}
				/>
			) : (
				""
			)}
		</div>
	);
};

export default ReporteInventario;
