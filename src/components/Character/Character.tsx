import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Chatter } from "../../types/Chatter";
import { TwitchEvent } from "../../types/TwitchEvent";
import CharacterChatMessage from "./CharacterChatMessage";
import SpriteSheetHandler from "../../helpers/SpriteSheetHandler";

// Game Physics Constants
const FALLING_SPEED = 4;
const DRAG = 0.1;
const JUMP_FORCE = { x: -25, y: -25 };
const SPRITE_DIMENSIONS = { width: 32, height: 32 };

// Interface Definitions
interface CharacterProps {
  name: string;
  state: State;
  newCurrentMessage?: TwitchEvent | undefined;
}

interface Position {
  x: number;
  y: number;
}

interface State {
  position?: Position;
  walking?: 1 | -1;
  grounded?: boolean;
  idle?: boolean;
  targetX?: number;
  velocity?: Velocity;
  direction?: number;
  spriteScale?: number;
  spriteSource?: string;
}

interface Velocity {
  x: number;
  y: number;
}
interface Sprites {
  [key: string]: string[] | undefined;
}

export interface CharacterHandle {
  setData: (data: Chatter) => void;
  getData: () => Chatter | undefined;
  say: (message: TwitchEvent) => void;
  walkTo: (x: number) => void;
  getState: () => void;
}

export const Character = forwardRef<CharacterHandle, CharacterProps>(
  function Character({ name, state, newCurrentMessage }, ref) {
    // Refs
    const spriteRef = useRef<HTMLImageElement>(null);
    const frameRef = useRef(0);

    // Character Sprites
    const [sprites, setSprites] = useState<Sprites>({});

    // Initial Position Setup
    const initialX = Math.random() * window.innerWidth;
    const randomPosition =
      initialX > 150 ? initialX + Math.random() * 150 : 150;

    // State Management
    const [data, setData] = useState<Chatter | undefined>(undefined);
    const [velocity, setVelocity] = useState<Velocity>(
      state.velocity || { x: 0, y: 0 }
    );
    const [position, setPosition] = useState<Position>(
      state.position || { x: randomPosition, y: window.innerHeight }
    );
    const [spriteScale] = useState(4);
    const [spriteSource, setSpriteSource] = useState(`src/assets/1x.gif`);
    const [targetX, setTargetX] = useState<number | undefined>(
      state.targetX || undefined
    );
    const [walking, setWalking] = useState(state.walking || 0);
    const [direction, setDirection] = useState(state.direction || 1);
    const [grounded, setGrounded] = useState(false);
    const [idle, setIdle] = useState(false);
    const [currentMessage, setCurrentMessage] = useState<
      TwitchEvent | undefined
    >();
    const [timeSinceLastMessage, setTimeSinceLastMessage] = useState<number>(0);
    useEffect(() => {
      console.log(sprites);

      // if (data?.spriteSheets) {
      // data.spriteSheets.forEach((sheet) => {
      SpriteSheetHandler("src/assets/exampleSheet.png", 32, 32).then(
        (spriteSheet) => {
          console.log(spriteSheet[0]);
          setSprites((prev) => ({
            ...prev,
            ["1"]: spriteSheet,
          }));
        }
      );
      // });
      // }
    }, [data]);

    // Update current message when new message is received
    useEffect(() => {
      if (newCurrentMessage) {
        setCurrentMessage(newCurrentMessage);
      }
    }, [newCurrentMessage]);

    // Expose methods through ref
    useImperativeHandle(ref, () => ({
      setData: (data: Chatter) => setData(data),
      getData: () => data,
      getState: () => ({
        position,
        velocity,
        walking,
        grounded,
        idle,
        targetX,
        direction,
        spriteScale,
        spriteSource,
      }),
      say: (message: TwitchEvent) => {
        setCurrentMessage(message);
      },
      walkTo: (x: number) => setTargetX(x),
    }));

    // Handle random movement when grounded
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

    // Handle walking direction based on target position
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

    // Update character direction based on walking state
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

    // Handle message timeout
    useEffect(() => {
      setTimeSinceLastMessage(new Date().getTime());
      const messageTimeout = setTimeout(() => {
        setCurrentMessage(undefined);
      }, 10000);
      return () => clearTimeout(messageTimeout);
    }, [currentMessage]);

    // Load sprite based on character name
    useEffect(() => {
      const sprite = new Image();
      sprite.onload = () => {
        sprite.width = SPRITE_DIMENSIONS.width;
        sprite.height = SPRITE_DIMENSIONS.height;

        setSpriteSource(sprite.src);
      };
      if (name.toLowerCase() === "zcmb1e_") sprite.src = "src/assets/max.png";
      else sprite.src = "src/assets/Idle.png";
    }, [name]);

    // Delete character after 10 minutes of inactivity
    useEffect(() => {
      const deleteTimeout = setTimeout(() => {
        if (
          timeSinceLastMessage &&
          new Date().getTime() - timeSinceLastMessage > 450000 &&
          data?.msg.userId
        ) {
          console.log("delete");
        }
      }, 600000);

      return () => clearTimeout(deleteTimeout);
    }, [timeSinceLastMessage, data]);

    // Handle character jump
    const handleJump = () => {
      setVelocity(() => JUMP_FORCE);
      setPosition((prev) => ({ ...prev, y: prev.y - 5 }));
      setGrounded(false);
    };

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
                display: "flex",
              }}
            >
              <CharacterChatMessage message={currentMessage} />
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
