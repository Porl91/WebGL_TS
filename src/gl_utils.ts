export class GLHelpers {
	static createBuffer(gl: WebGL2RenderingContext, data: number[], type: number, getTypedData: TypeDataWrapper): WebGLBuffer {
		const buffer = gl.createBuffer();
		gl.bindBuffer(type, buffer);
		gl.bufferData(type, getTypedData(data), gl.STATIC_DRAW);
		return buffer!;
	}
}

type TypeDataWrapper = (values: number[]) => Int16Array | Uint16Array | Float32Array;

export interface WebGLBufferWithSize {
    buffer: WebGLBuffer;
    size: number;
}

export interface WebGLBufferWithData {
    buffer: WebGLBuffer;
    data: number[];
}