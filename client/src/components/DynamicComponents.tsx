import dynamic from "next/dynamic";

export const Dropout = dynamic(() => import("./dashboard/Dropout"));
export const Employed = dynamic(() => import("./dashboard/Employed"));
export const ForeplanModeSwitch = dynamic(
  () => import("./foreplan/ModeSwitch")
);
export const ForeplanSummary = dynamic(
  () => import("./foreplan/foreplanSummary/MainBox")
);
