import { Box, createTreeCollection, Stack, TreeView } from "@chakra-ui/react";
import { useAppStore } from "../app.store.context";
import { TbAbc, TbCalendar, TbNumber123, TbQuestionMark, TbTable } from "react-icons/tb";
import { ZA } from "@/za";

type Node = {
  id: string;
  obj?:
    | {
        column: ZA.ColumnInfo;
      }
    | { table: ZA.ColumnInfo[] };
  children?: Node[];
};

export const SpaceProps = () => {
  const columns = useAppStore((s) => s.columns);
  const space = useAppStore((s) => s.space);

  const nodeToString = (node: Node) => {
    if (!node.obj) return "";

    if ("table" in node.obj) {
      const col = node.obj.table[0];
      return [col.database_name, col.table_name].join(".");
    }

    return node.obj.column.column_name;
  };

  return (
    <Stack>
      <Box>Databases:</Box>
      {space.env.dbs.map((db) => (
        <Box key={db.id}>
          <Box fontWeight="bolder">{db.alias}</Box>
          <Box>{db.type === "sqlite" && `file: ${db.props.file}`}</Box>
        </Box>
      ))}
      {(() => {
        if (!columns) return;

        const tablesColumns = new Map<string, ZA.ColumnInfo[]>();

        for (const col of columns) {
          const tableName = `${col.database_name}.${col.table_name}`;

          const cols = tablesColumns.get(tableName) || [];

          cols.push(col);
          tablesColumns.set(tableName, cols);
        }

        const collection = createTreeCollection<Node>({
          nodeToValue: (node) => node.id,
          rootNode: {
            id: "ROOT",
            children: [...tablesColumns.entries()].map(
              ([table, cols]): Node => ({
                id: table,
                obj: { table: cols },
                children: cols.map((column) => ({
                  id: `${table}.${column.column_name}`,
                  obj: { column },
                })),
              })
            ),
          },
        });

        return (
          <TreeView.Root collection={collection} maxW="sm">
            <TreeView.Label>Tables</TreeView.Label>
            <TreeView.Tree>
              <TreeView.Node<Node>
                indentGuide={<TreeView.BranchIndentGuide />}
                render={({ node, nodeState }) =>
                  nodeState.isBranch ? (
                    <TreeView.BranchControl>
                      <TbTable />
                      <TreeView.BranchText>{nodeToString(node)}</TreeView.BranchText>
                    </TreeView.BranchControl>
                  ) : (
                    <TreeView.Item>
                      {(() => {
                        const type = node.obj && "column" in node.obj && node.obj.column.data_type;

                        if (!type) return;

                        if (/char|string|text/i.test(type)) return <TbAbc />;

                        if (/int|float|decimal|number|double/i.test(type)) return <TbNumber123 />;

                        if (/date|time/i.test(type)) return <TbCalendar />;

                        return <TbQuestionMark />;
                      })()}
                      <TreeView.ItemText>{nodeToString(node)}</TreeView.ItemText>
                    </TreeView.Item>
                  )
                }
              />
            </TreeView.Tree>
          </TreeView.Root>
        );
      })()}
    </Stack>
  );
};
