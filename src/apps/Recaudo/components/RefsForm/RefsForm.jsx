import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";

const RefsForm = ({ data, onSubmit, btnName }) => {
  return Array.isArray(data) && data.length > 0 ? (
    <Form onSubmit={onSubmit} grid>
      {data.map(({ nombre_referencia: key, ...rest }, ind) => {
        return (
          <Input key={ind} id={key} label={key} autoComplete="off" {...rest} />
        );
      })}
      <ButtonBar className={"lg:col-span-2"}>
        <Button type={"submit"}>{btnName}</Button>
      </ButtonBar>
    </Form>
  ) : (
    ""
  );
};

export default RefsForm;
