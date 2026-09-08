varying vec2 vUv;
varying vec3 vRayDir;

uniform mat4 uCamInvProjection;
uniform mat4 uCamInvView;

void main() {
    vUv = uv;
    vec2 ndc = uv * 2.0 - 1.0;
    
    // Unproject NDC coordinates to camera space ray vector
    vec4 target = uCamInvProjection * vec4(ndc, -1.0, 1.0);
    vec3 rayDirCamera = normalize(target.xyz / target.w);
    
    // Transform ray vector to world space
    vec3 rayDirWorld = (uCamInvView * vec4(rayDirCamera, 0.0)).xyz;
    
    vRayDir = normalize(rayDirWorld);
    gl_Position = vec4(position, 1.0);
}
