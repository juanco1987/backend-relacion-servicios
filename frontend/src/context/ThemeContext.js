import React, { createContext, useState, useContext} from "react";
import { THEMES } from "../config/theme";

const ThemeContext = createContext();

export const ThemeProvider = ({children})=> {

    const [modo, setModo] = useState("claro");

    const alternarTema = () => {
        setModo((prev) => (prev === "oscuro" ? "claro" : "oscuro"));
    };

    const theme = THEMES [modo];

    // Aplicar el fondo del tema al body
    React.useEffect(() => {
        document.body.style.backgroundColor = theme.fondoCuerpo;
        document.body.style.transition = 'background-color 0.3s ease';
    }, [theme.fondoCuerpo]);
    return(
        <ThemeContext.Provider value={{ theme, modo, alternarTema}}>
            {children}
        </ThemeContext.Provider>
    );

};

export const useTheme = () => useContext(ThemeContext);