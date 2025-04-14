import { Box, Heading, Text, Button, Flex } from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"

const HomePage = () => {
  return (
    <Box maxW="1200px" mx="auto" p={5}>
      <Flex direction="column" align="center" justify="center" h="70vh" textAlign="center">
        <Heading mb={6} size="2xl" color="brand.secondary">
          Bem-vindo ao Sistema Aquele Hot Dogs
        </Heading>
        <Text fontSize="xl" mb={8} color="whiteAlpha.800">
          Gerencie seus pedidos, vendas e estoque em um só lugar
        </Text>
        <Flex gap={4}>
          <Button as={RouterLink} to="/pedidos" variant="primary" size="lg">
            Ver Pedidos
          </Button>
          <Button as={RouterLink} to="/novo-pedido" variant="primary" size="lg">
            Novo Pedido
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}

export default HomePage
