import { Box, Heading, Flex, Avatar, IconButton } from "@chakra-ui/react"
import { FiBell, FiSettings, FiMenu } from "react-icons/fi"
import { useData } from "../context/DataContext"

interface HeaderProps {
  onMenuOpen?: () => void
}

const Header = ({ onMenuOpen }: HeaderProps) => {
  const { currentUser } = useData()

  return (
    <Box
      as="header"
      w="100%"
      px={{ base: 4, md: 8 }}
      py={{ base: 3, md: 4 }}
      bg="brand.surface"
      backdropFilter="blur(16px)"
      sx={{ WebkitBackdropFilter: "blur(16px)" }}
      borderBottom="1px solid"
      borderColor="brand.surfaceborder"
      position="sticky"
      top={0}
      zIndex={10}
      boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
    >
      <Flex justify="space-between" align="center" gap={2}>
        <Flex align="center" gap={2}>
          <IconButton
            display={{ base: "flex", md: "none" }}
            aria-label="Abrir menu"
            icon={<FiMenu />}
            variant="ghost"
            color="white"
            size="sm"
            onClick={onMenuOpen}
            _hover={{ bg: "whiteAlpha.200" }}
          />
          <Heading
            as="h1"
            fontSize={{ base: "xl", md: "3xl" }}
            fontFamily="'Bubblegum Sans', cursive"
            letterSpacing="wider"
            bgGradient="linear(to-r, brand.primary, brand.secondary)"
            bgClip="text"
            textShadow="0 0 20px rgba(255, 107, 0, 0.2)"
          >
            Aquele Hot Dogs
          </Heading>
        </Flex>

        <Flex align="center" gap={{ base: 1, md: 4 }}>
          <IconButton
            display={{ base: "none", md: "flex" }}
            aria-label="Notificações"
            icon={<FiBell />}
            variant="ghost"
            color="brand.light"
            _hover={{ bg: "whiteAlpha.200", color: "brand.primary" }}
            isRound
          />
          <IconButton
            display={{ base: "none", md: "flex" }}
            aria-label="Configurações"
            icon={<FiSettings />}
            variant="ghost"
            color="brand.light"
            _hover={{ bg: "whiteAlpha.200", color: "brand.primary" }}
            isRound
          />
          <Avatar
            size="sm"
            name={currentUser?.nome ?? "User"}
            bg="brand.primary"
            border="2px solid"
            borderColor="brand.secondary"
          />
        </Flex>
      </Flex>
    </Box>
  )
}

export default Header
