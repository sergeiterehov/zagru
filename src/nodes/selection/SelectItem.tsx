import { ZA } from "@/za";
import { Badge, Button, HStack, Menu, Popover, Portal } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { TbEyeClosed, TbFreezeColumn } from "react-icons/tb";
import { SelectItemMenu } from "./SelectItemMenu";
import { SelectItemProps } from "./SelectItemProps";

export const SelectItem = (props: { selector: ZA.QB.SelectItem }) => {
  const { selector } = props;

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
          throw new Error("Not implemented");
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
            <TbFreezeColumn />
            <HStack flexGrow="1" opacity={selector.disabled ? 0.5 : undefined}>
              {`${selector.table}.${selector.col}`}
            </HStack>
            {selector.disabled && (
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
              <SelectItemMenu {...props} />
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Body>
              <SelectItemProps {...props} />
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};
