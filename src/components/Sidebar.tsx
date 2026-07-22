import { Box, VStack, Icon, Tooltip, Avatar, IconButton } from "@chakra-ui/react"
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom"
import { FiFileText, FiDollarSign, FiShoppingCart, FiMonitor, FiPackage, FiBarChart2, FiUsers, FiLogOut, FiClock } from "react-icons/fi"
import { motion } from "framer-motion"

import { useData } from "../context/DataContext"

const MotionBox = motion(Box)

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout } = useData()

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Filter items based on permissions
  const navItems = [
    { path: "/", icon: FiMonitor, label: "Dashboard", requiredPerm: "none" },
    { path: "/pedidos", icon: FiFileText, label: "Comandas", requiredPerm: "pedidos" },
    { path: "/novo-pedido", icon: FiDollarSign, label: "Novo Pedido", requiredPerm: "pedidos" },
    { path: "/estoque", icon: FiPackage, label: "Estoque", requiredPerm: "estoque" },
    { path: "/produtos", icon: FiShoppingCart, label: "Produtos", requiredPerm: "produtos" },
    { path: "/relatorios", icon: FiBarChart2, label: "Relatórios", requiredPerm: "relatorios" },
    { path: "/historico", icon: FiClock, label: "Histórico", requiredPerm: "pedidos" },
  ].filter(item => {
    if (item.requiredPerm === "none" || currentUser?.role === "admin") return true
    return currentUser?.permissoes?.includes(item.requiredPerm)
  })

  if (currentUser?.role === "admin") {
    navItems.push({ path: "/equipe", icon: FiUsers, label: "Equipe", requiredPerm: "admin" })
  }

  return (
    <Box
      bg="brand.surface"
      w="80px"
      h="100vh"
      borderRight="1px solid"
      borderColor="brand.surfaceborder"
      backdropFilter="blur(16px)"
      boxShadow="4px 0 24px rgba(0, 0, 0, 0.4)"
      zIndex={11}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      pb={6}
    >
      <VStack spacing={8} align="center" pt={8}>
        {navItems.map((item, index) => {
          const active = isActive(item.path) && (item.path !== "/" || location.pathname === "/")
          return (
            <Tooltip key={item.path} label={item.label} placement="right" hasArrow bg="brand.primary" color="white">
              <MotionBox
                as={RouterLink}
                to={item.path}
                p={3}
                bg={active ? "rgba(255, 107, 0, 0.2)" : "transparent"}
                borderRadius="xl"
                border={active ? "1px solid" : "1px solid"}
                borderColor={active ? "brand.primary" : "transparent"}
                color={active ? "brand.secondary" : "whiteAlpha.700"}
                whileHover={{ scale: 1.15, rotate: 5, color: "#FFD700" }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                boxShadow={active ? "0 0 15px rgba(255, 107, 0, 0.3)" : "none"}
              >
                <Icon as={item.icon} boxSize={7} />
              </MotionBox>
            </Tooltip>
          )
        })}
      </VStack>

      <VStack spacing={4}>
        <Tooltip label={currentUser?.nome} placement="right" hasArrow bg="brand.surface" color="white">
          <Avatar size="sm" name={currentUser?.nome} bg="brand.primary" color="white" cursor="pointer" />
        </Tooltip>
        <Tooltip label="Sair do Sistema" placement="right" hasArrow bg="red.500" color="white">
          <IconButton 
            aria-label="Logout" 
            icon={<FiLogOut />} 
            variant="ghost" 
            colorScheme="red" 
            color="red.400"
            onClick={handleLogout}
            _hover={{ bg: "whiteAlpha.100" }}
          />
        </Tooltip>
      </VStack>
    </Box>
  )
}

export default Sidebar
