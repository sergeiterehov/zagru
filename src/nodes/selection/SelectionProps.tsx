import { ZA } from "@/za";
import { Button, Field, Fieldset, Stack, Tabs } from "@chakra-ui/react";
import { produce } from "immer";
import { TbAsterisk, TbDatabaseSearch, TbFreezeColumn } from "react-icons/tb";
import { FromItem } from "./FromItem";
import { WhereOrItem } from "./WhereItem";

export const SelectionProps = (props: { node: ZA.Nodes.Selection; onChange(update: ZA.Nodes.Selection): void }) => {
  const { node, onChange } = props;

  return (
    <>
      <div>
        <Fieldset.Root size="lg">
          <Stack>
            <Fieldset.Legend>SQL Select</Fieldset.Legend>
            <Fieldset.HelperText>Please provide your selection details below.</Fieldset.HelperText>
          </Stack>

          <Tabs.Root lazyMount defaultValue="extracting" variant="plain">
            <Tabs.List bg="bg.muted" rounded="l3" p="1">
              <Tabs.Trigger value="extracting">
                <TbDatabaseSearch />
                Extract
              </Tabs.Trigger>
              <Tabs.Trigger value="select">
                <TbAsterisk />
                Select
              </Tabs.Trigger>
              <Tabs.Indicator rounded="l2" />
            </Tabs.List>

            <Tabs.Content value="extracting">
              <Fieldset.Content>
                <Field.Root>
                  <Field.Label>Tables</Field.Label>
                  <Stack width="full">
                    {node.props.query.from.map((f, i) => (
                      <FromItem
                        key={i}
                        node={node}
                        from={f}
                        onChange={(update) => {
                          const next = produce(node, (prev) => {
                            prev.props.query.from[i] = update;
                          });

                          onChange(next);
                        }}
                        onDelete={() => {
                          const next = produce(node, (prev) => {
                            prev.props.query.from.splice(i, 1);
                          });

                          onChange(next);
                        }}
                        onMove={(dir) => {
                          const newIndex = i + dir;
                          if (newIndex < 0 || newIndex >= node.props.query.from.length) return;

                          const next = produce(node, (prev) => {
                            const tmp = prev.props.query.from[i];
                            prev.props.query.from[i] = prev.props.query.from[newIndex];
                            prev.props.query.from[newIndex] = tmp;
                          });

                          onChange(next);
                        }}
                      />
                    ))}
                    <Button variant="ghost" width="full" size="xs">
                      Add table
                    </Button>
                  </Stack>
                </Field.Root>

                <Field.Root>
                  <Field.Label>Filters</Field.Label>
                  <Stack width="full">
                    <WhereOrItem
                      root
                      where={node.props.query.where}
                      onChange={(update) => {
                        const next = produce(node, (prev) => {
                          prev.props.query.where = update;
                        });

                        onChange(next);
                      }}
                    />
                    <Button variant="ghost" width="full" size="xs">
                      Add filter
                    </Button>
                  </Stack>
                </Field.Root>
              </Fieldset.Content>
            </Tabs.Content>

            <Tabs.Content value="select">
              <Fieldset.Content>
                <Field.Root>
                  <Field.Label>Columns</Field.Label>
                  <Stack width="full">
                    {!node.props.query.select.length && (
                      <Button disabled variant="outline" width="full" justifyContent="flex-start">
                        <TbAsterisk />
                        All columns
                      </Button>
                    )}
                    {node.props.query.select.map((s, i) => (
                      <Button key={i} variant="outline" width="full" justifyContent="flex-start">
                        <TbFreezeColumn />
                        {`${s.table}.${s.col}`}
                      </Button>
                    ))}
                    <Button variant="ghost" width="full" size="xs">
                      Add column
                    </Button>
                  </Stack>
                </Field.Root>
              </Fieldset.Content>
            </Tabs.Content>
          </Tabs.Root>
        </Fieldset.Root>
      </div>
    </>
  );
};
