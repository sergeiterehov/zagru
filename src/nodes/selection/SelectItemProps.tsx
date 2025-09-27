import { ZA } from "@/za";
import { Field, Fieldset, HStack, Input, NativeSelect } from "@chakra-ui/react";

export const SelectItemProps = (props: { selector: ZA.QB.SelectItem }) => {
  const { selector } = props;

  return (
    <Fieldset.Root size="lg">
      <Fieldset.Content>
        <Field.Root>
          <Field.Label>Column</Field.Label>
          <HStack>
            <Input
              placeholder="Table"
              value={selector.table}
              onChange={(e) => {
                const value = e.currentTarget.value;
              }}
            />
            <Input
              placeholder="Column"
              value={selector.col}
              onChange={(e) => {
                const value = e.currentTarget.value;
              }}
            />
          </HStack>
        </Field.Root>

        <Field.Root>
          <Field.Label>Aggregation</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              value={selector.agg || ""}
              onChange={(e) => {
                const value = e.currentTarget.value as ZA.QB.AggregationType | "";
              }}
            >
              <option value="">No</option>
              <option value="sum">Sum</option>
              <option value="max">Max</option>
              <option value="min">Min</option>
              <option value="avg">Avg</option>
              <option value="count">Count</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>

        <Field.Root>
          <Field.Label>Alias</Field.Label>
          <Input
            placeholder="Auto"
            value={selector.alias || ""}
            onChange={(e) => {
              const value = e.currentTarget.value;
            }}
          />
        </Field.Root>
      </Fieldset.Content>
    </Fieldset.Root>
  );
};
