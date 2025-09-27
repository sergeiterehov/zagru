import { ZA } from "@/za";
import { Menu } from "@chakra-ui/react";
import { TbEye, TbEyeClosed, TbTrash } from "react-icons/tb";

export const enum SelectItemMenuAction {
  Delete = "delete",
  Enable = "enable",
  Disable = "disable",
}

export const SelectItemMenu = (props: { selector: ZA.QB.SelectItem }) => {
  const { selector } = props;

  return (
    <>
      {selector.disabled && (
        <Menu.Item value={SelectItemMenuAction.Enable}>
          <TbEye />
          Enable
        </Menu.Item>
      )}
      {!selector.disabled && (
        <Menu.Item value={SelectItemMenuAction.Disable}>
          <TbEyeClosed />
          Disable
        </Menu.Item>
      )}
      <Menu.Item value={SelectItemMenuAction.Delete} color="fg.error" _hover={{ bg: "bg.error", color: "fg.error" }}>
        <TbTrash />
        Delete...
      </Menu.Item>
    </>
  );
};
