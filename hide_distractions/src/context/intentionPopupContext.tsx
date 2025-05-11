/// Context to handle the intention popup.
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from "react";

/// inteface to store the intention details.
interface IntentionContextProps {
  intention: string;
  setIntention: (value: string) => void;
  isIntentionSet: boolean;
  timer: number;
  setTimer: (minutes: number) => void;
  timeLeft: number;
  startFocusTimer: (minutes: number) => void;
  stopFocusTimer: () => void;
  timerActive: boolean;
  setTimerActive: (active: boolean) => void;
  setTimeLeft: (seconds: number) => void;
}

/// instance creation for the context of intention popup
const IntentionContext = createContext<IntentionContextProps>({
  intention: "",
  setIntention: () => {},
  isIntentionSet: false,
  timer: 0,
  setTimer: () => {},
  timeLeft: 0,
  startFocusTimer: () => {},
  stopFocusTimer: () => {},
  timerActive: false,
  setTimerActive: () => {},
  setTimeLeft: () => {},
});

/// function of the intetion popup
export const IntentionProvider = ({ children }: { children: ReactNode }) => {
  const [intention, setIntention] = useState("");
  const [isIntentionSet, setisIntentionSet] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // remaining time (in seconds)
  const [timerActive, setTimerActive] = useState(false);

  /// use effect to get the previoiusly stored intention when popup loaded
  useEffect(() => {
    const saved = sessionStorage.getItem("intention");
    if (saved) {
      setIntention(saved);
      setisIntentionSet(saved.trim().length > 0);
    }

    /// use effect to handle the intention changes.
    const handleIntentionEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newIntention = customEvent.detail;

      console.log("Context received intention from content:", newIntention);
      sessionStorage.setItem("intention", newIntention);
      setIntention(newIntention);
      setisIntentionSet(newIntention.trim().length > 0);
    };
    window.addEventListener("intention-saved", handleIntentionEvent);

    return () => {
      window.removeEventListener("intention-saved", handleIntentionEvent);
    };
  }, []);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateTimer = (minutes: number) => {
    setTimer(minutes);
    setTimeLeft(minutes * 60);
  };
  const startFocusTimer = (minutes: number) => {
    const totalSeconds = minutes * 60;
    setTimer(minutes);
    setTimeLeft(totalSeconds);
    setTimerActive(true);

    chrome.storage.local.set({
      focusStart: Date.now(),
      focusDuration: minutes,
      focusIntention: intention,
    });

    if (intervalRef.current) clearInterval(intervalRef.current);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          chrome.storage.local.remove([
            "focusStart",
            "focusDuration",
            "focusIntention",
          ]);
          window.dispatchEvent(new CustomEvent("show-popup-again"));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    intervalRef.current = interval;
  };

  const stopFocusTimer = () => {
    setTimerActive(false);
    setTimeLeft(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  /// to set the new intetnion.
  return (
    <IntentionContext.Provider
      value={{
        intention,
        setIntention: (val: string) => {
          setIntention(val);
          setisIntentionSet(val.trim().length > 0);
        },
        timer,
        setTimer: updateTimer,
        isIntentionSet,
        timeLeft,
        startFocusTimer,
        stopFocusTimer,
        timerActive,
        setTimerActive,
        setTimeLeft,
      }}
    >
      {children}
    </IntentionContext.Provider>
  );
};

export const useIntention = () => useContext(IntentionContext);
