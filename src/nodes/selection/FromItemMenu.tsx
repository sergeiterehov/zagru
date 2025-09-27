import { ZA } from "@/za";
import { Menu } from "@chakra-ui/react";
import { TbArrowUp, TbArrowDown, TbTrash } from "react-icons/tb";

export const enum FromItemMenuAction {
  MoveUp = "move_up",
  MoveDown = "move_down",
  Delete = "delete",
}

export const FromItemMenu = (props: { node: ZA.Nodes.Selection; from: ZA.QB.FromItem }) => {
  return (
    <>
      <Menu.Item value={FromItemMenuAction.MoveUp}>
        <TbArrowUp />
        Move up
      </Menu.Item>
      <Menu.Item value={FromItemMenuAction.MoveDown}>
        <TbArrowDown />
        Move down
      </Menu.Item>
      <Menu.Item value={FromItemMenuAction.Delete} color="fg.error" _hover={{ bg: "bg.error", color: "fg.error" }}>
        <TbTrash />
        Delete...
      </Menu.Item>
    </>
  );
};
