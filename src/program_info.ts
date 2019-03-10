interface StringKeyedValues<TValue> {
	[key: string]: TValue;
}

export class ProgramInfo {
	program: WebGLProgram;
	attributes: StringKeyedValues<number> = {};
	uniforms: StringKeyedValues<WebGLUniformLocation> = {};
	constructor(program: WebGLProgram) {
		this.program = program;
	}
}