import { createContext } from "react";
import { useDarkMode } from "../custom_hooks";

export const ThemeContext = createContext();

export const ThemeContextProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useDarkMode()

  
    return (
      <ThemeContext.Provider
        value={{
          darkMode,
          setDarkMode
        }}
      >
        {children}
      </ThemeContext.Provider>
    );
  };