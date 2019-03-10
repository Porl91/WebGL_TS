export class TextureLoader {
	static async loadFromFile(gl: WebGLRenderingContext, filename: string): Promise<WebGLTexture> {
		return new Promise((resolve, reject) => {
			const texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, texture);

			const image = new Image();
			image.onload = () => {
				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

				if (TextureLoader.isPowerOf2(image.width) && TextureLoader.isPowerOf2(image.height)) {
					gl.generateMipmap(gl.TEXTURE_2D);
				} else {
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				}
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