import { mat4 } from "gl-matrix";
import { ProgramInfo } from "./program_info";

export interface Drawable {
    draw(programInfo: ProgramInfo, viewProjectionMatrix: mat4): void;
}