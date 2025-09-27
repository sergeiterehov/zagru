import { ZA } from "@/za";
import { Text } from "@chakra-ui/react";

export const ValueItem = (props: { value: ZA.QB.ValueItem }) => {
  const { value } = props;

  if (value.aka === "col") return <Text>{value.col}</Text>;

  if (value.aka === "const") return <Text>{JSON.stringify(value.val)}</Text>;

  return <Text color="fg.error">unknown</Text>;
};
