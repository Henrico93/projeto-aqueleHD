import type React from "react"
import { Box, Flex, useDisclosure } from "@chakra-ui/react"
import { motion, AnimatePresence } from "framer-motion"
import { useLocation } from "react-router-dom"
import Sidebar from "./Sidebar"
import Header from "./Header"

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Flex h="100vh" w="100%" overflow="hidden">
      <Sidebar isMenuOpen={isOpen} onMenuOpen={onOpen} onMenuClose={onClose} />
      <Flex direction="column" flex="1" h="100vh" minW={0}>
        <Header onMenuOpen={onOpen} />
        <Box
          flex="1"
          p={{ base: 3, md: 6 }}
          pb={{ base: 6, md: 6 }}
          overflowY="auto"
          position="relative"
        >
          <AnimatePresence mode="sync">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ minHeight: "100%" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Flex>
    </Flex>
  )
}

export default Layout
