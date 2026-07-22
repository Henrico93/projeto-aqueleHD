import { Box, Heading, Flex, Avatar, IconButton } from "@chakra-ui/react"
import { FiBell, FiSettings } from "react-icons/fi"

const Header = () => {
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
        
        <Flex align="center" gap={{ base: 1, md: 4 }}>
          <IconButton
            aria-label="Notifications"
            icon={<FiBell />}
            variant="ghost"
            color="brand.light"
            _hover={{ bg: "whiteAlpha.200", color: "brand.primary" }}
            isRound
          />
          <IconButton
            aria-label="Settings"
            icon={<FiSettings />}
            variant="ghost"
            color="brand.light"
            _hover={{ bg: "whiteAlpha.200", color: "brand.primary" }}
            isRound
          />
          <Avatar size="sm" name="Admin" bg="brand.primary" border="2px solid" borderColor="brand.secondary" />
        </Flex>
      </Flex>
    </Box>
  )
}

export default Header
