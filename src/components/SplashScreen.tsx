import { Box, Flex, Text } from "@chakra-ui/react"
import { motion, AnimatePresence } from "framer-motion"

const MotionBox = motion(Box)

// ── SVGs ────────────────────────────────────────────────────────────────────

const Salsicha = () => (
  <svg width="110" height="32" viewBox="0 0 110 32" fill="none">
    <rect x="17" y="1" width="76" height="30" rx="15" fill="#C8564E" />
    <ellipse cx="17" cy="16" rx="15" ry="15" fill="#B0423A" />
    <ellipse cx="93" cy="16" rx="15" ry="15" fill="#B0423A" />
    <ellipse cx="55" cy="9" rx="28" ry="6" fill="rgba(255,255,255,0.18)" />
    <line x1="42" y1="4"  x2="40" y2="28" stroke="rgba(100,30,20,0.35)" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="57" y1="2"  x2="55" y2="30" stroke="rgba(100,30,20,0.35)" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="72" y1="4"  x2="70" y2="28" stroke="rgba(100,30,20,0.35)" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
)

// Pão de cima: só o arco (base aberta/transparente) para a salsicha aparecer embaixo
const PaoCima = () => (
  <svg width="130" height="50" viewBox="0 0 130 50" fill="none">
    {/* sombra base */}
    <rect x="4" y="41" width="122" height="7" rx="4" fill="#7A3E0E" />
    {/* arco alongado — forma de hot dog, não de hamburguer */}
    <path d="M5 45 Q5 3 65 2 Q125 3 125 45 Z" fill="#B86820" />
    {/* camada mais clara */}
    <path d="M13 45 Q13 11 65 10 Q117 11 117 45 Z" fill="#D8873A" />
    {/* gergelim */}
    <ellipse cx="38" cy="22" rx="5"   ry="2.8" fill="#E8B870" transform="rotate(-18 38 22)" />
    <ellipse cx="65" cy="16" rx="5"   ry="2.8" fill="#E8B870" />
    <ellipse cx="92" cy="22" rx="5"   ry="2.8" fill="#E8B870" transform="rotate(18 92 22)" />
    <ellipse cx="50" cy="31" rx="4"   ry="2.2" fill="#E8B870" transform="rotate(-8 50 31)" />
    <ellipse cx="80" cy="31" rx="4"   ry="2.2" fill="#E8B870" transform="rotate(8 80 31)" />
    {/* brilho */}
    <ellipse cx="46" cy="19" rx="18" ry="7" fill="rgba(255,215,120,0.15)" />
  </svg>
)

// Pão de baixo: metade inferior do pão, cradle/canoa
const PaoBaixo = () => (
  <svg width="130" height="22" viewBox="0 0 130 22" fill="none">
    {/* sombra */}
    <rect x="4" y="12" width="122" height="9"  rx="4" fill="#7A3E0E" />
    {/* corpo */}
    <rect x="4" y="4"  width="122" height="14" rx="7" fill="#B86820" />
    {/* miolo claro */}
    <rect x="10" y="4" width="110" height="8"  rx="5" fill="#E8A040" />
    {/* brilho */}
    <ellipse cx="65" cy="7" rx="35" ry="3.5" fill="rgba(255,215,120,0.18)" />
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

          {/* Palco da animação
              z-order: PaoBaixo(1) < Salsicha(10) < PaoCima(20)
              Em repouso a salsicha fica entre os pães.
              No pulo ela sobe acima do PaoCima fisicamente (sem sobreposição). */}
          <Box position="relative" w="190px" h="200px">

            {/* Pão de baixo — z=1, base estática */}
            <Box
              position="absolute"
              bottom={0}
              left="50%"
              transform="translateX(-65px)"
              zIndex={1}
            >
              <PaoBaixo />
            </Box>

            {/* Salsicha — z=10, sobe e dá cambalhota */}
            <MotionBox
              position="absolute"
              bottom="12px"
              left="50%"
              marginLeft="-55px"
              zIndex={10}
              animate={{
                y:      [0, 0, -10, -115, -115, -115, -10, 0, 0],
                rotate: [0, 0,   0,    0,   180,  360,  360, 360, 0],
                scaleX: [1, 1, 0.85,   1,     1,    1,    1, 0.85, 1],
                scaleY: [1, 1, 1.15,   1,     1,    1,    1, 1.15, 1],
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

            {/* Pão de cima — z=20, cobre o topo da salsicha em repouso */}
            <MotionBox
              position="absolute"
              bottom="28px"
              left="50%"
              transform="translateX(-65px)"
              zIndex={20}
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
