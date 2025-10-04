import { NodeMeta } from "./nodeUtils";
import { metaDebugPrint } from "./debug/metaDebugPrint";
import { metaSelection } from "./selection/metaSelection";
import { metaCsvWrite } from "./csv-write/metaCsvWrite";

export const defaultNodes: NodeMeta[] = [metaDebugPrint, metaSelection, metaCsvWrite];
