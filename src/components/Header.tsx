import { Box, Heading } from "@chakra-ui/react"

const Header = () => {
  return (
    <Box bg="#C25B02" p={4} w="100%" textAlign="center">
      <Heading
        as="h1"
        fontSize="2xl"
        fontFamily="'Bubblegum Sans', cursive"
        letterSpacing="wider"
        color="#E6B325"
        textShadow="1px 1px 2px rgba(0,0,0,0.5)"
      >
        Aquele Hot dogs
      </Heading>
    </Box>
  )
}

export default Header
