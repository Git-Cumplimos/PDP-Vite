import DestinoLogoEvertec from "./Base/Evertec/DestinoLogoEvertec";
import TicketsEvertec from "./Base/Evertec/TicketsEvertec";
import DestinoLogoGou from "./Base/Gou/DestinoLogoGou";
import TicketsGou from "./Base/Gou/TicketsGou";

export const ListaDestinos = {
  GOU: DestinoLogoGou,
  EVERTEC: DestinoLogoEvertec,
};

export const ListaTramites = {
  GOU_RECARGAR_CUPO: TicketsGou,
  EVERTEC_RECARGAR_CUPO: TicketsEvertec,
};
