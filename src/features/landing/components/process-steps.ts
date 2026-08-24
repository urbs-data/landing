import {
  ClipboardList,
  Gauge,
  type LucideIcon,
  UsersRound,
  Workflow,
} from "lucide-react";
import { m } from "@/paraglide/messages";

export type ProcessStep = {
  icon: LucideIcon;
  tag: string;
  title: string;
  description: string;
};

export function getProcessSteps(): ProcessStep[] {
  return [
    {
      icon: ClipboardList,
      tag: "01",
      title: m.process_step_mapping_title(),
      description: m.process_step_mapping_description(),
    },
    {
      icon: Workflow,
      tag: "02",
      title: m.process_step_standardize_title(),
      description: m.process_step_standardize_description(),
    },
    {
      icon: UsersRound,
      tag: "03",
      title: m.process_step_roles_title(),
      description: m.process_step_roles_description(),
    },
    {
      icon: Gauge,
      tag: "04",
      title: m.process_step_improvement_title(),
      description: m.process_step_improvement_description(),
    },
  ];
}
