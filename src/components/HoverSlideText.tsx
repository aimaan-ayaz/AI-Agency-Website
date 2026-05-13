"use client";

interface Props {
  text: string;
  className?: string;
}

export default function HoverSlideText({ text, className = "" }: Props) {
  const chars = text.split("");
  const easing = "cubic-bezier(0.19,1,0.22,1)";

  return (
    <span
      className={`relative inline-block overflow-hidden align-bottom leading-[1] whitespace-nowrap ${className}`}
    >
      <span className="inline-flex">
        {chars.map((char, i) => (
          <span
            key={`t-${i}`}
            className="inline-block transition-all duration-[600ms] group-hover:-translate-y-full group-hover:opacity-0"
            style={{
              transitionDelay: `${i * 0.02}s`,
              transitionTimingFunction: easing,
            }}
          >
            {char === " " ? " " : char}
          </span>
        ))}
      </span>
      <span
        aria-hidden="true"
        className="absolute left-0 top-full inline-flex"
      >
        {chars.map((char, i) => (
          <span
            key={`b-${i}`}
            className="inline-block transition-transform duration-[600ms] group-hover:-translate-y-full"
            style={{
              transitionDelay: `${i * 0.02}s`,
              transitionTimingFunction: easing,
            }}
          >
            {char === " " ? " " : char}
          </span>
        ))}
      </span>
    </span>
  );
}
