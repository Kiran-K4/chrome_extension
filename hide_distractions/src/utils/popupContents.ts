type Translation = {
    heading: string;
    question: string;
    dropdownLabel: string;
    placeholder: string;
    proceed: string;
    warning: string;
  };

export const translations :{[key :string] : Translation} = {
    en: {
      heading: "You are currently accessing a distraction site.",
      question: "Can you share your intention to visit this site?",
      dropdownLabel: "Please select how long you intend to stay on this site.",
      placeholder: "Type your reason here...",
      proceed: "Proceed",
      warning: "Please provide a more detailed explanation (at least 15 characters)."
    },
    es: {
      heading: "Estás accediendo a un sitio de distracción.",
      question: "¿Puedes compartir tu intención de visitar este sitio?",
      dropdownLabel: "Por favor, selecciona cuánto tiempo planeas quedarte en este sitio.",
      placeholder: "Escribe tu motivo aquí...",
      proceed: "Continuar",
      warning: "Por favor, proporciona una explicación más detallada (al menos 15 caracteres)."
    }
    // Add more languages if needed
  };