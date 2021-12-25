import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input/Input";

const RefsForm = ({ data, onSubmit, btnName }) => {
  return Array.isArray(data) && data.length > 0 ? (
    <Form onSubmit={onSubmit} grid>
      {data.map(([key, val], ind) => {
        return (
          <Input
            key={ind}
            id={key}
            name={key}
            label={key}
            type={"text"}
            defaultValue={val}
          />
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
