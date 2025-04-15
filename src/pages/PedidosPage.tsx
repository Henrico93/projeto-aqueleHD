"use client"

import { useState, useEffect } from "react"
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Badge,
  IconButton,
  Divider,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
} from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"
import { FiEdit, FiCreditCard, FiPlus, FiTrash2, FiSearch, FiRefreshCw } from "react-icons/fi"
import { useData, type Pedido } from "../context/DataContext"

const PedidosPage = () => {
  const toast = useToast()
  const { pedidos, updatePedido, deletePedido, refreshData } = useData()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)
  const [filteredPedidos, setFilteredPedidos] = useState<Pedido[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"todos" | "aberto" | "fechado">("todos")
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    let filtered = [...pedidos]

    // Aplicar filtro de status
    if (statusFilter !== "todos") {
      filtered = filtered.filter((p) => p.status === statusFilter)
    } else {
      filtered = filtered.filter((p) => p.status === "aberto" || p.status === "fechado")
    }

    // Aplicar busca por termo
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.cliente.toLowerCase().includes(term) ||
          p.mesa.toLowerCase().includes(term) ||
          p.id.toString().includes(term),
      )
    }

    // Ordenar por timestamp (mais recente primeiro)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    setFilteredPedidos(filtered)
  }, [pedidos, searchTerm, statusFilter])

  const handlePedidoClick = (pedido: Pedido) => {
    setSelectedPedido(pedido)
    onOpen()
  }

  const fecharComanda = (id: number) => {
    const pedido = pedidos.find((p) => p.id === id)
    if (pedido) {
      updatePedido({ ...pedido, status: "fechado" })
      setSelectedPedido({ ...pedido, status: "fechado" })

      toast({
        title: "Comanda fechada",
        description: `A comanda #${id} foi fechada e está pronta para pagamento.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const reabrirComanda = (id: number) => {
    const pedido = pedidos.find((p) => p.id === id)
    if (pedido) {
      updatePedido({ ...pedido, status: "aberto" })
      setSelectedPedido({ ...pedido, status: "aberto" })

      toast({
        title: "Comanda reaberta",
        description: `A comanda #${id} foi reaberta para adicionar mais itens.`,
        status: "info",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const excluirComanda = (id: number) => {
    deletePedido(id)
    onClose()

    toast({
      title: "Comanda excluída",
      description: `A comanda #${id} foi excluída com sucesso.`,
      status: "error",
      duration: 3000,
      isClosable: true,
    })
  }

  const calcularTotal = (pedido: Pedido) => {
    return pedido.itens.reduce((total, item) => total + item.preco * item.quantidade, 0)
  }

  const formatarHora = (dateStr: Date) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshData()
      toast({
        title: "Dados atualizados",
        description: "As comandas foram sincronizadas com o servidor",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível sincronizar com o servidor",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Box maxW="1200px" mx="auto" p={4}>
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <HStack>
          <Button
            bg={statusFilter === "todos" ? "#C25B02" : "gray.700"}
            color="white"
            size="md"
            borderRadius="full"
            px={6}
            py={2}
            fontWeight="normal"
            fontSize="md"
            _hover={{ bg: statusFilter === "todos" ? "#B24A01" : "gray.600" }}
            onClick={() => setStatusFilter("todos")}
          >
            Todas
          </Button>
          <Button
            bg={statusFilter === "aberto" ? "#C25B02" : "gray.700"}
            color="white"
            size="md"
            borderRadius="full"
            px={6}
            py={2}
            fontWeight="normal"
            fontSize="md"
            _hover={{ bg: statusFilter === "aberto" ? "#B24A01" : "gray.600" }}
            onClick={() => setStatusFilter("aberto")}
          >
            Abertas
          </Button>
          <Button
            bg={statusFilter === "fechado" ? "#C25B02" : "gray.700"}
            color="white"
            size="md"
            borderRadius="full"
            px={6}
            py={2}
            fontWeight="normal"
            fontSize="md"
            _hover={{ bg: statusFilter === "fechado" ? "#B24A01" : "gray.600" }}
            onClick={() => setStatusFilter("fechado")}
          >
            Fechadas
          </Button>
        </HStack>

        <HStack>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Buscar comanda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="black"
              color="white"
              borderColor="whiteAlpha.300"
            />
          </InputGroup>

          <Button
            leftIcon={<FiRefreshCw />}
            onClick={handleRefresh}
            isLoading={isRefreshing}
            loadingText="Atualizando"
            bg="gray.700"
            color="white"
            _hover={{ bg: "gray.600" }}
          >
            Atualizar
          </Button>

          <Button
            as={RouterLink}
            to="/novo-pedido"
            bg="#C25B02"
            color="white"
            size="md"
            borderRadius="full"
            px={6}
            py={2}
            fontWeight="normal"
            fontSize="md"
            leftIcon={<FiPlus />}
            _hover={{ bg: "#B24A01" }}
          >
            Nova comanda
          </Button>
        </HStack>
      </Flex>

      <Box bg="black" borderRadius="xl" p={4} overflow="hidden">
        {isRefreshing ? (
          <Flex justify="center" align="center" py={10}>
            <Spinner color="#E6B325" size="xl" />
          </Flex>
        ) : (
          <VStack spacing={1} align="stretch">
            {filteredPedidos.length > 0 ? (
              filteredPedidos.map((pedido) => (
                <Box
                  key={pedido.id}
                  bg="#E6B325"
                  p={3}
                  cursor="pointer"
                  onClick={() => handlePedidoClick(pedido)}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  _hover={{ bg: "#D6A315" }}
                  transition="background 0.2s"
                >
                  <Flex align="center" width="100%">
                    <Box width="100px" pl={2}>
                      <Text fontWeight="medium" color="black">
                        Comanda #{pedido.id}
                      </Text>
                      <Text fontSize="xs" color="blackAlpha.700">
                        {formatarHora(pedido.timestamp)}
                      </Text>
                    </Box>

                    <Box flex="1">
                      <Flex justify="space-between" align="center">
                        <Text color="blackAlpha.800" fontWeight="medium">
                          {pedido.cliente} • {pedido.mesa}
                        </Text>
                        <Flex align="center" gap={2}>
                          <Badge
                            colorScheme={pedido.status === "aberto" ? "green" : "orange"}
                            fontSize="xs"
                            px={2}
                            py={1}
                            borderRadius="full"
                          >
                            {pedido.status === "aberto" ? "Aberta" : "Fechada"}
                          </Badge>
                          <Text fontWeight="bold" color="blackAlpha.800">
                            R$ {calcularTotal(pedido).toFixed(2)}
                          </Text>
                        </Flex>
                      </Flex>
                    </Box>
                  </Flex>
                </Box>
              ))
            ) : (
              <Box p={4} textAlign="center">
                <Text color="white">Nenhuma comanda encontrada</Text>
              </Box>
            )}
          </VStack>
        )}
      </Box>

      {/* Modal de detalhes do pedido */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg="black" borderColor="#E6B325" borderWidth={1}>
          <ModalHeader color="#E6B325" borderBottomWidth={1} borderBottomColor="#E6B325">
            <Flex justify="space-between" align="center">
              <Text>Comanda #{selectedPedido?.id}</Text>
              <Badge
                colorScheme={selectedPedido?.status === "aberto" ? "green" : "orange"}
                fontSize="sm"
                px={2}
                py={1}
                borderRadius="full"
              >
                {selectedPedido?.status === "aberto" ? "Aberta" : "Fechada"}
              </Badge>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={4}>
              <Flex justify="space-between">
                <Text color="white">
                  Cliente:{" "}
                  <Text as="span" fontWeight="bold">
                    {selectedPedido?.cliente}
                  </Text>
                </Text>
                <Text color="white">
                  Mesa:{" "}
                  <Text as="span" fontWeight="bold">
                    {selectedPedido?.mesa}
                  </Text>
                </Text>
              </Flex>

              <Divider borderColor="whiteAlpha.300" />

              <Text color="#E6B325" fontWeight="bold">
                Itens do pedido:
              </Text>

              <VStack align="stretch" spacing={2}>
                {selectedPedido?.itens.map((item, index) => (
                  <Flex key={index} justify="space-between">
                    <Text color="white">
                      {item.quantidade}x {item.nome}
                    </Text>
                    <Text color="white">R$ {(item.preco * item.quantidade).toFixed(2)}</Text>
                  </Flex>
                ))}
              </VStack>

              <Divider borderColor="whiteAlpha.300" />

              <Flex justify="space-between" fontWeight="bold">
                <Text color="white">Total:</Text>
                <Text color="#E6B325">R$ {selectedPedido ? calcularTotal(selectedPedido).toFixed(2) : "0.00"}</Text>
              </Flex>

              <HStack spacing={4} mt={4} justify="space-between">
                <Flex gap={2}>
                  {selectedPedido?.status === "aberto" ? (
                    <Button
                      leftIcon={<FiEdit />}
                      as={RouterLink}
                      to={`/editar-pedido/${selectedPedido?.id}`}
                      bg="#E6B325"
                      color="black"
                      _hover={{ bg: "#D6A315" }}
                    >
                      Adicionar itens
                    </Button>
                  ) : (
                    <Button
                      leftIcon={<FiEdit />}
                      onClick={() => selectedPedido && reabrirComanda(selectedPedido.id)}
                      bg="#E6B325"
                      color="black"
                      _hover={{ bg: "#D6A315" }}
                    >
                      Reabrir comanda
                    </Button>
                  )}

                  <IconButton
                    aria-label="Excluir comanda"
                    icon={<FiTrash2 />}
                    colorScheme="red"
                    variant="outline"
                    onClick={() => selectedPedido && excluirComanda(selectedPedido.id)}
                  />
                </Flex>

                {selectedPedido?.status === "aberto" ? (
                  <Button
                    leftIcon={<FiCreditCard />}
                    onClick={() => selectedPedido && fecharComanda(selectedPedido.id)}
                    bg="#C25B02"
                    color="white"
                    _hover={{ bg: "#B24A01" }}
                  >
                    Fechar comanda
                  </Button>
                ) : (
                  <Button
                    leftIcon={<FiCreditCard />}
                    as={RouterLink}
                    to={`/pagamento/${selectedPedido?.id}`}
                    bg="#C25B02"
                    color="white"
                    _hover={{ bg: "#B24A01" }}
                  >
                    Ir para pagamento
                  </Button>
                )}
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default PedidosPage
