import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

interface SplitTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: string;
  from?: Record<string, number>;
  to?: Record<string, number>;
  threshold?: number;
  rootMargin?: string;
  textAlign?: 'left' | 'center' | 'right';
  onLetterAnimationComplete?: () => void;
}

interface SplitInstance {
  revert: () => void;
  chars?: Element[];
  words?: Element[];
  lines?: Element[];
}

interface ElementWithSplit extends HTMLElement {
  _rbsplitInstance?: SplitInstance;
}

const SplitText = ({
  text,
  className = '',
  style: customStyle,
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  onLetterAnimationComplete
}: SplitTextProps) => {
  const ref = useRef<HTMLHeadingElement>(null);
  const animationCompletedRef = useRef(false);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  
  // Check fonts loaded status synchronously
  const fontsLoaded = document.fonts.status === 'loaded';

  // Keep callback ref updated
  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded) return;
      if (animationCompletedRef.current) return;
      
      const el = ref.current as ElementWithSplit;

      if (el._rbsplitInstance) {
        try {
          el._rbsplitInstance.revert();
        } catch {
          /* noop */
        }
        el._rbsplitInstance = undefined;
      }

      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
      const sign =
        marginValue === 0
          ? ''
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}`
            : `+=${marginValue}${marginUnit}`;
      const start = `top ${startPct}%${sign}`;

      let targets: Element[] = [];
      const assignTargets = (self: SplitInstance) => {
        if (splitType.includes('chars') && self.chars?.length) targets = self.chars;
        if (targets.length === 0 && splitType.includes('words') && self.words?.length) targets = self.words;
        if (targets.length === 0 && splitType.includes('lines') && self.lines?.length) targets = self.lines;
        if (targets.length === 0) targets = self.chars || self.words || self.lines || [];
      };

      const splitInstance = new GSAPSplitText(el, {
        type: splitType,
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char',
        onSplit: (self: SplitInstance) => {
          assignTargets(self);
          if (targets.length === 0) return;
          
          gsap.fromTo(
            targets,
            { ...from },
            {
              ...to,
              duration,
              ease,
              stagger: delay / 1000,
              scrollTrigger: {
                trigger: el,
                start,
                once: true,
              },
              onComplete: () => {
                animationCompletedRef.current = true;
                onCompleteRef.current?.();
              },
            }
          );
        }
      });

      el._rbsplitInstance = splitInstance;

      return () => {
        ScrollTrigger.getAll().forEach(st => {
          if (st.trigger === el) st.kill();
        });
        try {
          splitInstance.revert();
        } catch {
          /* noop */
        }
        el._rbsplitInstance = undefined;
      };
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        fontsLoaded
      ],
      scope: ref
    }
  );

  const style: React.CSSProperties = {
    ...customStyle,
    textAlign,
    overflow: 'hidden',
    display: 'inline-block',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
  };

  return (
    <h1 
      ref={ref} 
      style={style} 
      className={`split-parent ${className}`}
    >
      {text}
    </h1>
  );
};

export default SplitText;
