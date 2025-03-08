import { Assets, Container, Sprite, Texture } from "pixi.js";
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

/**
 * Interface representing a handle to a character with various actions.
 */
export interface CharacterHandle {
  /**
   * Sets the data for the character.
   * @param data - The data to set for the character.
   */
  setData: (data: Chatter) => void;

  /**
   * Retrieves the data of the character.
   * @returns The data of the character, or undefined if not set.
   */
  getData: () => Chatter | undefined;

  /**
   * Makes the character say a given message.
   * @param message - The message for the character to say.
   */
  say: (message: string) => void;

  /**
   * Makes the character walk to a specified x-coordinate.
   * @param x - The x-coordinate to walk to.
   */
  walkTo: (x: number) => void;
}

/**
 * Character component that represents a character in the game.
 * @component
 * @param {React.Ref<CharacterHandle>} ref - The reference to the character handle.
 * @typedef {Object} CharacterHandle
 * @property {(x: number) => void} walkTo - Method to make the character walk to a target position.
 *
 * @typedef {Object} CharacterProps
 * @property {string} name - The name of the character.
 */
export const Character = forwardRef<CharacterHandle, CharacterProps>(
  function Character({ name }, ref) {
    // Refs
    const windowRef = useRef<Window>(null);
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
      y: (windowRef.current?.screenY ?? window.innerHeight) - 45,
    });
    const [targetX, setTargetX] = useState<number | undefined>(undefined);
    const [walking, setWalking] = useState(0);
    const [direction, setDirection] = useState(1);
    const [grounded, setGrounded] = useState(false);
    const [idle, setIdle] = useState(false);
    const [currentMessage, setCurrentMessage] = useState<string | undefined>();

    // Expose methods to parent component
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
    // Game loop
    useEffect(() => {
      const gameLoop = () => {
        // Update physics
        setPosition((prev) => ({
          x: prev.x + velocity.x,
          y: prev.y < position.y ? prev.y + velocity.y : position.y,
        }));

        setVelocity((prev) => ({
          x: grounded ? walking : prev.x - DRAG * prev.x,
          y: prev.y < FALLING_SPEED ? prev.y + FALLING_SPEED : prev.y,
        }));

        if (position.y >= position.y && !grounded) {
          setGrounded(true);
        }

        // requestAnimationFrame
        frameRef.current = requestAnimationFrame(gameLoop);
      };

      // Start game loop
      frameRef.current = requestAnimationFrame(gameLoop);

      // Cleanup
      return () => cancelAnimationFrame(frameRef.current);
    }, [grounded, velocity, walking, position, targetX]);

    // Clear message after timeout
    useEffect(() => {
      const timer = setTimeout(() => {
        setCurrentMessage(undefined);
      }, 10000);
      return () => clearTimeout(timer);
    }, [currentMessage]);

    // Jump function
    function jump() {
      setVelocity(() => ({ x: -25, y: -25 }));
      setPosition((prev) => ({ x: prev.x, y: prev.y - 5 }));
      setGrounded(false);
    }

    return (
      <pixiContainer ref={containerRef} x={position.x} y={position.y}>
        <pixiText // Character Name
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
