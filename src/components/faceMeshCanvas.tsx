import { useEffect, useRef } from "react";
import {
  FaceMesh,
  Results,
  FACEMESH_TESSELATION,
  FACEMESH_RIGHT_EYE,
  FACEMESH_LEFT_EYE,
  FACEMESH_FACE_OVAL,
  FACEMESH_LIPS,
  Options,
} from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors } from "@mediapipe/drawing_utils";
import { Face } from "Kalidokit";

const faceMeshOptions: Options = {
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
};

const FaceMeshCanvas = ({
  className,
  onStateChange,
}: {
  className: string;
  onStateChange: (state: string) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webcamRef = useRef<HTMLVideoElement>(null);

  const drawDebug = (results: Results, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");

    if (results.multiFaceLandmarks) {
      for (const landmarks of results.multiFaceLandmarks) {
        drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, {
          color: "#E0E0E0",
          lineWidth: 0.4,
        });

        drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYE, {
          color: "#E0E0E0",
          lineWidth: 1,
        });

        drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYE, {
          color: "#E0E0E0",
          lineWidth: 1,
        });

        drawConnectors(ctx, landmarks, FACEMESH_FACE_OVAL, {
          color: "#E0E0E0",
          lineWidth: 1,
        });

        drawConnectors(ctx, landmarks, FACEMESH_LIPS, {
          color: "#E0E0E0",
          lineWidth: 1,
        });
      }
    }
  };

  const onFaceMeshResults = async (
    results: Results,
    canvas: HTMLCanvasElement
  ) => {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    drawDebug(results, canvas);

    for (const landmarks of results.multiFaceLandmarks) {
      const faceRig = Face.solve(landmarks, {
        runtime: "mediapipe", // default is 'tfjs'
        imageSize: {
          width: canvas.width,
          height: canvas.height,
        },
      });

      if (faceRig.mouth.y > 0) {
        if (faceRig.eye.l < 0.3) {
          onStateChange("open-blink");
        } else {
          onStateChange("open");
        }
      } else {
        if (faceRig.eye.l < 0.3) {
          onStateChange("idle-blink");
        } else {
          onStateChange("idle");
        }
      }
    }
  };

  useEffect(() => {
    if (canvasRef.current == null || webcamRef.current == null) return;

    const canvas = canvasRef.current;

    const faceMesh = new FaceMesh({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions(faceMeshOptions);
    faceMesh.onResults((results) => onFaceMeshResults(results, canvas));

    const camera = new Camera(webcamRef.current, {
      onFrame: async () => {
        if (webcamRef.current == null) return;
        await faceMesh.send({ image: webcamRef.current });
      },
    });

    camera.start();

    return () => {
      camera.stop().catch((er) => console.error(er));
      faceMesh.close().catch((er) => console.error(er));
    };
  }, []);

  return (
    <div className={className}>
      <video ref={webcamRef} width={160} height={160} className="hidden" />
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default FaceMeshCanvas;
