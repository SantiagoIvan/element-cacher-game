import { CIRCLE_COLORS } from "@/lib";

export type CircleColor = (typeof CIRCLE_COLORS)[number];

export type Circle = {
    id: number;
    color: CircleColor;
    radius: number;
    x: number;
    y: number;
    speed: number;
};