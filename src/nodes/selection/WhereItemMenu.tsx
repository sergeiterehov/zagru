import { ZA } from "@/za";
import { Menu } from "@chakra-ui/react";
import { TbEye, TbEyeClosed, TbTrash } from "react-icons/tb";

export enum WhereItemMenuAction {
  Delete = "delete",
  Enable = "enable",
  Disable = "disable",
  SplitOr = "split_or",
  Group = "group",
}

export const WhereItemMenu = (props: { where: ZA.QB.WhereItem }) => {
  const { where } = props;

  return (
    <>
      {where.disabled && (
        <Menu.Item value={WhereItemMenuAction.Enable}>
          <TbEye />
          Enable
        </Menu.Item>
      )}
      {!where.disabled && (
        <Menu.Item value={WhereItemMenuAction.Disable}>
          <TbEyeClosed />
          Disable
        </Menu.Item>
      )}
      <Menu.Item value={WhereItemMenuAction.SplitOr}>Split OR</Menu.Item>
      <Menu.Item value={WhereItemMenuAction.Group}>Group</Menu.Item>
      <Menu.Item value={WhereItemMenuAction.Delete} color="fg.error" _hover={{ bg: "bg.error", color: "fg.error" }}>
        <TbTrash />
        Delete...
      </Menu.Item>
    </>
  );
};
