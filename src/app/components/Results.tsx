import { memo } from "react";
import { useAppStore } from "../app.store.context";
import { ZA } from "@/za";
import { Box, DataList, Stack, Table } from "@chakra-ui/react";

export const NodeResults = memo((props: { node: ZA.Node }) => {
  const { node } = props;

  const actions = useAppStore((s) => s.actions);
  const state = useAppStore((s) => s.executionResult?.states[node.id]);
  const print = useAppStore((s) => s.executionResult?.print_table[node.id]);

  if (!state) return "No results";

  return (
    <Stack>
      <Box>{state.status}</Box>
      {state.error ? (
        <Box whiteSpace="pre" fontFamily="monospace" color="fg.error" overflowY="auto">
          {state.error}
        </Box>
      ) : undefined}
      <DataList.Root>
        {Object.entries(state.output).map(([output, value], i) => (
          <DataList.Item key={i}>
            <DataList.ItemLabel>{output}</DataList.ItemLabel>
            <DataList.ItemValue>{value}</DataList.ItemValue>
          </DataList.Item>
        ))}
      </DataList.Root>
      {print ? (
        <Table.Root size="sm" variant="outline">
          <Table.Header>
            <Table.Row>
              {print.cols.map((col, i) => (
                <Table.ColumnHeader key={i}>{String(col)}</Table.ColumnHeader>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {print.rows.map((row, i_row) => (
              <Table.Row key={i_row}>
                {row.map((cell, i_cell) => (
                  <Table.ColumnHeader key={i_cell}>{String(cell)}</Table.ColumnHeader>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      ) : undefined}
    </Stack>
  );
});
