import { ProgramInfo } from "../program_info";
import { mat4, mat3, vec3 } from "gl-matrix";
import { GLHelpers, WebGLBufferWithSize } from "../gl_utils";

export class Cube {
	positions: WebGLBuffer;
	textureCoords: WebGLBuffer;
	normals: WebGLBuffer;
	indices: WebGLBufferWithSize;
	constructor(private gl: WebGL2RenderingContext, private texture: WebGLTexture, public position: vec3) {
		this.positions = GLHelpers.createBuffer(gl, 
			[
				// Front face
				-1.0, -1.0,  1.0,
				1.0, -1.0,  1.0,
				1.0,  1.0,  1.0,
				-1.0,  1.0,  1.0,

				// Back face
				-1.0, -1.0, -1.0,
				-1.0,  1.0, -1.0,
				1.0,  1.0, -1.0,
				1.0, -1.0, -1.0,

				// Top face
				-1.0,  1.0, -1.0,
				-1.0,  1.0,  1.0,
				1.0,  1.0,  1.0,
				1.0,  1.0, -1.0,

				// Bottom face
				-1.0, -1.0, -1.0,
				1.0, -1.0, -1.0,
				1.0, -1.0,  1.0,
				-1.0, -1.0,  1.0,

				// Right face
				1.0, -1.0, -1.0,
				1.0,  1.0, -1.0,
				1.0,  1.0,  1.0,
				1.0, -1.0,  1.0,

				// Left face
				-1.0, -1.0, -1.0,
				-1.0, -1.0,  1.0,
				-1.0,  1.0,  1.0,
				-1.0,  1.0, -1.0
			],
			gl.ARRAY_BUFFER, 
			values => new Float32Array(values)
		);
		this.textureCoords = GLHelpers.createBuffer(gl, 
			[
				// Front
				0.0,  0.0,
				1.0,  0.0,
				1.0,  1.0,
				0.0,  1.0,
				// Back
				0.0,  0.0,
				1.0,  0.0,
				1.0,  1.0,
				0.0,  1.0,
				// Top
				0.0,  0.0,
				1.0,  0.0,
				1.0,  1.0,
				0.0,  1.0,
				// Bottom
				0.0,  0.0,
				1.0,  0.0,
				1.0,  1.0,
				0.0,  1.0,
				// Right
				0.0,  0.0,
				1.0,  0.0,
				1.0,  1.0,
				0.0,  1.0,
				// Left
				0.0,  0.0,
				1.0,  0.0,
				1.0,  1.0,
				0.0,  1.0
			],
			gl.ARRAY_BUFFER, 
			values => new Float32Array(values)
		);
		this.normals = GLHelpers.createBuffer(gl, 
			[
				// Front
				0.0,  0.0,  1.0,
				0.0,  0.0,  1.0,
				0.0,  0.0,  1.0,
				0.0,  0.0,  1.0,

				// Back
				0.0,  0.0, -1.0,
				0.0,  0.0, -1.0,
				0.0,  0.0, -1.0,
				0.0,  0.0, -1.0,

				// Top
				0.0,  1.0,  0.0,
				0.0,  1.0,  0.0,
				0.0,  1.0,  0.0,
				0.0,  1.0,  0.0,

				// Bottom
				0.0, -1.0,  0.0,
				0.0, -1.0,  0.0,
				0.0, -1.0,  0.0,
				0.0, -1.0,  0.0,

				// Right
				1.0,  0.0,  0.0,
				1.0,  0.0,  0.0,
				1.0,  0.0,  0.0,
				1.0,  0.0,  0.0,

				// Left
				-1.0,  0.0,  0.0,
				-1.0,  0.0,  0.0,
				-1.0,  0.0,  0.0,
				-1.0,  0.0,  0.0
			],
			gl.ARRAY_BUFFER, 
			values => new Float32Array(values)
		);
		this.indices = {
			buffer: GLHelpers.createBuffer(gl, 
				[
					0,  1,  2,      0,  2,  3,    // front
					4,  5,  6,      4,  6,  7,    // back
					8,  9,  10,     8,  10, 11,   // top
					12, 13, 14,     12, 14, 15,   // bottom
					16, 17, 18,     16, 18, 19,   // right
					20, 21, 22,     20, 22, 23   // left
				],
				gl.ELEMENT_ARRAY_BUFFER, 
				values => new Uint16Array(values)
			),
			size: 36
		};
	}
    draw(programInfo: ProgramInfo, viewProjectionMatrix: mat4) {
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.uniform1i(programInfo.uniforms.sampler, 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positions);
        this.gl.vertexAttribPointer(programInfo.attributes.vertexPosition, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(programInfo.attributes.vertexPosition);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoords);
        this.gl.vertexAttribPointer(programInfo.attributes.textureCoord, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(programInfo.attributes.textureCoord);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normals);
        this.gl.vertexAttribPointer(programInfo.attributes.normals, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(programInfo.attributes.normals);

        const step = new Date().getTime() % 5000 / 5000 * Math.PI * 2;
        const modelMatrix = mat4.create();
		mat4.rotate(modelMatrix, modelMatrix, step, [ 1, 1, 0 ]);
        var modelViewProjectionMatrix = mat4.clone(viewProjectionMatrix);
		mat4.translate(modelViewProjectionMatrix, modelViewProjectionMatrix, [ this.position[0], this.position[1], this.position[2] ]);
        mat4.multiply(modelViewProjectionMatrix, modelViewProjectionMatrix, modelMatrix);

        var normalMatrix = mat3.create();
        normalMatrix = mat3.fromMat4(normalMatrix, modelMatrix);
        mat3.invert(normalMatrix, normalMatrix);
        mat3.transpose(normalMatrix, normalMatrix);

        // Mat4
        this.gl.uniformMatrix4fv(programInfo.uniforms.mVPMatrix, false, modelViewProjectionMatrix);
        this.gl.uniformMatrix4fv(programInfo.uniforms.modelMatrix, false, modelMatrix);
        // Mat3
        this.gl.uniformMatrix3fv(programInfo.uniforms.normalMatrix, false, normalMatrix);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer);
        this.gl.drawElements(this.gl.TRIANGLES, this.indices.size, this.gl.UNSIGNED_SHORT, 0);
    }
}