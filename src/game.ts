import { mat4 } from 'gl-matrix';
import { Chunk } from './drawables/chunk';
import { ProgramBuilder } from './program_builder';
import { ProgramInfo } from './program_info';
import { FileLoader } from './file_loader';
import { Drawable } from './drawable';
import { Cube } from './drawables/cube';
import { TextureLoader } from './texture_loader';
import { Sphere } from './drawables/sphere';

export class Game {
	private gl: WebGLRenderingContext;
	private programInfo: ProgramInfo;
	private chunks: Chunk[] = [];
	private gameObjects: Drawable[] = [];
	private cameraPosition: number[] = [ -10, 0, -20 ];
	private lightPosition: number[] = [ 0, 3, 0 ];
	private diffuseColour: number[] = [ 1.0, 1.0, 0.0 ];
	private ambientColour: number[] = [ 1.0, 0.0, 1.0 ];
	
	constructor(canvas: HTMLCanvasElement) { 
		this.gl = canvas.getContext('webgl')!;
	}
	private async buildProgram() {
		const vertShaderSource = await FileLoader.loadAsText('/res/test_vert.vert');
		const fragShaderSource = await FileLoader.loadAsText('/res/test_frag.frag');
		const program = new ProgramBuilder(this.gl, vertShaderSource, fragShaderSource).build();

		this.programInfo = new ProgramInfo(program);
		this.programInfo.attributes['vertexPosition'] = this.gl.getAttribLocation(program, 'aVertexPosition'); 
		this.programInfo.attributes['textureCoord'] = this.gl.getAttribLocation(program, 'aTextureCoord');
		this.programInfo.attributes['normals'] = this.gl.getAttribLocation(program, 'aVertexNormal');

		this.programInfo.uniforms['mVPMatrix'] = this.gl.getUniformLocation(program, 'uMVPMatrix')!;
		this.programInfo.uniforms['modelMatrix'] = this.gl.getUniformLocation(program, 'uModelMatrix')!;
		this.programInfo.uniforms['normalMatrix'] = this.gl.getUniformLocation(program, 'uNormalMatrix')!;
		// Lighting variables
		this.programInfo.uniforms['diffuseLight'] = this.gl.getUniformLocation(program, 'uDiffuseLight')!;
		this.programInfo.uniforms['lightPosition'] = this.gl.getUniformLocation(program, 'uLightPosition')!;
		this.programInfo.uniforms['ambientLight'] = this.gl.getUniformLocation(program, 'uAmbientLight')!;
		// Textures
		this.programInfo.uniforms['sampler'] = this.gl.getUniformLocation(program, 'uSampler')!;
	}
	private async addChunks() {
		const horizontalChunkCount = 2;
		const verticalChunkCount = 2;
		const chunkWidth = 16;
		const chunkDepth = 16;
		const xTileScale = 0.5;
		const yTileScale = 0.5;
		const zTileScale = 0.5;

		var unprocessedChunks: Promise<Chunk>[] = [];
		for (let z = 0; z < verticalChunkCount; z++) {
			for (let x = 0; x < horizontalChunkCount; x++) {
				unprocessedChunks.push(
					Chunk.generate(this.gl, 
						x * chunkWidth, z * chunkDepth, 
						chunkWidth, chunkDepth, 
						xTileScale, yTileScale, zTileScale
					)
				);
			}
		}
		this.chunks = await Promise.all(unprocessedChunks);
	}
	private async addObjects() {
		this.gameObjects.push(new Cube(this.gl, await TextureLoader.loadFromFile(this.gl, '/res/floor_new.jpg')));
		this.gameObjects.push(new Sphere(this.gl, await TextureLoader.loadFromFile(this.gl, '/res/WelcomeToEarf.jpg'), 1, 50, 50));
	}
	async start() {
		await this.buildProgram();
		await this.addChunks();
		await this.addObjects();
		window.requestAnimationFrame(delta => this.draw(delta));
	}
	draw(delta: number) {
		this.gl.enable(this.gl.CULL_FACE);
		this.gl.cullFace(this.gl.BACK);
		this.gl.clearColor(0, 0, 0, 1);
		this.gl.clearDepth(1.0);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.depthFunc(this.gl.LEQUAL);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

		// Projection matrix
		const projectionMatrix = mat4.create();
		const fov = 30 * Math.PI / 180;
		const aspect = this.gl.drawingBufferWidth / this.gl.drawingBufferHeight;
		mat4.perspective(projectionMatrix, fov, aspect, 0.1, 100);

		const viewMatrix = mat4.create();
		mat4.translate(viewMatrix, viewMatrix, this.cameraPosition);
		mat4.rotate(viewMatrix, viewMatrix, 35.264 * Math.PI / 180, [ 1, 0, 0 ]);
		mat4.rotate(viewMatrix, viewMatrix, Math.PI / 4, [ 0, 1, 0 ]);
		
		const viewProjectionMatrix = mat4.create();
		mat4.copy(viewProjectionMatrix, projectionMatrix);
		mat4.multiply(viewProjectionMatrix, viewProjectionMatrix, viewMatrix);

		this.gl.useProgram(this.programInfo.program);

		// lightPosition[1] = Math.cos(new Date().getTime() % 5000 / 5000 * Math.PI * 2) * 5;

		this.gl.uniform3fv(this.programInfo.uniforms['diffuseLight'], this.diffuseColour);
		this.gl.uniform3fv(this.programInfo.uniforms['lightPosition'], this.lightPosition);
		this.gl.uniform3fv(this.programInfo.uniforms['ambientLight'], this.ambientColour);

		// const a = (new Date().getTime() / 5000 % 5000) * Math.PI * 2;

		for (let chunk of this.chunks) {
			chunk.draw(this.programInfo, viewProjectionMatrix);
		}

		for (let gameObject of this.gameObjects) {
		    gameObject.draw(this.programInfo, viewProjectionMatrix);
		}

		window.requestAnimationFrame(delta => this.draw(delta));
	}
	moveCameraPosition(xDelta: number, zDelta: number) {
		this.cameraPosition[0] += xDelta;
		this.cameraPosition[2] += zDelta;
	}
	moveLightPosition(xDelta: number, zDelta: number) {
		this.lightPosition[0] += xDelta;
		this.lightPosition[2] += zDelta;
	}
}