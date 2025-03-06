import { extend } from "@pixi/react";
import { Assets, Container, Sprite, Text, Texture } from "pixi.js";
import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Chatter } from "../types/Chatter";

// Constants
const FALLING_SPEED = 4;
const DRAG = 0.1;

// Extend PixiJS components
extend({ Container, Text });

// Types
interface CharacterProps {
  name: string;
}

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

export interface CharacterHandle {
  setData: (data: Chatter) => void;
  getData: () => Chatter | undefined;
  say: (message: string) => void;
  walkTo: (x: number) => void;
}

export const Character = forwardRef<CharacterHandle, CharacterProps>(
  function Character({ name }, ref) {
    // Refs
    const windowRef = useRef<Window>(null);
    const FLOOR_HEIGHT =
      (windowRef.current?.screenY ?? window.innerHeight) - 45;
    const spriteRef = useRef<Sprite>(null);
    const frameRef = useRef(0);
    const containerRef = useRef<Container>(null);
    const randomPosition = Math.random() * 1000;

    // State
    const [data, setData] = useState<Chatter | undefined>(undefined);
    const [texture, setTexture] = useState(Texture.EMPTY);
    const [velocity, setVelocity] = useState<Velocity>({ x: 0, y: 0 });
    const [position, setPosition] = useState<Position>({
      x: randomPosition > 150 ? randomPosition + Math.random() * 150 : 150,
      y: FLOOR_HEIGHT,
    });
    const [targetX, setTargetX] = useState<number | undefined>(undefined);
    const [walking, setWalking] = useState(0);
    const [direction, setDirection] = useState(1);
    const [grounded, setGrounded] = useState(false);
    const [idle, setIdle] = useState(false);
    const [currentMessage, setCurrentMessage] = useState<string | undefined>();

    useImperativeHandle(ref, () => ({
      setData: (data: Chatter) => setData(data),
      getData: () => data,
      say: (message: string) => setCurrentMessage(message),
      walkTo: (x: number) => setTargetX(x),
    }));

    // Load character texture
    useEffect(() => {
      if (texture === Texture.EMPTY) {
        Assets.load("./src/assets/Idle.png").then(setTexture);
      }
    }, [texture]);

    // Set Random Target Position
    useEffect(() => {
      const setRandomTarget = async () => {
        if (targetX === undefined && grounded) {
          await new Promise<void>((resolve) =>
            idle ? setTimeout(resolve, Math.random() * 10000) : resolve()
          );
          setTargetX(Math.random() * 1000);
          setIdle(true);
        }
      };
      setRandomTarget();
    }, [targetX, grounded, idle]);

    // Handle walking to target
    useEffect(() => {
      if (targetX) {
        if (Math.abs(position.x - targetX) < 1) {
          setTargetX(undefined);
          setWalking(0);
        } else {
          setWalking(position.x < targetX ? 1 : -1);
        }
      }
    }, [targetX, position.x]);

    // Handle direction
    useEffect(() => {
      if (walking !== 0) {
        setDirection(walking * -1);
      }
    }, [walking]);

    function jump() {
      setVelocity(() => ({ x: -25, y: -25 }));
      setPosition((prev) => ({ x: prev.x, y: prev.y - 5 }));
      setGrounded(false);
    }

    // Game loop
    useEffect(() => {
      const updatePhysics = () => {
        setPosition((prev) => ({
          x: prev.x + velocity.x,
          y: prev.y < FLOOR_HEIGHT ? prev.y + velocity.y : FLOOR_HEIGHT,
        }));

        setVelocity((prev) => ({
          x: grounded ? walking : prev.x - DRAG * prev.x,
          y: prev.y < FALLING_SPEED ? prev.y + FALLING_SPEED : prev.y,
        }));

        if (position.y >= FLOOR_HEIGHT && !grounded) {
          setGrounded(true);
        }
      };

      const gameLoop = () => {
        updatePhysics();
        frameRef.current = requestAnimationFrame(gameLoop);
      };

      frameRef.current = requestAnimationFrame(gameLoop);

      return () => cancelAnimationFrame(frameRef.current);
    }, [grounded, velocity, walking, position, targetX, FLOOR_HEIGHT]);

    useEffect(() => {
      const timer = setTimeout(() => {
        setCurrentMessage(undefined);
      }, 10000);
      return () => clearTimeout(timer);
    }, [currentMessage]);

    return (
      <pixiContainer ref={containerRef} x={position.x} y={position.y}>
        <pixiText
          x={0}
          y={-50}
          text={name || "placeholder"}
          style={{ fill: "white", fontSize: "20px" }}
          anchor={0.5}
        />
        <pixiText
          text={currentMessage || ""}
          style={{
            fill: "white",
            fontSize: "50px",
            dropShadow: {
              alpha: 1,
              color: "0x000000",
            },
          }}
          anchor={{ x: 0.5, y: 5 }}
        />
        <pixiSprite
          onClick={jump}
          scale={{ x: direction * 2.5, y: 2.5 }}
          ref={spriteRef}
          anchor={0.5}
          eventMode={"static"}
          texture={texture}
        />
      </pixiContainer>
    );
  }
);
