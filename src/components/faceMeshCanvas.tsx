import { useEffect, useRef, useState, useCallback } from "react";
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
  onStateChange,
}: {
  onStateChange: (state: string) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webcamRef = useRef<HTMLVideoElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 100, y: 100 });

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

  // draw landmarks on debug screen and identify face motions using Kalidokit
  const onFaceMeshResults = useCallback(
    (results: Results, canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    },
    [onStateChange]
  );

  // initiate faceMesh and faceMesh camera
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
  }, [onFaceMeshResults]);

  // handle Debug screen camera drag events
  useEffect(() => {
    const moveWindow = (event: MouseEvent) => {
      dragRef.current.style.left = `${event.pageX - pos.x}px`;
      dragRef.current.style.top = `${event.pageY - pos.y}px`;
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return;
      setPos({
        x: event.clientX - dragRef.current.getBoundingClientRect().left,
        y: event.clientY - dragRef.current.getBoundingClientRect().top,
      });
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mousemove", moveWindow);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", moveWindow);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    const ele = dragRef.current;

    ele.addEventListener("mousedown", handleMouseDown);

    return () => {
      ele.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  useEffect(() => {
    console.log("faceMesh");
  });

  return (
    <div
      className="absolute bottom-20 left-10 w-40 h-40 bg-black rounded-3xl overflow-hidden cursor-move"
      ref={dragRef}
    >
      <video ref={webcamRef} width={160} height={160} className="hidden" />
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default FaceMeshCanvas;
