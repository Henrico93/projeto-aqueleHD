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
  <svg width="140" height="66" viewBox="0 0 140 66" fill="none">
    {/* base arredondada (parte debaixo do pão de cima) */}
    <ellipse cx="70" cy="55" rx="64" ry="14" fill="#A0611A" />
    {/* corpo do pão */}
    <ellipse cx="70" cy="38" rx="64" ry="30" fill="#C8822A" />
    {/* camada mais clara */}
    <ellipse cx="70" cy="32" rx="58" ry="25" fill="#D8924A" />
    {/* gergelim */}
    <ellipse cx="44" cy="22" rx="5.5" ry="3"  fill="#E8B870" transform="rotate(-20 44 22)"/>
    <ellipse cx="70" cy="17" rx="5.5" ry="3"  fill="#E8B870"/>
    <ellipse cx="96" cy="22" rx="5.5" ry="3"  fill="#E8B870" transform="rotate(20 96 22)"/>
    <ellipse cx="57" cy="31" rx="4"   ry="2.5" fill="#E8B870" transform="rotate(-10 57 31)"/>
    <ellipse cx="83" cy="31" rx="4"   ry="2.5" fill="#E8B870" transform="rotate(10 83 31)"/>
    {/* brilho */}
    <ellipse cx="52" cy="20" rx="22" ry="8" fill="rgba(255,220,140,0.18)"/>
  </svg>
)

const PaoBaixo = () => (
  <svg width="140" height="36" viewBox="0 0 140 36" fill="none">
    {/* fundo */}
    <ellipse cx="70" cy="26" rx="64" ry="18" fill="#A0611A" />
    {/* superfície */}
    <ellipse cx="70" cy="18" rx="62" ry="14" fill="#C8822A" />
    {/* parte interna mais clara (miolo) */}
    <ellipse cx="70" cy="13" rx="54" ry="9" fill="#E8A850" />
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
              bottom="52px"
              left="50%"
              marginLeft="-55px"
              zIndex={10}
              animate={{
                y:      [0, 0, -10, -160, -160, -160, -10, 0, 0],
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
              bottom="72px"
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
