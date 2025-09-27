import { ZA } from "@/za";
import { Fieldset, Field, SegmentGroup, Text } from "@chakra-ui/react";
import { produce } from "immer";
import { ValueItemProps } from "./ValueItemProps";

export const WhereItemProps = (props: { where: ZA.QB.WhereItem; onChange(update: ZA.QB.WhereItem): void }) => {
  const { where, onChange } = props;

  return (
    <Fieldset.Root size="lg">
      <Fieldset.Content>
        {(() => {
          if ("left" in where) {
            return (
              <>
                <Field.Root>
                  <ValueItemProps
                    value={where.left}
                    onChange={(update) => {
                      const next = produce(where, (prev) => {
                        prev.left = update;
                      });

                      onChange(next);
                    }}
                  />
                </Field.Root>
                <Field.Root>
                  <SegmentGroup.Root
                    value={where.aka}
                    onValueChange={(e) => {
                      const value = e.value as typeof where.aka;
                      const next = produce(where, (prev) => {
                        prev.aka = value;
                      });

                      onChange(next);
                    }}
                  >
                    <SegmentGroup.Indicator bg="bg" />
                    <SegmentGroup.Items items={["<", "<=", "=", ">=", ">", "!="]} />
                  </SegmentGroup.Root>
                </Field.Root>
                <Field.Root>
                  <ValueItemProps
                    value={where.right}
                    onChange={(update) => {
                      const next = produce(where, (prev) => {
                        prev.right = update;
                      });

                      onChange(next);
                    }}
                  />
                </Field.Root>
              </>
            );
          }

          if ("obj" in where) {
            return (
              <>
                <Field.Root>
                  <ValueItemProps
                    value={where.obj}
                    onChange={(update) => {
                      const next = produce(where, (prev) => {
                        prev.obj = update;
                      });

                      onChange(next);
                    }}
                  />
                </Field.Root>
                <Field.Root>
                  <SegmentGroup.Root
                    value={where.aka}
                    onValueChange={(e) => {
                      const value = e.value as typeof where.aka;
                      const next = produce(where, (prev) => {
                        prev.aka = value;
                      });

                      onChange(next);
                    }}
                  >
                    <SegmentGroup.Indicator bg="bg" />
                    <SegmentGroup.Items items={["is null", "is not null"]} />
                  </SegmentGroup.Root>
                </Field.Root>
              </>
            );
          }

          return <Text color="fg.error">unknown</Text>;
        })()}
      </Fieldset.Content>
    </Fieldset.Root>
  );
};
