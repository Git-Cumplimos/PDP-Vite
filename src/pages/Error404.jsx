import { useHistory } from "react-router-dom"
import Button from "../components/Base/Button/Button"
import ButtonBar from "../components/Base/ButtonBar/ButtonBar"

const Error404 = () => {
  const { goBack, replace } = useHistory();
  return (
    <div className="m-auto w-auto md:w-1/2 text-center">
      <h1 className="text-4xl">404</h1>
      <p className="text-2xl">Not found</p>
      <ButtonBar>
        <Button onClick={goBack}>Volver</Button>
        <Button onClick={() => replace("/")}>Ir a inicio</Button>
      </ButtonBar>
    </div>
  )
}

export default Error404
