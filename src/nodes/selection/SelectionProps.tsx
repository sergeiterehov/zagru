import { ZA } from "@/za";
import {
  Badge,
  Box,
  Button,
  Field,
  Fieldset,
  HStack,
  Input,
  InputGroup,
  Menu,
  NativeSelect,
  NumberInput,
  Popover,
  Portal,
  SegmentGroup,
  Separator,
  Stack,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { Fragment, useRef, useState } from "react";
import {
  TbArrowDown,
  TbArrowsCross,
  TbArrowUp,
  TbAsterisk,
  TbCodeAsterisk,
  TbDatabaseSearch,
  TbEye,
  TbEyeClosed,
  TbFilter,
  TbFreezeColumn,
  TbTable,
  TbTableShortcut,
  TbTrash,
} from "react-icons/tb";

const ValueItem = (props: { value: ZA.QB.ValueItem }) => {
  const { value } = props;

  if (value.aka === "col") return <Text>{value.col}</Text>;

  if (value.aka === "const") return <Text>{JSON.stringify(value.val)}</Text>;

  return <Text color="fg.error">unknown</Text>;
};

const FromItemProps = (props: { node: ZA.Nodes.Selection; from: ZA.QB.FromItem }) => {
  const { from, node } = props;

  const joined = node.props.query.from.indexOf(from) > 0;

  return (
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
  );
};

const FromItemMenu = (props: { node: ZA.Nodes.Selection; from: ZA.QB.FromItem }) => {
  return (
    <>
      <Menu.Item value="move_up">
        <TbArrowUp />
        Move up
      </Menu.Item>
      <Menu.Item value="move_down">
        <TbArrowDown />
        Move down
      </Menu.Item>
      <Menu.Item value="delete" color="fg.error" _hover={{ bg: "bg.error", color: "fg.error" }}>
        <TbTrash />
        Delete...
      </Menu.Item>
    </>
  );
};

const FromItem = (props: { node: ZA.Nodes.Selection; from: ZA.QB.FromItem }) => {
  const { from, node } = props;

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const joined = node.props.query.from.indexOf(from) > 0;

  return (
    <Popover.Root
      lazyMount
      positioning={{ placement: "right", getAnchorRect: () => buttonRef.current!.getBoundingClientRect() }}
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <Menu.Root lazyMount>
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
              <FromItemMenu {...props} />
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Body>
              <FromItemProps {...props} />
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

const ValueItemProps = (props: { value: ZA.QB.ValueItem }) => {
  const { value } = props;

  if (value.aka === "const") {
    return (
      <InputGroup
        flex="1"
        endAddon={
          <NativeSelect.Root size="xs" variant="plain" width="auto">
            <NativeSelect.Field fontSize="sm" value={value.type}>
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
              <NumberInput.Root value={String(value.val)}>
                <NumberInput.Input />
              </NumberInput.Root>
            );
          }

          return <Input placeholder="Text" value={value.val} />;
        })()}
      </InputGroup>
    );
  }

  if (value.aka === "col") {
    return (
      <Stack direction="row">
        <Input placeholder="Table" value={value.table} />
        <Input placeholder="Column" value={value.col} />
      </Stack>
    );
  }

  return <Text color="fg.error">unknown</Text>;
};

const WhereItemProps = (props: { where: ZA.QB.WhereItem }) => {
  const { where } = props;

  return (
    <Fieldset.Root size="lg">
      <Fieldset.Content>
        {(() => {
          if ("left" in where) {
            return (
              <>
                <Field.Root>
                  <ValueItemProps value={where.left} />
                </Field.Root>
                <Field.Root>
                  <SegmentGroup.Root value={where.aka} onValueChange={() => null}>
                    <SegmentGroup.Indicator bg="bg" />
                    <SegmentGroup.Items items={["<", "<=", "=", ">=", ">", "!="]} />
                  </SegmentGroup.Root>
                </Field.Root>
                <Field.Root>
                  <ValueItemProps value={where.right} />
                </Field.Root>
              </>
            );
          }

          if ("obj" in where) {
            return (
              <>
                <Field.Root>
                  <ValueItemProps value={where.obj} />
                </Field.Root>
                <Field.Root>
                  <SegmentGroup.Root value={where.aka} onValueChange={() => null}>
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

const WhereItemMenu = (props: { where: ZA.QB.WhereItem }) => {
  const { where } = props;

  return (
    <>
      {where.disabled && (
        <Menu.Item value="enable">
          <TbEye />
          Enable
        </Menu.Item>
      )}
      {!where.disabled && (
        <Menu.Item value="disable">
          <TbEyeClosed />
          Disable
        </Menu.Item>
      )}
      <Menu.Item value="delete" color="fg.error" _hover={{ bg: "bg.error", color: "fg.error" }}>
        <TbTrash />
        Delete...
      </Menu.Item>
    </>
  );
};

const WhereItem = (props: { where: ZA.QB.WhereItem }) => {
  const { where } = props;

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root
      lazyMount
      positioning={{ placement: "right", getAnchorRect: () => buttonRef.current!.getBoundingClientRect() }}
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <Menu.Root lazyMount>
        <Menu.ContextTrigger asChild>
          <Button
            ref={buttonRef}
            variant="outline"
            width="full"
            justifyContent="flex-start"
            onClick={() => setOpen(true)}
          >
            <Box flexGrow="1" opacity={where.disabled ? 0.5 : undefined}>
              {(() => {
                if ("left" in where) {
                  return (
                    <Stack direction="row">
                      <ValueItem value={where.left} />
                      <Text>{where.aka}</Text>
                      <ValueItem value={where.right} />
                    </Stack>
                  );
                }

                if ("obj" in where) {
                  return (
                    <Stack direction="row">
                      <ValueItem value={where.obj} />
                      <Text>{where.aka.toUpperCase()}</Text>
                    </Stack>
                  );
                }

                return <Text color="fg.error">unknown</Text>;
              })()}
            </Box>
            {where.disabled && (
              <Badge size="xs" textTransform="uppercase">
                <TbEyeClosed />
                Off
              </Badge>
            )}
          </Button>
        </Menu.ContextTrigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <WhereItemMenu {...props} />
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Body>
              <WhereItemProps {...props} />
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

export const WhereOrItem = (props: { root?: boolean; where: ZA.QB.WhereItem & { aka: "or" } }) => {
  const { where, root } = props;

  return (
    <Stack
      borderRadius="sm"
      borderLeftWidth={root ? undefined : "var(--chakra-spacing-4)"}
      paddingLeft={root ? undefined : "2"}
    >
      {where.cases.map((c, ci) => (
        <Fragment key={ci}>
          {ci > 0 && (
            <HStack>
              <Separator variant="dashed" flex="1" />
              <Text flexShrink="0">or</Text>
              <Separator variant="dashed" flex="1" />
            </HStack>
          )}
          <Stack>
            {c.map((w, wi) => {
              if (w.aka === "or") return <WhereOrItem key={wi} where={w} />;

              return <WhereItem key={wi} where={w} />;
            })}
          </Stack>
        </Fragment>
      ))}
    </Stack>
  );
};

export const SelectionProps = (props: { node: ZA.Nodes.Selection }) => {
  const { node } = props;
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
                <TbCodeAsterisk />
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
                      <FromItem key={i} node={node} from={f} />
                    ))}
                    <Button variant="ghost" width="full" size="xs">
                      Add table
                    </Button>
                  </Stack>
                </Field.Root>

                <Field.Root>
                  <Field.Label>Filters</Field.Label>
                  <Stack width="full">
                    <WhereOrItem root where={node.props.query.where} />
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
