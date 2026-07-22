import { Box, Flex, Text } from "@chakra-ui/react"
import { motion, AnimatePresence } from "framer-motion"

const MotionBox = motion(Box)

// ── SVGs ────────────────────────────────────────────────────────────────────

const Salsicha = () => (
  <svg width="110" height="38" viewBox="0 0 110 38" fill="none">
    {/* corpo */}
    <rect x="19" y="4" width="72" height="30" rx="15" fill="#C8564E" />
    {/* tampo esquerdo */}
    <ellipse cx="19" cy="19" rx="15" ry="15" fill="#B0423A" />
    {/* tampo direito */}
    <ellipse cx="91" cy="19" rx="15" ry="15" fill="#B0423A" />
    {/* brilho topo */}
    <ellipse cx="55" cy="11" rx="28" ry="6" fill="rgba(255,255,255,0.18)" />
    {/* marcas de grelha */}
    <line x1="42" y1="7"  x2="40" y2="31" stroke="rgba(100,30,20,0.35)" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="57" y1="5"  x2="55" y2="33" stroke="rgba(100,30,20,0.35)" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="72" y1="7"  x2="70" y2="31" stroke="rgba(100,30,20,0.35)" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
)

const PaoCima = () => (
  <svg width="128" height="54" viewBox="0 0 128 54" fill="none">
    {/* sombra base */}
    <rect x="4" y="40" width="120" height="10" rx="5" fill="#7A3E0E" />
    {/* arco do pão — forma alongada de hot dog */}
    <path d="M6 42 Q6 4 64 3 Q122 4 122 42 Z" fill="#B86820" />
    {/* camada mais clara no topo */}
    <path d="M14 42 Q14 11 64 10 Q114 11 114 42 Z" fill="#D8873A" />
    {/* brilho lateral esquerdo */}
    <ellipse cx="40" cy="20" rx="16" ry="7" fill="rgba(255,215,120,0.16)" />
    {/* gergelim */}
    <ellipse cx="38" cy="24" rx="5" ry="2.8" fill="#E8B870" transform="rotate(-18 38 24)" />
    <ellipse cx="64" cy="18" rx="5" ry="2.8" fill="#E8B870" />
    <ellipse cx="90" cy="24" rx="5" ry="2.8" fill="#E8B870" transform="rotate(18 90 24)" />
    <ellipse cx="51" cy="32" rx="4"  ry="2.2" fill="#E8B870" transform="rotate(-8 51 32)" />
    <ellipse cx="77" cy="32" rx="4"  ry="2.2" fill="#E8B870" transform="rotate(8 77 32)" />
  </svg>
)

const PaoBaixo = () => (
  <svg width="128" height="28" viewBox="0 0 128 28" fill="none">
    {/* fundo escuro */}
    <rect x="4" y="10" width="120" height="16" rx="8" fill="#7A3E0E" />
    {/* corpo do pão */}
    <rect x="4" y="6" width="120" height="16" rx="8" fill="#B86820" />
    {/* miolo (interior mais claro) */}
    <rect x="10" y="6" width="108" height="10" rx="6" fill="#E8A040" />
    {/* brilho */}
    <ellipse cx="64" cy="9" rx="34" ry="4" fill="rgba(255,215,120,0.18)" />
  </svg>
)

// ── Animação de ponto de loading ─────────────────────────────────────────────

const Dot = ({ delay }: { delay: number }) => (
  <MotionBox
    w="9px"
    h="9px"
    borderRadius="full"
    bg="#FF6B00"
    animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 0.9, delay, repeat: Infinity, ease: "easeInOut" }}
  />
)

// ── Componente principal ──────────────────────────────────────────────────────

interface SplashScreenProps {
  isVisible: boolean
}

const SplashScreen = ({ isVisible }: SplashScreenProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <MotionBox
          position="fixed"
          inset={0}
          zIndex={99999}
          bg="#080818"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={8}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          {/* Brilho de fundo */}
          <Box
            position="absolute"
            w="400px"
            h="400px"
            borderRadius="full"
            bg="radial-gradient(circle, rgba(255,107,0,0.12) 0%, transparent 70%)"
            pointerEvents="none"
          />

          {/* Palco da animação */}
          <Box position="relative" w="160px" h="200px">

            {/* Pão de baixo — estático */}
            <Box
              position="absolute"
              bottom={0}
              left="50%"
              transform="translateX(-50%)"
            >
              <PaoBaixo />
            </Box>

            {/* Salsicha — animada */}
            <MotionBox
              position="absolute"
              bottom="44px"
              left="50%"
              marginLeft="-55px"
              zIndex={10}
              animate={{
                y:      [0, 0, -10, -155, -155, -155, -10, 0, 0],
                rotate: [0, 0,   0,    0,  180,  360,  360, 360, 0],
                scaleX: [1, 1,  0.85,  1,    1,    1,   1, 0.85, 1],
                scaleY: [1, 1,  1.15,  1,    1,    1,   1, 1.15, 1],
              }}
              transition={{
                duration: 2.4,
                times:    [0, 0.08, 0.18, 0.38, 0.52, 0.66, 0.82, 0.92, 1],
                repeat: Infinity,
                repeatDelay: 0.6,
                ease: "easeInOut",
              }}
            >
              <Salsicha />
            </MotionBox>

            {/* Pão de cima — flutua levemente quando a salsicha sai */}
            <MotionBox
              position="absolute"
              bottom="60px"
              left="50%"
              transform="translateX(-50%)"
              animate={{
                y: [0, 0, -8, -8, -8, -8, -8, 0, 0],
              }}
              transition={{
                duration: 2.4,
                times:    [0, 0.08, 0.18, 0.38, 0.52, 0.66, 0.82, 0.92, 1],
                repeat: Infinity,
                repeatDelay: 0.6,
                ease: "easeInOut",
              }}
            >
              <PaoCima />
            </MotionBox>
          </Box>

          {/* Título */}
          <Text
            fontFamily="'Bubblegum Sans', cursive"
            fontSize={{ base: "2xl", md: "3xl" }}
            bgGradient="linear(to-r, #FF6B00, #FFD700)"
            bgClip="text"
            letterSpacing="widest"
            textAlign="center"
          >
            Aquele Hot Dogs
          </Text>

          {/* Dots de carregamento */}
          <Flex gap={3} align="center">
            <Dot delay={0} />
            <Dot delay={0.15} />
            <Dot delay={0.30} />
          </Flex>
        </MotionBox>
      )}
    </AnimatePresence>
  )
}

export default SplashScreen
