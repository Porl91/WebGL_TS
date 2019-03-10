attribute vec4 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aVertexNormal;

uniform mat4 uMVPMatrix;
uniform mat4 uModelMatrix;
uniform mat3 uNormalMatrix;

varying vec3 vVertexPosition;
varying vec2 vTextureCoord;
varying vec3 vVertexNormal;

void main() {
	gl_Position = uMVPMatrix * aVertexPosition;

	vTextureCoord = aTextureCoord;
	vVertexNormal = normalize(uNormalMatrix * vec3(aVertexNormal));
	vVertexPosition = vec3(uModelMatrix * aVertexPosition);
}