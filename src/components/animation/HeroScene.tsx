"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "@/lib/animation/gsap";

function createGlowSprite(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.08, "rgba(255,255,255,1)");
  gradient.addColorStop(0.18, "rgba(220,242,255,0.95)");
  gradient.addColorStop(0.4, "rgba(150,210,255,0.45)");
  gradient.addColorStop(0.75, "rgba(120,190,255,0.08)");
  gradient.addColorStop(1, "rgba(120,190,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

interface Orbit {
  group: THREE.Group;
  semiMajor: number;
  semiMinor: number;
  electronAngles: number[];
  electronSpeed: number;
  electrons: THREE.Points;
}

function buildOrbitPath(semiMajor: number, semiMinor: number, color: number): THREE.Line {
  const points: THREE.Vector3[] = [];
  const segments = 128;
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(t) * semiMajor, 0, Math.sin(t) * semiMinor));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.22,
  });
  return new THREE.Line(geometry, material);
}

export function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion()) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 1.5, 11);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const glowTexture = createGlowSprite();

    // Nucleus: bright sage-cream glow sprite at the origin.
    const nucleusMaterial = new THREE.PointsMaterial({
      size: 2.4,
      map: glowTexture,
      transparent: true,
      opacity: 1,
      color: 0xe6ebe2,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const nucleusGeometry = new THREE.BufferGeometry();
    nucleusGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
    const nucleus = new THREE.Points(nucleusGeometry, nucleusMaterial);
    scene.add(nucleus);

    const orbitColors = [0xaebf9f, 0x8fa67c, 0xd4c1a0];
    const orbitTilts = [
      { x: 0.25, z: 0.1 },
      { x: -0.35, z: 0.9 },
      { x: 0.6, z: -0.6 },
    ];

    function makeOrbit(
      semiMajor: number,
      semiMinor: number,
      tilt: { x: number; z: number },
      color: number,
      electronCount: number,
      speed: number
    ): Orbit {
      const group = new THREE.Group();
      group.rotation.x = tilt.x;
      group.rotation.z = tilt.z;

      const path = buildOrbitPath(semiMajor, semiMinor, color);
      group.add(path);

      const electronAngles = Array.from({ length: electronCount }, (_, i) => (i / electronCount) * Math.PI * 2);

      const positions = new Float32Array(electronCount * 3);
      const colors = new Float32Array(electronCount * 3);
      const c = new THREE.Color(color);
      for (let i = 0; i < electronCount; i++) {
        positions[i * 3] = Math.cos(electronAngles[i]) * semiMajor;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = Math.sin(electronAngles[i]) * semiMinor;
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.45,
        map: glowTexture,
        transparent: true,
        opacity: 1,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
        alphaTest: 0.001,
      });
      const electrons = new THREE.Points(geometry, material);
      group.add(electrons);

      scene.add(group);

      return { group, semiMajor, semiMinor, electronAngles, electronSpeed: speed, electrons };
    }

    const orbits = [
      makeOrbit(4.2, 2.6, orbitTilts[0], orbitColors[0], 1, 0.012),
      makeOrbit(5.4, 3.4, orbitTilts[1], orbitColors[1], 2, 0.009),
      makeOrbit(6.6, 4.2, orbitTilts[2], orbitColors[2], 1, 0.007),
    ];

    // A few faint static dots for ambient depth.
    const dustCount = 60;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 30;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      dustPositions[i * 3 + 2] = -8 - Math.random() * 15;
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dustMaterial = new THREE.PointsMaterial({
      size: 0.05,
      map: glowTexture,
      transparent: true,
      opacity: 0.35,
      color: 0xf5eee0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      alphaTest: 0.001,
    });
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dust);

    const atomGroup = new THREE.Group();
    atomGroup.add(nucleus);
    orbits.forEach((orbit) => atomGroup.add(orbit.group));
    scene.add(atomGroup);

    let isVisible = true;
    let frameId: number;
    let clock = 0;

    const pointer = { x: 0, y: 0 };

    function handlePointerMove(e: PointerEvent) {
      const rect = container!.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    }
    window.addEventListener("pointermove", handlePointerMove);

    function resize() {
      if (!container) return;
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    }
    resize();

    function animate() {
      clock += 0.016;

      if (isVisible) {
        orbits.forEach((orbit) => {
          const posAttr = orbit.electrons.geometry.getAttribute("position") as THREE.BufferAttribute;
          for (let i = 0; i < orbit.electronAngles.length; i++) {
            orbit.electronAngles[i] += orbit.electronSpeed;
            posAttr.array[i * 3] = Math.cos(orbit.electronAngles[i]) * orbit.semiMajor;
            posAttr.array[i * 3 + 2] = Math.sin(orbit.electronAngles[i]) * orbit.semiMinor;
          }
          posAttr.needsUpdate = true;
        });

        nucleus.scale.setScalar(1 + Math.sin(clock * 1.5) * 0.06);

        atomGroup.rotation.y += 0.0015;
        atomGroup.rotation.x = Math.sin(clock * 0.08) * 0.05;

        camera.position.x += (pointer.x * 1.2 - camera.position.x) * 0.04;
        camera.position.y += (1.5 - pointer.y * 0.8 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      }
      frameId = requestAnimationFrame(animate);
    }
    animate();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handlePointerMove);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      nucleusGeometry.dispose();
      nucleusMaterial.dispose();
      orbits.forEach((orbit) => {
        orbit.electrons.geometry.dispose();
        (orbit.electrons.material as THREE.Material).dispose();
        orbit.group.children.forEach((child) => {
          if (child instanceof THREE.Line) {
            child.geometry.dispose();
            (child.material as THREE.Material).dispose();
          }
        });
      });
      dustGeometry.dispose();
      dustMaterial.dispose();
      glowTexture.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} aria-hidden className="absolute inset-0 z-0 bg-black" />;
}
