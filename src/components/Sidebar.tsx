import { Box, VStack, Icon, Tooltip } from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"
import { FiFileText, FiDollarSign, FiShoppingCart, FiMonitor } from "react-icons/fi"

const Sidebar = () => {
  return (
    <Box bg="black" w="80px" h="100vh" borderRight="1px solid" borderColor="whiteAlpha.300">
      <VStack spacing={8} align="center" pt={8}>
        <Tooltip label="Comandas" placement="right">
          <Box as={RouterLink} to="/pedidos" p={3}>
            <Icon as={FiFileText} color="#FFD700" boxSize={8} />
          </Box>
        </Tooltip>

        <Tooltip label="Pagamentos" placement="right">
          <Box as={RouterLink} to="/pagamento" p={3}>
            <Icon as={FiDollarSign} color="#FFD700" boxSize={8} />
          </Box>
        </Tooltip>

        <Tooltip label="Produtos" placement="right">
          <Box as={RouterLink} to="/produtos" p={3}>
            <Icon as={FiShoppingCart} color="#FFD700" boxSize={8} />
          </Box>
        </Tooltip>

        <Tooltip label="Dashboard" placement="right">
          <Box as={RouterLink} to="/" p={3}>
            <Icon as={FiMonitor} color="#FFD700" boxSize={8} />
          </Box>
        </Tooltip>
      </VStack>
    </Box>
  )
}

export default Sidebar
