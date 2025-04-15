import { Box, VStack, Icon, Tooltip } from "@chakra-ui/react"
import { Link as RouterLink, useLocation } from "react-router-dom"
import { FiFileText, FiDollarSign, FiShoppingCart, FiMonitor, FiPackage, FiBarChart2 } from "react-icons/fi"

const Sidebar = () => {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  return (
    <Box bg="black" w="80px" h="100vh" borderRight="1px solid" borderColor="whiteAlpha.300">
      <VStack spacing={8} align="center" pt={8}>
        <Tooltip label="Comandas" placement="right">
          <Box
            as={RouterLink}
            to="/pedidos"
            p={3}
            bg={isActive("/pedidos") ? "whiteAlpha.200" : "transparent"}
            borderRadius="md"
            transition="all 0.2s"
          >
            <Icon as={FiFileText} color="#FFD700" boxSize={8} />
          </Box>
        </Tooltip>

        <Tooltip label="Novo Pedido" placement="right">
          <Box
            as={RouterLink}
            to="/novo-pedido"
            p={3}
            bg={isActive("/novo-pedido") ? "whiteAlpha.200" : "transparent"}
            borderRadius="md"
            transition="all 0.2s"
          >
            <Icon as={FiDollarSign} color="#FFD700" boxSize={8} />
          </Box>
        </Tooltip>

        <Tooltip label="Estoque" placement="right">
          <Box
            as={RouterLink}
            to="/estoque"
            p={3}
            bg={isActive("/estoque") ? "whiteAlpha.200" : "transparent"}
            borderRadius="md"
            transition="all 0.2s"
          >
            <Icon as={FiPackage} color="#FFD700" boxSize={8} />
          </Box>
        </Tooltip>

        <Tooltip label="Produtos" placement="right">
          <Box
            as={RouterLink}
            to="/produtos"
            p={3}
            bg={isActive("/produtos") ? "whiteAlpha.200" : "transparent"}
            borderRadius="md"
            transition="all 0.2s"
          >
            <Icon as={FiShoppingCart} color="#FFD700" boxSize={8} />
          </Box>
        </Tooltip>

        <Tooltip label="Relatórios" placement="right">
          <Box
            as={RouterLink}
            to="/relatorios"
            p={3}
            bg={isActive("/relatorios") ? "whiteAlpha.200" : "transparent"}
            borderRadius="md"
            transition="all 0.2s"
          >
            <Icon as={FiBarChart2} color="#FFD700" boxSize={8} />
          </Box>
        </Tooltip>

        <Tooltip label="Dashboard" placement="right">
          <Box
            as={RouterLink}
            to="/"
            p={3}
            bg={isActive("/") && location.pathname === "/" ? "whiteAlpha.200" : "transparent"}
            borderRadius="md"
            transition="all 0.2s"
          >
            <Icon as={FiMonitor} color="#FFD700" boxSize={8} />
          </Box>
        </Tooltip>
      </VStack>
    </Box>
  )
}

export default Sidebar
