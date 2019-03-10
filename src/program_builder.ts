export class ProgramBuilder {
	constructor(private gl: WebGLRenderingContext, private vertShaderSource: string, private fragShaderSource: string) { }

	build(): WebGLProgram {
		const vertShader = this.loadShader(this.gl, this.gl.VERTEX_SHADER, this.vertShaderSource);
		const fragShader = this.loadShader(this.gl, this.gl.FRAGMENT_SHADER, this.fragShaderSource);

		const program = this.gl.createProgram();
		if (program == null) {
			throw 'Failed to create program';
		}
		this.gl.attachShader(program, vertShader);
		this.gl.attachShader(program, fragShader);
		this.gl.linkProgram(program);

		if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
			const error = this.gl.getProgramInfoLog(program);
			throw 'Unable to initialise shader program: ' + error;
		}

		return program;
	}

	private loadShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
		const shader = gl.createShader(type);
		if (shader == null) {
			throw 'Failed to create shader';
		}

		gl.shaderSource(shader, source);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			const error = gl.getShaderInfoLog(shader);
			gl.deleteShader(shader);
			throw 'An error occurred while compiling shader: ' + error;
		}

		return shader;
	}
}