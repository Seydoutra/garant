import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { CanvasTexture, type Mesh } from "three";
import QRCode from "qrcode";
import { content as c } from "../content";
function Sheet() {
  const scan = useRef<Mesh>(null);
  const [texture, setTexture] = useState<CanvasTexture>();
  useEffect(() => {
    let active = true;
    let created: CanvasTexture | undefined;
    async function make() {
      await document.fonts.ready;
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 820;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#e9efeb";
      ctx.fillRect(0, 0, 640, 820);
      ctx.fillStyle = "#163a2d";
      ctx.font = '600 38px "Space Grotesk"';
      ctx.fillText(c.brand, 55, 85);
      ctx.font = '18px "JetBrains Mono"';
      ctx.fillText(c.ui.documentId, 385, 80);
      ctx.strokeStyle = "#779c8c";
      ctx.beginPath();
      ctx.moveTo(55, 120);
      ctx.lineTo(585, 120);
      ctx.stroke();
      ctx.font = "22px Inter";
      ctx.fillText(c.ui.documentOrg, 55, 185);
      ctx.font = '500 27px "Space Grotesk"';
      ctx.fillText(c.ui.documentTitle, 55, 260);
      ctx.fillStyle = "#c5d4cb";
      [320, 343, 366].forEach((y, i) => ctx.fillRect(55, y, 510 - i * 75, 6));
      ctx.fillStyle = "#163a2d";
      ctx.font = '500 36px "Space Grotesk"';
      ctx.fillText(c.ui.documentName, 55, 445);
      ctx.font = "17px Inter";
      ctx.fillText(c.ui.documentBody, 55, 485);
      ctx.strokeStyle = "#779c8c";
      ctx.beginPath();
      ctx.arc(95, 635, 42, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = "32px Inter";
      ctx.fillText("✓", 81, 647);
      ctx.font = "16px Inter";
      ctx.fillText(c.ui.date, 55, 722);
      ctx.font = "12px Inter";
      ctx.fillText(c.fictitious, 55, 751);
      const url = new URL(location.href);
      url.hash = "demonstration";
      url.searchParams.set("demo", c.ui.documentId);
      const qr = document.createElement("canvas");
      await QRCode.toCanvas(qr, url.href, {
        width: 140,
        margin: 1,
        color: { dark: "#163a2d", light: "#e9efeb" },
      });
      ctx.drawImage(qr, 440, 610, 145, 145);
      if (active) {
        created = new CanvasTexture(canvas);
        setTexture(created);
      }
    }
    make().catch(() => {});
    return () => {
      active = false;
      created?.dispose();
    };
  }, []);
  useFrame(({ clock }) => {
    if (scan.current)
      scan.current.position.y = Math.sin(clock.elapsedTime * 0.7) * 1.85;
  });
  return (
    <Float speed={1.3} rotationIntensity={0.12} floatIntensity={0.35}>
      <group rotation={[0.04, -0.18, -0.07]}>
        <mesh>
          <boxGeometry args={[3.2, 4.1, 0.045]} />
          <meshStandardMaterial
            color="#dce5e5"
            metalness={0.1}
            roughness={0.65}
          />
        </mesh>
        {texture && (
          <mesh position={[0, 0, 0.03]}>
            <planeGeometry args={[3.2, 4.1]} />
            <meshBasicMaterial map={texture} />
          </mesh>
        )}
        <mesh ref={scan} position={[0, 0, 0.05]}>
          <boxGeometry args={[3.35, 0.015, 0.01]} />
          <meshBasicMaterial color="#2DFFB3" />
        </mesh>
      </group>
    </Float>
  );
}
export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 39 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={1.8} />
      <directionalLight position={[3, 3, 5]} intensity={2} />
      <Sheet />
    </Canvas>
  );
}
