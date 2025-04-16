import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface IntentionContextProps{
  intention: string;
  setIntention:(value :string) => void;
  isIntentionSet : boolean;
}

const IntentionContext = createContext<IntentionContextProps>({
  intention: "",
  setIntention: () => {},
  isIntentionSet : false,
});

export const IntentionProvider = ({ children }: { children: ReactNode }) => {
  const [intention, setIntention] = useState("");
  const [isIntentionSet, setisIntentionSet] = useState(false);

  useEffect(() => {

    const saved = sessionStorage.getItem("intention");
  if (saved) {
    setIntention(saved);
    setisIntentionSet(saved.trim().length > 0);
  }

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

  return (<IntentionContext.Provider
    value={{
      intention,
      setIntention: (val: string) => {
        setIntention(val);
        setisIntentionSet(val.trim().length > 0);
      },
      isIntentionSet,
    }}
  >
      {children}
    </IntentionContext.Provider>
  );
};

export const useIntention = () => useContext(IntentionContext);
