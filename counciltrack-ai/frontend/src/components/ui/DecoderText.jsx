import { useState, useEffect, useRef } from "react";

// Clean, stable character set that reduces width variation and avoids layout jitter
const CIPHER_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789$#%*+";

/**
 * DecoderText: Smooth, cinematic letter-by-letter unscramble/decoder animation.
 *
 * @param {string} text - Target text to display
 * @param {number} speed - Milliseconds per frame (default 50ms - smooth and readable)
 * @param {number} delay - Initial delay before animation starts (default 100ms)
 * @param {boolean} triggerOnHover - Whether to replay animation on hover (default true)
 * @param {string} className - Optional styling classes
 * @param {string} as - HTML element tag (default "span")
 */
export default function DecoderText({
  text = "",
  speed = 50,
  delay = 100,
  triggerOnHover = true,
  className = "",
  as: Component = "span",
  ...props
}) {
  const [displayText, setDisplayText] = useState(text);
  const [isDecoding, setIsDecoding] = useState(false);
  const timerRef = useRef(null);

  const runDecoder = () => {
    if (!text || text.length === 0) return;
    setIsDecoding(true);

    let progress = 0;
    const totalLength = text.length;

    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setDisplayText(() => {
        return text
          .split("")
          .map((char, index) => {
            // Preserve spaces and punctuation
            if (char === " " || char === "•" || char === "—" || char === "-" || char === "&" || char === ",") {
              return char;
            }
            // If character index is resolved
            if (index < Math.floor(progress)) {
              return text[index];
            }
            // Scrambled placeholder for pending letters
            return CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)];
          })
          .join("");
      });

      // Slower, smooth progression (each letter scrambles for ~3-4 frames)
      progress += 0.35;

      if (progress >= totalLength) {
        setDisplayText(text);
        clearInterval(timerRef.current);
        setIsDecoding(false);
      }
    }, speed);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      runDecoder();
    }, delay);

    return () => {
      clearTimeout(timeout);
      clearInterval(timerRef.current);
    };
  }, [text, speed, delay]);

  const handleMouseEnter = () => {
    if (triggerOnHover && !isDecoding) {
      runDecoder();
    }
  };

  return (
    <Component
      onMouseEnter={handleMouseEnter}
      className={`inline-block transition-colors duration-300 ${
        isDecoding ? "text-indigo-600/90" : ""
      } ${className}`}
      {...props}
    >
      {displayText}
    </Component>
  );
}
