import { Box, TextField } from "@mui/material";
import CustomButton from '../common/CustomButton';
import { motion } from "framer-motion";
import { ANIMATIONS } from "../../config/animations";

/**
 * Paso 1: Cargar archivo Excel
 *
 * Props:
 * - archivoExcel: archivo seleccionado (o null)
 * - onFileChange: función para manejar la carga del archivo
 * - theme: objeto de tema (colores)
 */
const StepFileUpload = ({ archivoExcel, onFileChange, theme }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <motion.div
        whileHover={ANIMATIONS.formFieldHover}
        whileTap={{ scale: 0.98 }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
          <TextField
            label="Archivo Excel"
            value={archivoExcel?.name || ""}
            placeholder="Selecciona un archivo Excel..."
            variant="outlined"
            size="small"
            InputProps={{
              readOnly: true,
            }}
            sx={{
              width: "70%",
              height: "40px",
              "& .MuiOutlinedInput-root": {
                background: theme.fondoOverlay,
                borderRadius: "25px",
                transition: "all 0.3s ease",
                boxShadow: theme.sombraContenedor,
                "&:hover": {
                  "& > fieldset": {
                    borderColor: theme.bordeHover,
                    borderWidth: "2px",
                  },
                  transform: "translateY(-2px)",
                  boxShadow: theme.sombraHover,
                },
                "&.Mui-focused": {
                  "& > fieldset": {
                    borderColor: theme.bordeHover,
                    borderWidth: "2px",
                  },
                  transform: "translateY(-2px)",
                  boxShadow: theme.sombraHover,
                },
                "& > fieldset": {
                  borderColor: theme.bordePrincipal,
                  borderWidth: "1.5px",
                },
              },
              "& .MuiInputLabel-root": {
                color: theme.textoSecundario,
                fontWeight: 500,
                "&.Mui-focused": {
                  color: theme.textoPrincipal,
                  fontWeight: 600,
                },
              },
              "& .MuiInputBase-input": {
                color: theme.textoPrincipal,
                fontWeight: 500,
              },
              "& .MuiFormHelperText-root": {
                color: theme.textoSecundario,
                fontSize: "0.75rem",
              },
            }}
          />
          <CustomButton
            variant="outlined"
            component="label"
            size="small"
            sx={{
              background: theme.fondoOverlay,
              color: theme.textoPrincipal,
              borderColor: theme.bordePrincipal,
              borderRadius: "25px",
              px: 3,
              py: 1.5,
              fontSize: "0.9rem",
              fontWeight: 600,
              textTransform: "none",
              transition: "all 0.3s ease",
              borderWidth: "2px",
              minWidth: "120px",
              height: "40px",
              boxShadow: theme.sombraContenedor,
              "&:hover": {
                background: theme.fondoHover,
                borderColor: theme.bordeHover,
                transform: "translateY(-2px)",
                boxShadow: theme.sombraHover,
              },
              "&:active": {
                transform: "translateY(0)",
              },
              "&:focus": {
                borderColor: theme.bordeHover,
                borderWidth: "2px",
              },
            }}
          >
            Examinar
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={(e) => {
                console.log("File selected:", e.target.files[0]);
                onFileChange(e);
              }}
            />
          </CustomButton>
        </Box>
      </motion.div>
    </Box>
  );
};

export default StepFileUpload;
