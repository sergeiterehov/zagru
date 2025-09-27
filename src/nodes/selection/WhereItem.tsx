import { ZA } from "@/za";
import { Popover, Menu, Button, Box, Stack, Badge, Portal, HStack, Separator, Text } from "@chakra-ui/react";
import { produce } from "immer";
import { useRef, useState, Fragment } from "react";
import { TbEyeClosed } from "react-icons/tb";
import { ValueItem } from "./ValueItem";
import { WhereItemMenuAction, WhereItemMenu } from "./WhereItemMenu";
import { WhereItemProps } from "./WhereItemProps";

export const WhereItem = (props: {
  where: ZA.QB.WhereItem;
  onChange(update: ZA.QB.WhereItem): void;
  onDelete(): void;
}) => {
  const { where, onChange, onDelete } = props;

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root
      lazyMount
      positioning={{ placement: "right", getAnchorRect: () => buttonRef.current!.getBoundingClientRect() }}
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <Menu.Root
        lazyMount
        onSelect={(e) => {
          const action = e.value as WhereItemMenuAction;

          switch (action) {
            default: {
              throw new Error("Not implemented");
            }
            case WhereItemMenuAction.Enable:
            case WhereItemMenuAction.Disable: {
              const next = produce(where, (prev) => {
                prev.disabled = !prev.disabled;
              });

              onChange(next);
              break;
            }
            case WhereItemMenuAction.Delete: {
              onDelete();
              break;
            }
          }
        }}
      >
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

export const WhereOrItem = (props: {
  root?: boolean;
  where: ZA.QB.WhereItem & { aka: "or" };
  onChange(update: ZA.QB.WhereItem & { aka: "or" }): void;
}) => {
  const { where, root, onChange } = props;

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
              const handleChange = (update: ZA.QB.WhereItem) => {
                const next = produce(where, (prev) => {
                  prev.cases[ci][wi] = update;
                });

                onChange(next);
              };
              const handleDelete = () => {
                const next = produce(where, (prev) => {
                  prev.cases[ci].splice(wi, 1);

                  if (!prev.cases[ci].length) {
                    prev.cases.splice(ci, 1);
                  }
                });

                onChange(next);
              };

              if (w.aka === "or") return <WhereOrItem key={wi} where={w} onChange={handleChange} />;

              return <WhereItem key={wi} where={w} onChange={handleChange} onDelete={handleDelete} />;
            })}
          </Stack>
        </Fragment>
      ))}
    </Stack>
  );
};
