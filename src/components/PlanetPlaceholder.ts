import * as THREE from 'three';
import { ProjectPlanetData } from '../data/projects';

/**
 * 占位行星组件（阶段3）
 * 用简单球体 + 光晕表示行星位置，阶段4-5 会替换为精细表面
 */
export class PlanetPlaceholder {
  public readonly group: THREE.Group;
  private readonly mesh: THREE.Mesh;
  private readonly atmosphere: THREE.Mesh;
  private readonly material: THREE.MeshStandardMaterial;
  private readonly atmosphereMaterial: THREE.ShaderMaterial;
  private readonly data: ProjectPlanetData;
  private readonly orbitRadius: number;
  private readonly orbitSpeed: number;
  private readonly orbitOffset: number;

  constructor(data: ProjectPlanetData, radius = 1.5) {
    this.data = data;
    this.group = new THREE.Group();

    // 行星主体
    const geometry = new THREE.IcosahedronGeometry(radius, 16);
    this.material = new THREE.MeshStandardMaterial({
      color: data.color,
      emissive: data.emissive,
      emissiveIntensity: 0.3,
      metalness: 0.4,
      roughness: 0.6,
    });
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.group.add(this.mesh);

    // 大气光晕（Fresnel）
    const atmGeo = new THREE.IcosahedronGeometry(radius * 1.25, 12);
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
        void main() {
          float fresnel = 1.0 - max(dot(vViewDirection, vNormal), 0.0);
          fresnel = pow(fresnel, 2.5);
          gl_FragColor = vec4(uColor, fresnel * 0.6);
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Color(data.color) },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.atmosphere = new THREE.Mesh(atmGeo, this.atmosphereMaterial);
    this.group.add(this.atmosphere);

    // 轨道参数（轻微浮动）
    this.orbitRadius = radius * 0.3;
    this.orbitSpeed = 0.3 + Math.random() * 0.3;
    this.orbitOffset = Math.random() * Math.PI * 2;
  }

  update(elapsed: number, delta: number): void {
    // 自转
    this.mesh.rotation.y += delta * 0.2;
    // 轻微浮动
    this.group.position.y += Math.sin(elapsed * this.orbitSpeed + this.orbitOffset) * 0.002;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.atmosphere.geometry.dispose();
    this.atmosphereMaterial.dispose();
  }
}
