import { ZA } from "@/za";
import { Stack, Field, Input, NativeSelect, Button } from "@chakra-ui/react";
import { produce } from "immer";

export const FromItemProps = (props: {
  node: ZA.Nodes.Selection;
  from: ZA.QB.FromItem;
  onChange(update: ZA.QB.FromItem): void;
}) => {
  const { from, node, onChange } = props;

  const joined = node.props.query.from.indexOf(from) > 0;

  return (
    <Stack gap="4">
      <Field.Root>
        <Field.Label>Table name</Field.Label>
        <Input
          placeholder="Table name with database"
          value={from.table}
          onChange={(e) => {
            const value = e.currentTarget.value;
            const next = produce(from, (prev) => {
              prev.table = value;
            });

            return onChange(next);
          }}
        />
      </Field.Root>

      {joined && (
        <>
          <Field.Root>
            <Field.Label>Join</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field
                value={from.join?.type || ""}
                onChange={(e) => {
                  const update = e.currentTarget.value as ZA.QB.JoinType | "";
                  const next = produce(from, (prev) => {
                    if (!update) {
                      delete prev.join;
                      return;
                    }

                    if (!prev.join) {
                      prev.join = { type: update };
                    } else {
                      prev.join.type = update;
                    }
                  });

                  onChange(next);
                }}
              >
                <option value="">Cross natural join</option>
                <option value="left">Left join</option>
                <option value="right">Right join</option>
                <option value="inner">Inner join</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>

          {from.join?.on && (
            <>
              <Field.Root>
                <Field.Label>On</Field.Label>
                <Input
                  placeholder="Column"
                  value={from.join.on.col}
                  onChange={(e) => {
                    const value = e.currentTarget.value;
                    const next = produce(from, (prev) => {
                      if (!prev.join?.on) return;

                      prev.join.on.col = value;
                    });

                    return onChange(next);
                  }}
                />
              </Field.Root>
              <Field.Root>
                <Field.Label>equals</Field.Label>
                <Stack direction="row">
                  <Input
                    placeholder="Prev table"
                    value={from.join.on.ext_table}
                    onChange={(e) => {
                      const value = e.currentTarget.value;
                      const next = produce(from, (prev) => {
                        if (!prev.join?.on) return;

                        prev.join.on.ext_table = value;
                      });

                      return onChange(next);
                    }}
                  />
                  <Input
                    placeholder="Prev column"
                    value={from.join.on.ext_col}
                    onChange={(e) => {
                      const value = e.currentTarget.value;
                      const next = produce(from, (prev) => {
                        if (!prev.join?.on) return;

                        prev.join.on.ext_col = value;
                      });

                      return onChange(next);
                    }}
                  />
                </Stack>
              </Field.Root>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => {
                  const next = produce(from, (prev) => {
                    if (!prev.join) return;

                    delete prev.join.on;
                  });

                  onChange(next);
                }}
              >
                Use natural join
              </Button>
            </>
          )}

          {from.join && !from.join.on && (
            <Button
              size="xs"
              variant="ghost"
              onClick={() => {
                const next = produce(from, (prev) => {
                  if (!prev.join) return;

                  prev.join.on = { col: "", ext_col: "", ext_table: "" };
                });

                onChange(next);
              }}
            >
              Select columns
            </Button>
          )}
        </>
      )}
    </Stack>
  );
};
