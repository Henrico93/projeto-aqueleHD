import { Box, Flex, Text } from "@chakra-ui/react"
import { motion, AnimatePresence } from "framer-motion"

const MotionBox = motion(Box)

// ── SVGs ────────────────────────────────────────────────────────────────────

const Salsicha = () => (
  <svg width="110" height="32" viewBox="0 0 110 32" fill="none">
    <rect x="17" y="1" width="76" height="30" rx="15" fill="#C8564E" />
    <ellipse cx="17" cy="16" rx="15" ry="15" fill="#B0423A" />
    <ellipse cx="93" cy="16" rx="15" ry="15" fill="#B0423A" />
    <ellipse cx="55" cy="9"  rx="28" ry="6"  fill="rgba(255,255,255,0.18)" />
    <line x1="42" y1="4"  x2="40" y2="28" stroke="rgba(100,30,20,0.35)" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="57" y1="2"  x2="55" y2="30" stroke="rgba(100,30,20,0.35)" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="72" y1="4"  x2="70" y2="28" stroke="rgba(100,30,20,0.35)" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
)

/* Metade superior do pão — leve arco no topo, gergelim */
const PaoCima = () => (
  <svg width="130" height="32" viewBox="0 0 130 32" fill="none">
    {/* sombra base */}
    <rect x="4" y="24" width="122" height="7" rx="3" fill="#7A3E0E" />
    {/* arco principal (bem achatado — hot dog, não hamburguer) */}
    <path d="M5 27 Q5 3 65 2 Q125 3 125 27 Z" fill="#B86820" />
    {/* camada mais clara */}
    <path d="M12 27 Q12 9 65 8 Q118 9 118 27 Z" fill="#D8873A" />
    {/* gergelim */}
    <ellipse cx="38" cy="18" rx="5"   ry="2.5" fill="#E8B870" transform="rotate(-15 38 18)" />
    <ellipse cx="65" cy="13" rx="5"   ry="2.5" fill="#E8B870" />
    <ellipse cx="92" cy="18" rx="5"   ry="2.5" fill="#E8B870" transform="rotate(15 92 18)" />
    {/* brilho */}
    <ellipse cx="46" cy="13" rx="18" ry="6" fill="rgba(255,215,120,0.16)" />
  </svg>
)

/* Metade inferior do pão — plana (cradle) */
const PaoBaixo = () => (
  <svg width="130" height="18" viewBox="0 0 130 18" fill="none">
    {/* sombra */}
    <rect x="4" y="10" width="122" height="7"  rx="3" fill="#7A3E0E" />
    {/* corpo */}
    <rect x="4" y="3"  width="122" height="12" rx="6" fill="#B86820" />
    {/* miolo */}
    <rect x="9" y="3"  width="112" height="8"  rx="5" fill="#E8A040" />
    {/* brilho */}
    <ellipse cx="65" cy="7" rx="38" ry="3" fill="rgba(255,215,140,0.20)" />
  </svg>
)

// ── Loading dots ─────────────────────────────────────────────────────────────

const Dot = ({ delay }: { delay: number }) => (
  <MotionBox
    w="9px" h="9px"
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
            w="400px" h="400px"
            borderRadius="full"
            bg="radial-gradient(circle, rgba(255,107,0,0.12) 0%, transparent 70%)"
            pointerEvents="none"
          />

          {/*
            Palco:
              PaoBaixo  z=1  — atrás da salsicha (base)
              Salsicha  z=10 — no meio, salta e gira
              PaoCima   z=20 — na frente, cobre a borda superior da salsicha
            Os dois pães ficam bem próximos: gap de ~14px preenchido pela salsicha.
          */}
          <Box position="relative" w="190px" h="200px">

            {/* Metade inferior do pão */}
            <Box
              position="absolute"
              bottom="6px"
              left="50%"
              marginLeft="-65px"
              zIndex={1}
            >
              <PaoBaixo />
            </Box>

            {/* Salsicha */}
            <MotionBox
              position="absolute"
              bottom="20px"
              left="50%"
              marginLeft="-55px"
              zIndex={10}
              animate={{
                y:      [0, 0, -10, -110, -110, -110, -10, 0, 0],
                rotate: [0, 0,   0,    0,  180,  360,  360, 360, 0],
                scaleX: [1, 1, 0.85,   1,    1,    1,    1, 0.85, 1],
                scaleY: [1, 1, 1.15,   1,    1,    1,    1, 1.15, 1],
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

            {/* Metade superior do pão */}
            <MotionBox
              position="absolute"
              bottom="40px"
              left="50%"
              marginLeft="-65px"
              zIndex={20}
              animate={{ y: [0, 0, -7, -7, -7, -7, -7, 0, 0] }}
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
