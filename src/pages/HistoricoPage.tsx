import { useState, useMemo } from "react"
import {
  Box,
  Heading,
  VStack,
  Text,
  Badge,
  Input,
  Select,
  Flex,
  Icon,
  Divider,
  InputGroup,
  InputLeftElement,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react"
import { FiSearch, FiShoppingBag, FiDollarSign, FiClock } from "react-icons/fi"
import { motion } from "framer-motion"
import { useData } from "../context/DataContext"

const MotionBox = motion(Box)

const statusConfig: Record<string, { label: string; color: string }> = {
  pago: { label: "Pago", color: "green" },
  fechado: { label: "Fechado", color: "orange" },
  aberto: { label: "Aberto", color: "blue" },
  cancelado: { label: "Cancelado", color: "red" },
}

const metodoPagamentoLabel: Record<string, string> = {
  pix: "PIX",
  dinheiro: "Dinheiro",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
}

const HistoricoPage = () => {
  const { pedidos } = useData()
  const [busca, setBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("")

  const pedidosFiltrados = useMemo(() => {
    return [...pedidos]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .filter((p) => {
        const matchBusca =
          !busca ||
          p.cliente.toLowerCase().includes(busca.toLowerCase()) ||
          String(p.id).includes(busca)
        const matchStatus = !filtroStatus || p.status === filtroStatus
        return matchBusca && matchStatus
      })
  }, [pedidos, busca, filtroStatus])

  const totalPago = pedidosFiltrados
    .filter((p) => p.status === "pago")
    .reduce((sum, p) => sum + p.itens.reduce((s, i) => s + i.preco * i.quantidade, 0), 0)

  const qtdPago = pedidosFiltrados.filter((p) => p.status === "pago").length

  return (
    <Box p={{ base: 3, md: 6 }} maxW="900px" mx="auto" w="100%">
      <Heading size="lg" color="white" mb={1}>
        Histórico de Comandas
      </Heading>
      <Text color="gray.400" mb={6}>
        Todas as comandas registradas no sistema
      </Text>

      {/* Filtros */}
      <Flex gap={3} mb={6} flexWrap="wrap" direction={{ base: "column", md: "row" }}>
        <InputGroup maxW={{ base: "100%", md: "300px" }} w="100%">
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Buscar por cliente ou #comanda"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            bg="brand.surface"
            border="1px solid"
            borderColor="whiteAlpha.200"
            color="white"
            _placeholder={{ color: "gray.500" }}
            _focus={{ borderColor: "brand.primary" }}
          />
        </InputGroup>

        <Select
          maxW={{ base: "100%", md: "200px" }}
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          bg="brand.surface"
          border="1px solid"
          borderColor="whiteAlpha.200"
          color="white"
          _focus={{ borderColor: "brand.primary" }}
        >
          <option value="" style={{ background: "#16213e" }}>Todos os status</option>
          <option value="pago" style={{ background: "#16213e" }}>Pago</option>
          <option value="fechado" style={{ background: "#16213e" }}>Fechado</option>
          <option value="aberto" style={{ background: "#16213e" }}>Aberto</option>
        </Select>
      </Flex>

      {/* Cards de resumo */}
      <Flex gap={4} mb={6} direction={{ base: "column", md: "row" }}>
        <Box
          bg="brand.surface"
          p={4}
          borderRadius="xl"
          border="1px solid"
          borderColor="whiteAlpha.100"
          flex={1}
        >
          <Flex align="center" gap={3} mb={1}>
            <Icon as={FiShoppingBag} color="brand.primary" />
            <Text color="gray.400" fontSize="sm">Comandas encontradas</Text>
          </Flex>
          <Text color="white" fontSize="2xl" fontWeight="bold">
            {pedidosFiltrados.length}
          </Text>
        </Box>

        <Box
          bg="brand.surface"
          p={4}
          borderRadius="xl"
          border="1px solid"
          borderColor="whiteAlpha.100"
          flex={1}
        >
          <Flex align="center" gap={3} mb={1}>
            <Icon as={FiDollarSign} color="brand.secondary" />
            <Text color="gray.400" fontSize="sm">Total arrecadado ({qtdPago} pagas)</Text>
          </Flex>
          <Text color="brand.primary" fontSize="2xl" fontWeight="bold">
            R$ {totalPago.toFixed(2)}
          </Text>
        </Box>
      </Flex>

      {/* Lista de comandas */}
      {pedidosFiltrados.length === 0 ? (
        <Flex align="center" justify="center" py={16} flexDir="column" gap={3}>
          <Icon as={FiClock} color="gray.600" boxSize={10} />
          <Text color="gray.500">Nenhuma comanda encontrada</Text>
        </Flex>
      ) : (
        <Accordion allowMultiple>
          <VStack spacing={2} align="stretch">
            {pedidosFiltrados.map((pedido, idx) => {
              const total = pedido.itens.reduce((s, i) => s + i.preco * i.quantidade, 0)
              const cfg = statusConfig[pedido.status] ?? { label: pedido.status, color: "gray" }
              const data = pedido.timestamp ? new Date(pedido.timestamp).toLocaleString("pt-BR") : "—"

              return (
                <MotionBox
                  key={pedido.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                >
                  <AccordionItem
                    border="1px solid"
                    borderColor="whiteAlpha.100"
                    borderRadius="xl"
                    overflow="hidden"
                  >
                    <AccordionButton
                      bg="brand.surface"
                      _hover={{ bg: "whiteAlpha.50" }}
                      p={4}
                      _expanded={{ bg: "whiteAlpha.50" }}
                    >
                      <Flex flex={1} align="center" gap={3} flexWrap="wrap" textAlign="left">
                        <Text color="brand.primary" fontWeight="bold" minW="55px" fontSize="sm">
                          #{pedido.id}
                        </Text>
                        <Text color="white" fontWeight="semibold" flex={1}>
                          {pedido.cliente}
                        </Text>
                        {pedido.mesa && (
                          <Text color="gray.500" fontSize="xs">
                            Mesa {pedido.mesa}
                          </Text>
                        )}
                        <Badge colorScheme={cfg.color} borderRadius="full" px={2}>
                          {cfg.label}
                        </Badge>
                        <Text color="brand.secondary" fontWeight="bold">
                          R$ {total.toFixed(2)}
                        </Text>
                        <Text color="gray.500" fontSize="xs">
                          {data}
                        </Text>
                      </Flex>
                      <AccordionIcon color="gray.400" ml={2} />
                    </AccordionButton>

                    <AccordionPanel bg="rgba(255,255,255,0.03)" p={4}>
                      <VStack align="stretch" spacing={2}>
                        <Text color="gray.400" fontSize="xs" textTransform="uppercase" letterSpacing="wider" mb={1}>
                          Itens
                        </Text>
                        {pedido.itens.map((item, i) => (
                          <Flex key={i} justify="space-between" align="center">
                            <Text color="gray.300" fontSize="sm">
                              {item.quantidade}x {item.nome}
                            </Text>
                            <Text color="gray.400" fontSize="sm">
                              R$ {(item.preco * item.quantidade).toFixed(2)}
                            </Text>
                          </Flex>
                        ))}

                        <Divider borderColor="whiteAlpha.100" my={2} />

                        {pedido.formaPagamento && (
                          <Flex justify="space-between" align="center">
                            <Text color="gray.400" fontSize="sm">Forma de pagamento</Text>
                            <Text color="white" fontSize="sm">
                              {metodoPagamentoLabel[pedido.formaPagamento] ?? pedido.formaPagamento}
                            </Text>
                          </Flex>
                        )}

                        {pedido.troco != null && pedido.troco > 0 && (
                          <Flex justify="space-between" align="center">
                            <Text color="gray.400" fontSize="sm">Troco</Text>
                            <Text color="green.300" fontSize="sm">R$ {pedido.troco.toFixed(2)}</Text>
                          </Flex>
                        )}

                        <Flex justify="space-between" align="center" mt={1}>
                          <Text color="white" fontWeight="bold">Total</Text>
                          <Text color="brand.primary" fontWeight="bold" fontSize="lg">
                            R$ {total.toFixed(2)}
                          </Text>
                        </Flex>
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                </MotionBox>
              )
            })}
          </VStack>
        </Accordion>
      )}
    </Box>
  )
}

export default HistoricoPage
