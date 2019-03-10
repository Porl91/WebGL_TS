import { ProgramInfo } from "../program_info";
import { mat4, vec3, mat3 } from "gl-matrix";
import { TextureLoader } from "../texture_loader";
import { WebGLBufferWithSize, WebGLBufferWithData, GLHelpers } from "../gl_utils";

export class Chunk {
    constructor(
        private gl: WebGLRenderingContext, 
        public positionsBuffer: WebGLBuffer, 
        public textureBuffer: WebGLBuffer, 
        public normalsBuffer: WebGLBuffer, 
        public texture: WebGLTexture, 
        public indices: WebGLBufferWithSize) { }

    draw(programInfo: ProgramInfo, viewProjectionMatrix: mat4) {
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.uniform1i(programInfo.uniforms.sampler, 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionsBuffer);
        this.gl.vertexAttribPointer(programInfo.attributes.vertexPosition, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(programInfo.attributes.vertexPosition);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureBuffer);
        this.gl.vertexAttribPointer(programInfo.attributes.textureCoord, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(programInfo.attributes.textureCoord);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalsBuffer);
        this.gl.vertexAttribPointer(programInfo.attributes.normals, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(programInfo.attributes.normals);

        const modelMatrix = mat4.create();
        var modelViewProjectionMatrix = mat4.clone(viewProjectionMatrix);
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
    static async generate(gl: WebGLRenderingContext, x: number, z: number, width: number, depth: number, xTileScale: number, yTileScale: number, zTileScale: number) {
        let positions = Chunk.getPositions(gl, x, z, width, depth, xTileScale, yTileScale, zTileScale);
        return new Chunk(
            gl, 
            positions.buffer,
            Chunk.getTextureCoords(gl, x, z, width, depth), 
            Chunk.getNormalsFromPositions(gl, positions.data),
            await TextureLoader.loadFromFile(gl, '/res/floor_new.jpg'),
            Chunk.getIndices(gl, x, z, width, depth)
        );
    }
    static getPositions(gl: WebGLRenderingContext, xOffset: number, zOffset: number, width: number, depth: number, xTileScale: number, yTileScale: number, zTileScale: number): WebGLBufferWithData {
        const maxHeight = 0.5 * yTileScale;
        let data = [];
        let getHeight = (x: number, z: number, maxHeight: number) => {
            // if ((x % (8 * xTileScale)) == 0 || (z % (8 * zTileScale)) == 0) {
            // 	return 0;
            // }
            return (((x * 850345 - z * 283424) * ((z * 234234 - x * 2934) + 16) * 87546238 / 1280) % 10000) / 10000 * maxHeight;
        };
        const xScaledOffset = xOffset * xTileScale;
        const zScaledOffset = zOffset * zTileScale;
        for (let z = 0; z < depth * zTileScale; z += zTileScale) {
            for (let x = 0; x < width * xTileScale; x += xTileScale) {
                const xMin = x + xScaledOffset + 0;
                const xMax = x + xScaledOffset + xTileScale;
                const zMin = z + zScaledOffset + 0;
                const zMax = z + zScaledOffset + zTileScale;
                data.push(
                    xMin, getHeight(xMin, zMin, maxHeight), zMin,
                    xMin, getHeight(xMin, zMax, maxHeight), zMax,
                    xMax, getHeight(xMax, zMax, maxHeight), zMax,
                    xMax, getHeight(xMax, zMin, maxHeight), zMin
                );
            }
        }
        return {
            data: data, 
            buffer: GLHelpers.createBuffer(gl, data, gl.ARRAY_BUFFER, values => new Float32Array(values))
        };
    }
    static getTextureCoords(gl: WebGLRenderingContext, xOffset: number, zOffset: number, width: number, depth: number): WebGLBuffer {
        let data = [];
        for (let z = 0; z < depth; z++) {
            for (let x = 0; x < width; x++) {
                data.push(
                    0.0, 0.0,
                    1.0, 0.0,
                    1.0, 1.0,
                    0.0, 1.0
                );
            }
        }
        return GLHelpers.createBuffer(gl, data, gl.ARRAY_BUFFER, values => new Float32Array(values));
    }
    static getNormalsFromPositions(gl: WebGLRenderingContext, positions: number[]): WebGLBuffer {
        const verticesPerQuad = 4;
        const componentsPerVertex = 3;
        let data = [];
        for (var i = 0; i < positions.length; i += (componentsPerVertex * verticesPerQuad)) {
            let x0 = positions[i + 0];
            let y0 = positions[i + 1];
            let z0 = positions[i + 2];
            
            let x1 = positions[i + 3];
            let y1 = positions[i + 4];
            let z1 = positions[i + 5];

            let x2 = positions[i + 6];
            let y2 = positions[i + 7];
            let z2 = positions[i + 8];
            
            let v0 = vec3.fromValues(x0, y0, z0);
            let v1 = vec3.fromValues(x1, y1, z1);
            let v2 = vec3.fromValues(x2, y2, z2);

            let edge0 = vec3.create();
            let edge1 = vec3.create();
            vec3.subtract(edge0, v1, v0);
            vec3.subtract(edge1, v2, v0);

            let normal = vec3.create();
            vec3.cross(normal, edge0, edge1);

            data.push(
                normal[0], normal[1], normal[2], 
                normal[0], normal[1], normal[2], 
                normal[0], normal[1], normal[2],
                normal[0], normal[1], normal[2]
            );
        }
        return GLHelpers.createBuffer(gl, data, gl.ARRAY_BUFFER, values => new Float32Array(values));
    }
    static getIndices(gl: WebGLRenderingContext, xOffset: number, zOffset: number, width: number, depth: number): WebGLBufferWithSize {
        let data = [];
        for (let i = 0; i < width * depth; i++) {
            const offset = (i * 4);
            data.push(
                0 + offset, 1 + offset, 2 + offset, 
                0 + offset, 2 + offset, 3 + offset
            );
        }
        return {
            buffer: GLHelpers.createBuffer(gl, data, gl.ELEMENT_ARRAY_BUFFER, values => new Int16Array(values)), 
            size: data.length
        };
    }
}