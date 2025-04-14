import { extendTheme } from "@chakra-ui/react"

export const theme = extendTheme({
  colors: {
    brand: {
      primary: "#C25B02", // Cor marrom/laranja para cabeçalho e botões
      secondary: "#E6B325", // Cor amarelo/dourado para os pedidos e fundo
      dark: "#000000", // Cor preta do fundo
      light: "#FFFFFF", // Cor branca para textos
      accent: "#FFD700", // Cor dourada para ícones
    },
  },
  fonts: {
    heading: "'Bubblegum Sans', cursive, sans-serif",
    body: "Poppins, sans-serif",
  },
  styles: {
    global: {
      body: {
        bg: "brand.secondary",
        color: "brand.dark",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "bold",
        borderRadius: "full",
      },
      variants: {
        primary: {
          bg: "brand.primary",
          color: "white",
          _hover: {
            bg: "brand.primary",
            opacity: 0.9,
          },
        },
      },
    },
  },
})
