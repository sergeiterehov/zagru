import { ZA } from "@/za";
import { InputGroup, NativeSelect, NumberInput, Input, Stack, Text } from "@chakra-ui/react";
import { produce } from "immer";

export const ValueItemProps = (props: { value: ZA.QB.ValueItem; onChange(update: ZA.QB.ValueItem): void }) => {
  const { value, onChange } = props;

  if (value.aka === "const") {
    return (
      <InputGroup
        flex="1"
        endAddon={
          <NativeSelect.Root size="xs" variant="plain" width="auto">
            <NativeSelect.Field
              fontSize="sm"
              value={value.type}
              onChange={(e) => {
                const valueInput = e.currentTarget.value as typeof value.type;
                const next = produce(value, (prev) => {
                  prev.type = valueInput;

                  if (prev.type === "number") {
                    if (typeof prev.val !== "number") prev.val = 0;
                  } else if (prev.type === "string") {
                    if (typeof prev.val !== "string") prev.val = "";
                  }
                });

                onChange(next);
              }}
            >
              <option value="number">Number</option>
              <option value="string">String</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        }
      >
        {(() => {
          if (value.type === "number") {
            return (
              <NumberInput.Root
                value={String(value.val)}
                onValueChange={(e) => {
                  const valueInput = Number(e.value);
                  const next = produce(value, (prev) => {
                    prev.val = valueInput;
                  });

                  return onChange(next);
                }}
              >
                <NumberInput.Input />
              </NumberInput.Root>
            );
          }

          return (
            <Input
              placeholder="Text"
              value={value.val}
              onChange={(e) => {
                const valueInput = e.currentTarget.value;
                const next = produce(value, (prev) => {
                  prev.val = valueInput;
                });

                return onChange(next);
              }}
            />
          );
        })()}
      </InputGroup>
    );
  }

  if (value.aka === "col") {
    return (
      <Stack direction="row">
        <Input
          placeholder="Table"
          value={value.table}
          onChange={(e) => {
            const valueInput = e.currentTarget.value;
            const next = produce(value, (prev) => {
              prev.table = valueInput;
            });

            return onChange(next);
          }}
        />
        <Input
          placeholder="Column"
          value={value.col}
          onChange={(e) => {
            const valueInput = e.currentTarget.value;
            const next = produce(value, (prev) => {
              prev.col = valueInput;
            });

            return onChange(next);
          }}
        />
      </Stack>
    );
  }

  return <Text color="fg.error">unknown</Text>;
};
