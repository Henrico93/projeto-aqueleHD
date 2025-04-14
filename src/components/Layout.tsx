import type React from "react"
import { Box, Flex } from "@chakra-ui/react"
import Sidebar from "./Sidebar"
import Header from "./Header"

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Flex h="100vh" w="100%">
      <Sidebar />
      <Flex direction="column" flex="1">
        <Header />
        <Box flex="1" bg="#E6B325" p={4} overflowY="auto">
          {children}
        </Box>
      </Flex>
    </Flex>
  )
}

export default Layout
