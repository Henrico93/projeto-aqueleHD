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

// Um lado do pão de hot dog — alongado, igual para os dois lados
const PaoMetade = () => (
  <svg width="132" height="30" viewBox="0 0 132 30" fill="none">
    {/* espessura inferior (profundidade) */}
    <rect x="4" y="16" width="124" height="13" rx="6" fill="#7A3E0E" />
    {/* crosta */}
    <rect x="4" y="4"  width="124" height="19" rx="9" fill="#B86820" />
    {/* miolo (face cortada interna) */}
    <rect x="9" y="4"  width="114" height="13" rx="7" fill="#E8A040" />
    {/* brilho */}
    <ellipse cx="66" cy="9" rx="40" ry="4" fill="rgba(255,215,140,0.22)" />
  </svg>
)

// ── Loading dots ─────────────────────────────────────────────────────────────

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

          {/*
            Palco — perspectiva 3D de um hot dog aberto:
              Pão de trás  (z=1)  — atrás da salsicha, deslocado 14px à direita e 18px acima do pão da frente
              Salsicha     (z=10) — no meio, salta e gira
              Pão da frente(z=20) — na frente da salsicha, cobre a borda inferior
          */}
          <Box position="relative" w="200px" h="200px">

            {/* Pão de trás: deslocado +14px à direita e mais alto → ilusão de 3D */}
            <MotionBox
              position="absolute"
              bottom="46px"
              left="50%"
              marginLeft="-52px"   /* -66 + 14px de offset à direita */
              zIndex={1}
              animate={{ y: [0, 0, -7, -7, -7, -7, -7, 0, 0] }}
              transition={{
                duration: 2.4,
                times:    [0, 0.08, 0.18, 0.38, 0.52, 0.66, 0.82, 0.92, 1],
                repeat: Infinity,
                repeatDelay: 0.6,
                ease: "easeInOut",
              }}
            >
              <PaoMetade />
            </MotionBox>

            {/* Salsicha: centro, salta e dá cambalhota */}
            <MotionBox
              position="absolute"
              bottom="26px"
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

            {/* Pão da frente: centralizado, cobre a borda inferior da salsicha */}
            <Box
              position="absolute"
              bottom="8px"
              left="50%"
              marginLeft="-66px"
              zIndex={20}
            >
              <PaoMetade />
            </Box>
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
