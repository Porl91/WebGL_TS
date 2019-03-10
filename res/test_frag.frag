precision mediump float;

uniform vec3 uDiffuseLight;
uniform vec3 uLightPosition;
uniform vec3 uAmbientLight;
uniform sampler2D uSampler;

varying vec3 vVertexPosition;
varying vec2 vTextureCoord;
varying vec3 vVertexNormal;

void main() {
	vec4 tex0 = texture2D(uSampler, vTextureCoord);
	vec3 normal = normalize(vVertexNormal);
	vec3 lightDirection = normalize(uLightPosition - vVertexPosition);
	float nDotL = max(dot(lightDirection, normal), 0.0);
	vec3 diffuse = uDiffuseLight * tex0.rgb * nDotL;
	vec3 ambient = uAmbientLight * tex0.rgb;
	vec3 lightColor = vec3(diffuse + ambient);
	gl_FragColor = vec4(lightColor, tex0.a);
}