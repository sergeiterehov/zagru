import { ZA } from "@/za";
import { Popover, Menu, Button, Badge, Portal, Text } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { TbTableShortcut, TbTable, TbArrowUp, TbArrowsCross } from "react-icons/tb";
import { FromItemMenuAction, FromItemMenu } from "./FromItemMenu";
import { FromItemProps } from "./FromItemProps";

export const FromItem = (props: {
  node: ZA.Nodes.Selection;
  from: ZA.QB.FromItem;
  onChange(update: ZA.QB.FromItem): void;
  onDelete(): void;
  onMove(dir: -1 | 1): void;
}) => {
  const { from, node, onChange, onDelete, onMove } = props;

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
      <Menu.Root
        lazyMount
        onSelect={(e) => {
          const action = e.value as FromItemMenuAction;

          switch (action) {
            default: {
              throw new Error("Not implemented");
            }
            case FromItemMenuAction.Delete: {
              onDelete();
              break;
            }
            case FromItemMenuAction.MoveUp: {
              onMove(-1);
              break;
            }
            case FromItemMenuAction.MoveDown: {
              onMove(1);
              break;
            }
          }
        }}
      >
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
