import { NodeMeta } from "./nodeUtils";
import { metaDebugPrint } from "./debug/metaDebugPrint";
import { metaSelection } from "./selection/metaSelection";

export const defaultNodes: NodeMeta[] = [metaDebugPrint, metaSelection];
