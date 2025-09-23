import { ZA } from "@/za";
import {
  Badge,
  Box,
  Button,
  Field,
  Fieldset,
  Input,
  Menu,
  NativeSelect,
  Popover,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import {
  TbArrowDownLeft,
  TbArrowsCross,
  TbArrowUp,
  TbAsterisk,
  TbFreezeColumn,
  TbPlug,
  TbTable,
  TbTableShortcut,
} from "react-icons/tb";

const FromItem = (props: { node: ZA.Nodes.Selection; from: ZA.QB.FromItem }) => {
  const { from, node } = props;

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const joined = node.props.query.from.indexOf(from) > 0;

  return (
    <Popover.Root
      positioning={{ placement: "right", getAnchorRect: () => buttonRef.current!.getBoundingClientRect() }}
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <Menu.Root>
        <Menu.ContextTrigger asChild>
          <Button
            ref={buttonRef}
            variant="outline"
            aria-expanded={open}
            width="full"
            justifyContent="flex-start"
            onClick={() => setOpen(true)}
          >
            {node.props.refs?.includes(from.table) ? <TbTableShortcut /> : <TbTable />}
            <Text flexGrow={1} textAlign="start">
              {from.table}
            </Text>
            {joined && (
              <>
                {from.join ? (
                  <Badge size="xs">
                    <TbArrowUp />
                    {`${from.join.type.toUpperCase()} JOIN`}
                  </Badge>
                ) : (
                  <Badge size="xs">
                    <TbArrowsCross />
                    CROSS JOIN
                  </Badge>
                )}
              </>
            )}
          </Button>
        </Menu.ContextTrigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item value="new-txt">Move up</Menu.Item>
              <Menu.Item value="new-file">Move Down</Menu.Item>
              <Menu.Item value="delete" color="fg.error" _hover={{ bg: "bg.error", color: "fg.error" }}>
                Delete...
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Body>
              <Stack gap="4">
                <Field.Root>
                  <Field.Label>Table name</Field.Label>
                  <Input placeholder="Table name with database" value={from.table} />
                </Field.Root>

                {joined && (
                  <>
                    <Field.Root>
                      <Field.Label>Join</Field.Label>
                      <NativeSelect.Root>
                        <NativeSelect.Field value={from.join?.type}>
                          <option value="">Cross join</option>
                          <option value="left">Left join</option>
                          <option value="right">Right join</option>
                          <option value="inner">Inner join</option>
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>
                    </Field.Root>

                    {from.join?.on ? (
                      <>
                        <Field.Root>
                          <Field.Label>On</Field.Label>
                          <Input placeholder="Column" value={from.join.on.col} />
                          <Field.Label>equals</Field.Label>
                          <Stack direction="row">
                            <Input placeholder="Prev table" value={from.join.on.ext_table} />
                            <Input placeholder="Prev table column" value={from.join.on.ext_col} />
                          </Stack>
                        </Field.Root>
                        <Button size="xs" variant="ghost">
                          Use natural join
                        </Button>
                      </>
                    ) : (
                      <Button size="xs" variant="ghost">
                        Select columns
                      </Button>
                    )}
                  </>
                )}
              </Stack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

export const SelectionProps = (props: { node: ZA.Nodes.Selection }) => {
  const { node } = props;
  return (
    <>
      <div>
        <Fieldset.Root size="lg" maxW="md">
          <Stack>
            <Fieldset.Legend>SQL Select</Fieldset.Legend>
            <Fieldset.HelperText>Please provide your selection details below.</Fieldset.HelperText>
          </Stack>

          <Fieldset.Content>
            <Field.Root>
              <Field.Label>Tables</Field.Label>
              <Stack width="full">
                {node.props.query.from.map((f, i) => (
                  <FromItem key={i} node={node} from={f} />
                ))}
                <Button variant="ghost" width="full" size="xs">
                  Add table
                </Button>
              </Stack>
            </Field.Root>

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
                  <Button variant="outline" width="full" justifyContent="flex-start">
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
        </Fieldset.Root>
      </div>
    </>
  );
};
