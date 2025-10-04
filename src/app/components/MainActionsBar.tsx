import { Tooltip } from "@/components/ui/tooltip";
import { ActionBar, Button, IconButton, Portal } from "@chakra-ui/react";
import { TbCsv, TbLicense, TbPlayerPlay, TbTableSpark } from "react-icons/tb";

export const MainActionsBar = () => {
  return (
    <ActionBar.Root open>
      <Portal>
        <ActionBar.Positioner>
          <ActionBar.Content>
            <Tooltip content="Select">
              <IconButton variant="ghost">
                <TbTableSpark />
              </IconButton>
            </Tooltip>
            <Tooltip content="Read/write CSV">
              <IconButton variant="ghost">
                <TbCsv />
              </IconButton>
            </Tooltip>
            <Tooltip content="Debugging print">
              <IconButton variant="ghost">
                <TbLicense />
              </IconButton>
            </Tooltip>
            <ActionBar.Separator />
            <Tooltip content="Execute space">
              <IconButton variant="ghost">
                <TbPlayerPlay />
              </IconButton>
            </Tooltip>
          </ActionBar.Content>
        </ActionBar.Positioner>
      </Portal>
    </ActionBar.Root>
  );
};
