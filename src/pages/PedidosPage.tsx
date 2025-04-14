"use client"

import { useState } from "react"
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
} from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"
import { FiEdit, FiCreditCard, FiPlus, FiTrash2 } from "react-icons/fi"

// Tipo para os pedidos
interface Pedido {
  id: number
  mesa: string
  cliente: string
  itens: Array<{
    nome: string
    quantidade: number
    preco: number
  }>
  status: "aberto" | "fechado" | "pago"
  timestamp: Date
}

const PedidosPage = () => {
  const toast = useToast()

  // Dados de exemplo
  const [pedidos, setPedidos] = useState<Pedido[]>([
    {
      id: 1,
      mesa: "Mesa 1",
      cliente: "João Silva",
      itens: [
        { nome: "Hot Dog Completo", quantidade: 2, preco: 12.0 },
        { nome: "Refrigerante", quantidade: 1, preco: 6.0 },
      ],
      status: "aberto",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
    },
    {
      id: 2,
      mesa: "Mesa 3",
      cliente: "Maria Oliveira",
      itens: [
        { nome: "Hot Dog Simples", quantidade: 1, preco: 10.0 },
        { nome: "Água", quantidade: 1, preco: 4.0 },
      ],
      status: "aberto",
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutos atrás
    },
    {
      id: 3,
      mesa: "Balcão 2",
      cliente: "Pedro Santos",
      itens: [
        { nome: "Hot Dog Bacon", quantidade: 3, preco: 15.0 },
        { nome: "Refrigerante", quantidade: 2, preco: 6.0 },
      ],
      status: "aberto",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutos atrás
    },
    {
      id: 4,
      mesa: "Delivery",
      cliente: "Ana Costa",
      itens: [{ nome: "Hot Dog Vegetariano", quantidade: 1, preco: 16.0 }],
      status: "aberto",
      timestamp: new Date(),
    },
    {
      id: 5,
      mesa: "Mesa 5",
      cliente: "Carlos Mendes",
      itens: [
        { nome: "Hot Dog Frango", quantidade: 2, preco: 14.0 },
        { nome: "Suco", quantidade: 2, preco: 8.0 },
      ],
      status: "aberto",
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutos atrás
    },
  ])

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)

  const handlePedidoClick = (pedido: Pedido) => {
    setSelectedPedido(pedido)
    onOpen()
  }

  const fecharComanda = (id: number) => {
    setPedidos(pedidos.map((pedido) => (pedido.id === id ? { ...pedido, status: "fechado" } : pedido)))
    onClose()

    toast({
      title: "Comanda fechada",
      description: `A comanda #${id} foi fechada e está pronta para pagamento.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    })
  }

  const reabrirComanda = (id: number) => {
    setPedidos(pedidos.map((pedido) => (pedido.id === id ? { ...pedido, status: "aberto" } : pedido)))
    onClose()

    toast({
      title: "Comanda reaberta",
      description: `A comanda #${id} foi reaberta para adicionar mais itens.`,
      status: "info",
      duration: 3000,
      isClosable: true,
    })
  }

  const excluirComanda = (id: number) => {
    setPedidos(pedidos.filter((pedido) => pedido.id !== id))
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

  const formatarHora = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Box maxW="1200px" mx="auto" p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Button
          bg="#C25B02"
          color="white"
          size="md"
          borderRadius="full"
          px={6}
          py={2}
          fontWeight="normal"
          fontSize="md"
          _hover={{ bg: "#B24A01" }}
        >
          Comandas em andamento
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
      </Flex>

      <Box bg="black" borderRadius="xl" p={4} overflow="hidden">
        <VStack spacing={1} align="stretch">
          {pedidos
            .filter((p) => p.status === "aberto" || p.status === "fechado")
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .map((pedido) => (
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
            ))}

          {pedidos.filter((p) => p.status === "aberto" || p.status === "fechado").length === 0 && (
            <Box p={4} textAlign="center">
              <Text color="white">Nenhuma comanda em andamento</Text>
            </Box>
          )}
        </VStack>
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
