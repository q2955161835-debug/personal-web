import * as THREE from 'three';
import { ProjectPlanetData } from '../data/projects';
import { getPlanetShader } from '../shaders/planet-surfaces';

/**
 * 项目行星组件
 * - 自定义 ShaderMaterial 表面（8 种独特视觉）
 * - Fresnel 大气光晕
 * - 自转 + 浮动
 */
export class PlanetPlaceholder {
  public readonly group: THREE.Group;
  private readonly mesh: THREE.Mesh;
  private readonly atmosphere: THREE.Mesh;
  private readonly material: THREE.ShaderMaterial;
  private readonly atmosphereMaterial: THREE.ShaderMaterial;
  private readonly data: ProjectPlanetData;
  private readonly orbitSpeed: number;
  private readonly orbitOffset: number;
  private readonly rotationSpeed: number;

  constructor(data: ProjectPlanetData, radius = 1.8) {
    this.data = data;
    this.group = new THREE.Group();

    // 行星主体（高多面体 + 自定义表面 shader）
    const geometry = new THREE.IcosahedronGeometry(radius, 32);
    const shaderSet = getPlanetShader(data.surfaceType);
    this.material = new THREE.ShaderMaterial({
      vertexShader: shaderSet.vertexShader,
      fragmentShader: shaderSet.fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(data.color) },
        uColorEmissive: { value: new THREE.Color(data.emissive) },
      },
    });
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.group.add(this.mesh);

    // 大气光晕（Fresnel）
    const atmGeo = new THREE.IcosahedronGeometry(radius * 1.25, 16);
    this.atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDirection;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          vViewDirection = normalize(cameraPosition - worldPos);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewDirection;
        uniform vec3 uColor;
        uniform float uTime;
        void main() {
          float fresnel = 1.0 - max(dot(vViewDirection, vNormal), 0.0);
          fresnel = pow(fresnel, 2.5);
          // 轻微脉动
          float pulse = 0.85 + 0.15 * sin(uTime * 1.2);
          gl_FragColor = vec4(uColor, fresnel * 0.5 * pulse);
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Color(data.color) },
        uTime: { value: 0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.atmosphere = new THREE.Mesh(atmGeo, this.atmosphereMaterial);
    this.group.add(this.atmosphere);

    // 运动参数
    this.orbitSpeed = 0.3 + Math.random() * 0.3;
    this.orbitOffset = Math.random() * Math.PI * 2;
    this.rotationSpeed = 0.15 + Math.random() * 0.2;
  }

  update(elapsed: number, delta: number): void {
    // 更新 shader 时间
    this.material.uniforms.uTime.value = elapsed;
    this.atmosphereMaterial.uniforms.uTime.value = elapsed;

    // 自转
    this.mesh.rotation.y += delta * this.rotationSpeed;
    this.mesh.rotation.x += delta * this.rotationSpeed * 0.3;

    // 轻微浮动
    this.group.position.y += Math.sin(elapsed * this.orbitSpeed + this.orbitOffset) * 0.003;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.atmosphere.geometry.dispose();
    this.atmosphereMaterial.dispose();
  }
}
