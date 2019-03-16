export class TextureLoader {
	static async loadVideo(filename: string, mute: boolean = false): Promise<HTMLVideoElement> {
		return new Promise<HTMLVideoElement>((resolve, reject) => {
			const video = document.createElement('video');
			video.autoplay = true;
			video.muted = mute;
			video.loop = true;
	
			var loaded = false;
			video.src = filename;
			video.play();

			var resolveIfRequired = () => {
				var wasAlreadyLoaded = loaded;
				loaded = true;
				if (!wasAlreadyLoaded) {
					resolve(video);
					return;
				}
			};

			video.addEventListener('playing', () => resolveIfRequired(), true);
			video.addEventListener('timeupdate', () => resolveIfRequired(), true);
		});
	}

	static async loadFromVideoFile(gl: WebGLRenderingContext, filename: string) {
		return this.loadFromVideo(gl, 
			await this.loadVideo(filename)
		);
	}

	static loadFromVideo(gl: WebGLRenderingContext, video: HTMLVideoElement): Promise<WebGLTexture> {
		return new Promise<WebGLTexture>((resolve, reject) => {
			const texture = this.loadFromTexImageSource(gl, video);
			if (texture == null) {
				reject('Failed to load texture');
				return;
			}
			resolve(texture);
		});
	}

	static loadFromTexImageSource(gl: WebGLRenderingContext, source: TexImageSource): WebGLTexture {
		const texture = gl.createTexture()!;
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 
		if ((source.width != 0) && (source.height != 0) // Video elements don't use width / height. Disable mipmapping for videos.
			&& TextureLoader.isPowerOf2(source.width) 
			&& TextureLoader.isPowerOf2(source.height)) {
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}
		return texture;
	}

	static async loadFromImageFile(gl: WebGLRenderingContext, filename: string): Promise<WebGLTexture> {
		return new Promise((resolve, reject) => {
			const image = new Image();
			image.onload = () => {
				const texture = this.loadFromTexImageSource(gl, image);
				if (texture == null) {
					reject('Failed to load texture');
					return;
				}
				resolve(texture);
			};
			image.src = filename;
		});
	}

	private static isPowerOf2(value: number) {
		return (value & (value - 1)) == 0;
	}
}