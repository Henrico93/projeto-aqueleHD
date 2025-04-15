import type React from "react"
import { Flex, Spinner, Text, Box } from "@chakra-ui/react"

interface LoadingOverlayProps {
  isLoading: boolean
  error: string | null
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, error }) => {
  if (!isLoading && !error) return null

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="blackAlpha.700"
      zIndex={9999}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Flex
        direction="column"
        align="center"
        justify="center"
        bg="black"
        p={8}
        borderRadius="xl"
        borderWidth={1}
        borderColor="#E6B325"
        maxW="400px"
        w="90%"
      >
        {isLoading && (
          <>
            <Spinner size="xl" color="#E6B325" thickness="4px" mb={4} />
            <Text color="white" fontSize="lg">
              Carregando dados...
            </Text>
          </>
        )}

        {error && (
          <>
            <Box color="red.500" fontSize="3xl" mb={4}>
              ⚠️
            </Box>
            <Text color="white" fontSize="lg" textAlign="center">
              Erro ao conectar com o servidor
            </Text>
            <Text color="whiteAlpha.700" fontSize="sm" mt={2} textAlign="center">
              {error}
            </Text>
            <Text color="whiteAlpha.600" fontSize="xs" mt={4} textAlign="center">
              Usando dados locais como fallback
            </Text>
          </>
        )}
      </Flex>
    </Box>
  )
}

export default LoadingOverlay
