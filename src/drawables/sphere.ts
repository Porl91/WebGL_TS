import { GLHelpers, WebGLBufferWithSize } from "../gl_utils";
import { ProgramInfo } from "../program_info";
import { mat4, mat3 } from "gl-matrix";

export class Sphere {
    private positions: WebGLBuffer;
    private textureCoords: WebGLBuffer;
    private normals: WebGLBuffer;
    private indices: WebGLBufferWithSize;

    constructor(private gl: WebGLRenderingContext, private texture: WebGLTexture, radius: number, rings: number, sectors: number) {
        const positions = [];
        const textureCoords = [];
        const normals = [];
        const indices = [];

        var lengthInv = 1.0 / radius;				
        var sectorStep = 2 * Math.PI / sectors;
        var stackStep = Math.PI / rings;

        for (var i = 0; i <= rings; ++i) {
            const stackAngle = Math.PI / 2 - i * stackStep;
            const xy = radius * Math.cos(stackAngle);
            const z = radius * Math.sin(stackAngle);

            for (var j = 0; j <= sectors; ++j) {
                const sectorAngle = j * sectorStep;

                const x = xy * Math.cos(sectorAngle);             
                const y = xy * Math.sin(sectorAngle);             
                positions.push(x, y, z);

                const nx = x * lengthInv;
                const ny = y * lengthInv;
                const nz = z * lengthInv;
                normals.push(nx, ny, nz); 

                const s = j / sectors;
                const t = i / rings;
                textureCoords.push(s, t);
            }
        }

        for(var r = 0; r < rings; r++) {
            for(var s = 0; s < sectors; s++) {
                const p1 = r * (sectors + 1) + s;
                const p2 = p1 + (sectors + 1);
                indices.push(
                    p1, 
                    p2, 
                    p1 + 1,
                    p1 + 1, 
                    p2, 
                    p2 + 1
                );
            }
        }
        this.positions = GLHelpers.createBuffer(gl, 
            positions,
            gl.ARRAY_BUFFER, 
            values => new Float32Array(values)
        );
        this.textureCoords = GLHelpers.createBuffer(gl, 
            textureCoords,
            gl.ARRAY_BUFFER, 
            values => new Float32Array(values)
        );
        this.normals = GLHelpers.createBuffer(gl, 
            normals,
            gl.ARRAY_BUFFER, 
            values => new Float32Array(values)
        );
        this.indices = {
            buffer: GLHelpers.createBuffer(gl, 
                indices,
                gl.ELEMENT_ARRAY_BUFFER, 
                values => new Uint16Array(values)
            ),
            size: indices.length
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

        const step = (5000 - new Date().getTime() % 5000) / 5000 * Math.PI * 2;
        const modelMatrix = mat4.create();
        mat4.rotate(modelMatrix, modelMatrix, step, [ 1, 1, 0 ]);
        var modelViewProjectionMatrix = mat4.clone(viewProjectionMatrix);
        mat4.translate(modelViewProjectionMatrix, modelViewProjectionMatrix, [ 3, 3, 0 ]);
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