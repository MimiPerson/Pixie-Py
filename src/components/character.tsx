import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Chatter } from "../types/Chatter";

// Game Physics Constants
const FALLING_SPEED = 4;
const DRAG = 0.1;
const JUMP_FORCE = { x: -25, y: -25 };
const SPRITE_DIMENSIONS = { width: 32, height: 32 };

// Interface Definitions
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
    const spriteRef = useRef<HTMLImageElement>(null);
    const frameRef = useRef(0);

    // Initial Position Setup
    const initialX = Math.random() * window.innerWidth;
    const randomPosition =
      initialX > 150 ? initialX + Math.random() * 150 : 150;

    // State Management
    const [data, setData] = useState<Chatter | undefined>(undefined);
    const [velocity, setVelocity] = useState<Velocity>({ x: 0, y: 0 });
    const [position, setPosition] = useState<Position>({
      x: randomPosition,
      y: window.innerHeight + (spriteRef.current?.height ?? 0),
    });
    const [spriteScale] = useState(4);
    const [spriteSource, setSpriteSource] = useState(`src/assets/1x.gif`);
    const [targetX, setTargetX] = useState<number>();
    const [walking, setWalking] = useState(0);
    const [direction, setDirection] = useState(1);
    const [grounded, setGrounded] = useState(false);
    const [idle, setIdle] = useState(false);
    const [currentMessage, setCurrentMessage] = useState<string | undefined>();

    // Expose methods through ref
    useImperativeHandle(ref, () => ({
      setData: (data: Chatter) => setData(data),
      getData: () => data,
      say: (message: string) => setCurrentMessage(message),
      walkTo: (x: number) => setTargetX(x),
    }));

    // Random movement handler
    useEffect(() => {
      let isActive = true;
      const handleRandomMovement = async () => {
        if (grounded) {
          const idleDelay = idle ? Math.random() * 10000 : 0;

          const timeoutPromise = new Promise<void>((resolve) =>
            setTimeout(resolve, idleDelay < 500 ? 500 : idleDelay)
          );
          await timeoutPromise;
          if (isActive) {
            console.debug(
              "setting IdleDelay to: ",
              idleDelay < 500 ? 500 : idleDelay,
              "ms"
            );
            setTargetX(Math.random() * window.innerWidth);
            setIdle(true);
          }
        }
      };
      handleRandomMovement();
      return () => {
        isActive = false;
      };
    }, [targetX, grounded, idle]);

    // Walking direction handler
    useEffect(() => {
      const handleWalking = () => {
        if (!targetX) return;

        const reachedTarget = Math.abs(position.x - targetX) < 1;
        if (reachedTarget) {
          setTargetX(0);
          setWalking(0);
        } else {
          setWalking(position.x < targetX ? 1 : -1);
        }
      };
      handleWalking();
    }, [targetX, position.x]);

    // Character direction handler
    useEffect(() => {
      if (walking !== 0) setDirection(walking * -1);
    }, [walking]);

    // Physics and movement loop
    useEffect(() => {
      const updatePhysics = () => {
        setPosition((prev) => ({
          x: prev.x + velocity.x,
          y:
            prev.y < window.innerHeight
              ? prev.y + velocity.y
              : window.innerHeight,
        }));

        setVelocity((prev) => ({
          x: grounded ? walking : prev.x - DRAG * prev.x,
          y: prev.y < FALLING_SPEED ? prev.y + FALLING_SPEED : prev.y,
        }));

        if (position.y >= window.innerHeight && !grounded) {
          setGrounded(true);
        }
      };

      frameRef.current = requestAnimationFrame(updatePhysics);
      return () => cancelAnimationFrame(frameRef.current);
    }, [grounded, velocity, walking, position, targetX]);

    // Message timeout handler
    useEffect(() => {
      const messageTimeout = setTimeout(() => {
        setCurrentMessage(undefined);
      }, 10000);
      return () => clearTimeout(messageTimeout);
    }, [currentMessage]);

    // Sprite loading
    useEffect(() => {
      const sprite = new Image();
      sprite.onload = () => {
        sprite.width = SPRITE_DIMENSIONS.width;
        sprite.height = SPRITE_DIMENSIONS.height;

        setSpriteSource(sprite.src);
      };
      sprite.src = "src/assets/Idle.png";
    }, []);

    const handleJump = () => {
      setVelocity(() => JUMP_FORCE);
      setPosition((prev) => ({ ...prev, y: prev.y - 5 }));
      setGrounded(false);
    };
    useEffect(() => {
      if (currentMessage) return;
      setCurrentMessage(
        "mewddddddddddddddddddddddddddddddddddddddddddddd" +
          Math.floor(Math.random() * 10)
      );
    }, [currentMessage]);

    // Collision detection function
    const isOverlapping = (rect1: DOMRect, rect2: DOMRect) => {
      return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
      );
    };

    // Example collision detection with another element
    useEffect(() => {
      const checkCollision = () => {
        const spriteRect = spriteRef.current?.getBoundingClientRect();
        const otherElement = document.getElementById("other-element");
        const otherRect = otherElement?.getBoundingClientRect();

        if (spriteRect && otherRect && isOverlapping(spriteRect, otherRect)) {
          console.log("Collision detected!");
        }
      };

      const interval = setInterval(checkCollision, 100);
      return () => clearInterval(interval);
    }, []);

    return (
      <div
        style={{
          position: "absolute",
          left: position.x,
          top: position.y - 85,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        onClick={handleJump}
      >
        <div
          style={{
            position: "absolute",
            bottom: SPRITE_DIMENSIONS.height + 50, // Adjust as needed
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {currentMessage && (
            <div
              style={{
                // Message display
                marginBottom: "10px",
                textSizeAdjust: "auto",
                color: "white",
                fontSize: "35px",
                textShadow: "2px 2px black",
              }}
            >
              {currentMessage}
            </div>
          )}
          <div
            style={{
              // Name display
              color: "white",
              fontSize: "30px",
            }}
          >
            {name || "placeholder"}
          </div>
        </div>
        <img
          ref={spriteRef}
          src={spriteSource}
          alt="Character"
          style={{
            width: SPRITE_DIMENSIONS.width,
            height: SPRITE_DIMENSIONS.height,
            scale: spriteScale,
            transform: `scaleX(${direction})`,
          }}
        />
      </div>
    );
  }
);
