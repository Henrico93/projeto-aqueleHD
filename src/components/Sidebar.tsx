import {
  Box,
  VStack,
  Icon,
  Tooltip,
  Avatar,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Text,
  Button,
} from "@chakra-ui/react"
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom"
import {
  FiFileText,
  FiDollarSign,
  FiShoppingCart,
  FiMonitor,
  FiPackage,
  FiBarChart2,
  FiUsers,
  FiLogOut,
  FiClock,
} from "react-icons/fi"
import { motion } from "framer-motion"
import { useData } from "../context/DataContext"

const MotionBox = motion(Box)

interface SidebarProps {
  isMenuOpen: boolean
  onMenuOpen: () => void
  onMenuClose: () => void
}

const Sidebar = ({ isMenuOpen, onMenuClose }: SidebarProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout } = useData()

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/")

  const handleLogout = () => {
    logout()
    navigate("/login")
    onMenuClose()
  }

  const navItems = [
    { path: "/", icon: FiMonitor, label: "Dashboard", requiredPerm: "none" },
    { path: "/pedidos", icon: FiFileText, label: "Comandas", requiredPerm: "pedidos" },
    { path: "/novo-pedido", icon: FiDollarSign, label: "Novo Pedido", requiredPerm: "pedidos" },
    { path: "/estoque", icon: FiPackage, label: "Estoque", requiredPerm: "estoque" },
    { path: "/produtos", icon: FiShoppingCart, label: "Produtos", requiredPerm: "produtos" },
    { path: "/relatorios", icon: FiBarChart2, label: "Relatórios", requiredPerm: "relatorios" },
    { path: "/historico", icon: FiClock, label: "Histórico", requiredPerm: "pedidos" },
  ].filter((item) => {
    if (item.requiredPerm === "none" || currentUser?.role === "admin") return true
    return currentUser?.permissoes?.includes(item.requiredPerm)
  })

  if (currentUser?.role === "admin") {
    navItems.push({ path: "/equipe", icon: FiUsers, label: "Equipe", requiredPerm: "admin" })
  }

  return (
    <>
      {/* ── Desktop sidebar (md+) ── */}
      <Box
        display={{ base: "none", md: "flex" }}
        bg="brand.surface"
        w="80px"
        h="100vh"
        borderRight="1px solid"
        borderColor="brand.surfaceborder"
        backdropFilter="blur(16px)"
        boxShadow="4px 0 24px rgba(0, 0, 0, 0.4)"
        zIndex={11}
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
                  border="1px solid"
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

      {/* ── Mobile Drawer (< md) ── */}
      <Drawer isOpen={isMenuOpen} onClose={onMenuClose} placement="left" size="xs">
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent bg="brand.surface" borderRight="1px solid" borderColor="brand.surfaceborder">
          <DrawerCloseButton color="white" top={4} right={4} />

          <DrawerHeader borderBottomWidth="1px" borderColor="brand.surfaceborder" pb={4}>
            <Text
              fontFamily="'Bubblegum Sans', cursive"
              fontSize="2xl"
              bgGradient="linear(to-r, brand.primary, brand.secondary)"
              bgClip="text"
              letterSpacing="wide"
            >
              🌭 Aquele Hot Dogs
            </Text>
          </DrawerHeader>

          <DrawerBody py={4} px={3}>
            <VStack spacing={1} align="stretch">
              {navItems.map((item) => {
                const active = isActive(item.path) && (item.path !== "/" || location.pathname === "/")
                return (
                  <Box
                    key={item.path}
                    as={RouterLink}
                    to={item.path}
                    onClick={onMenuClose}
                    display="flex"
                    alignItems="center"
                    gap={3}
                    px={4}
                    py={3}
                    borderRadius="xl"
                    bg={active ? "rgba(255,107,0,0.15)" : "transparent"}
                    color={active ? "brand.primary" : "whiteAlpha.800"}
                    border="1px solid"
                    borderColor={active ? "rgba(255,107,0,0.4)" : "transparent"}
                    _hover={{ bg: "whiteAlpha.100", color: "brand.primary", textDecoration: "none" }}
                    transition="all 0.2s"
                  >
                    <Icon as={item.icon} boxSize={5} />
                    <Text fontWeight={active ? "bold" : "medium"} fontSize="md">
                      {item.label}
                    </Text>
                    {active && (
                      <Box
                        ml="auto"
                        w="6px"
                        h="6px"
                        borderRadius="full"
                        bg="brand.primary"
                      />
                    )}
                  </Box>
                )
              })}
            </VStack>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px" borderColor="brand.surfaceborder" flexDir="column" gap={3} pb={6}>
            <Flex align="center" gap={3} w="100%">
              <Avatar size="sm" name={currentUser?.nome} bg="brand.primary" color="white" />
              <Box flex={1} minW={0}>
                <Text color="white" fontSize="sm" fontWeight="bold" noOfLines={1}>
                  {currentUser?.nome}
                </Text>
                <Text color="gray.400" fontSize="xs">
                  {currentUser?.role === "admin" ? "Administrador" : "Funcionário"}
                </Text>
              </Box>
            </Flex>
            <Button
              leftIcon={<FiLogOut />}
              variant="outline"
              colorScheme="red"
              color="red.400"
              borderColor="red.400"
              size="sm"
              w="100%"
              onClick={handleLogout}
              _hover={{ bg: "red.900" }}
            >
              Sair do Sistema
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default Sidebar
