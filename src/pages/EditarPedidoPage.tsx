"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Heading,
  VStack,
  Text,
  Button,
  Flex,
  Grid,
  GridItem,
  Image,
  useToast,
  Input,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  IconButton,
  Divider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Icon,
} from "@chakra-ui/react"
import { useParams, useNavigate } from "react-router-dom"
import { FiPlus, FiMinus, FiSave, FiX, FiShoppingCart, FiAlertCircle } from "react-icons/fi"

// Tipos
interface Produto {
  id: number
  nome: string
  preco: number
  imagem: string
  categoria: string
}

interface ItemPedido {
  produto: Produto
  quantidade: number
  observacao?: string
}

interface Pedido {
  id: number
  mesa: string
  cliente: string
  itens: Array<{
    nome: string
    quantidade: number
    preco: number
    observacao?: string
  }>
  status: "aberto" | "fechado" | "pago"
  timestamp: Date
}

const EditarPedidoPage = () => {
  const { pedidoId } = useParams<{ pedidoId: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Produtos de exemplo
  const produtos: Produto[] = [
    {
      id: 1,
      nome: "Hot Dog Tradicional",
      preco: 12.0,
      imagem: "/placeholder.svg?height=100&width=100",
      categoria: "Hot Dogs",
    },
    {
      id: 2,
      nome: "Hot Dog Bacon",
      preco: 15.0,
      imagem: "/placeholder.svg?height=100&width=100",
      categoria: "Hot Dogs",
    },
    {
      id: 3,
      nome: "Hot Dog Frango",
      preco: 14.0,
      imagem: "/placeholder.svg?height=100&width=100",
      categoria: "Hot Dogs",
    },
    {
      id: 4,
      nome: "Hot Dog Vegetariano",
      preco: 16.0,
      imagem: "/placeholder.svg?height=100&width=100",
      categoria: "Hot Dogs",
    },
    {
      id: 5,
      nome: "Refrigerante Lata",
      preco: 6.0,
      imagem: "/placeholder.svg?height=100&width=100",
      categoria: "Bebidas",
    },
    {
      id: 6,
      nome: "Água Mineral",
      preco: 4.0,
      imagem: "/placeholder.svg?height=100&width=100",
      categoria: "Bebidas",
    },
    {
      id: 7,
      nome: "Suco Natural",
      preco: 8.0,
      imagem: "/placeholder.svg?height=100&width=100",
      categoria: "Bebidas",
    },
    {
      id: 8,
      nome: "Batata Frita",
      preco: 10.0,
      imagem: "/placeholder.svg?height=100&width=100",
      categoria: "Acompanhamentos",
    },
    {
      id: 9,
      nome: "Onion Rings",
      preco: 12.0,
      imagem: "/placeholder.svg?height=100&width=100",
      categoria: "Acompanhamentos",
    },
  ]

  // Pedido simulado
  const pedidoSimulado: Pedido = {
    id: Number(pedidoId),
    mesa: "Mesa 1",
    cliente: "João Silva",
    itens: [
      { nome: "Hot Dog Completo", quantidade: 2, preco: 12.0 },
      { nome: "Refrigerante", quantidade: 1, preco: 6.0 },
    ],
    status: "aberto",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
  }

  const [pedido, setPedido] = useState<Pedido>(pedidoSimulado)
  const [itensPedido, setItensPedido] = useState<ItemPedido[]>([])
  const [observacaoItem, setObservacaoItem] = useState<{ [key: number]: string }>({})

  // Obter categorias únicas
  const categorias = [...new Set(produtos.map((p) => p.categoria))]

  // Carregar pedido
  useEffect(() => {
    // Aqui você faria uma chamada API para buscar os dados do pedido
    // Simulando a conversão dos itens do pedido para o formato ItemPedido
    const itensConvertidos: ItemPedido[] = pedidoSimulado.itens.map((item) => {
      // Encontrar o produto correspondente
      const produto = produtos.find((p) => p.nome === item.nome) || produtos[0]

      return {
        produto,
        quantidade: item.quantidade,
        observacao: item.observacao,
      }
    })

    setItensPedido(itensConvertidos)
  }, [pedidoId])

  const adicionarItem = (produto: Produto) => {
    const itemExistente = itensPedido.find((item) => item.produto.id === produto.id)

    if (itemExistente) {
      setItensPedido(
        itensPedido.map((item) =>
          item.produto.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item,
        ),
      )
    } else {
      const novoItem = {
        produto,
        quantidade: 1,
        observacao: observacaoItem[produto.id] || "",
      }
      setItensPedido([...itensPedido, novoItem])
    }
  }

  const atualizarQuantidade = (produtoId: number, quantidade: number) => {
    if (quantidade === 0) {
      setItensPedido(itensPedido.filter((item) => item.produto.id !== produtoId))
    } else {
      setItensPedido(itensPedido.map((item) => (item.produto.id === produtoId ? { ...item, quantidade } : item)))
    }
  }

  const atualizarObservacao = (produtoId: number, observacao: string) => {
    setItensPedido(itensPedido.map((item) => (item.produto.id === produtoId ? { ...item, observacao } : item)))
  }

  const calcularTotal = () => {
    return itensPedido.reduce((total, item) => total + item.produto.preco * item.quantidade, 0)
  }

  const removerItem = (produtoId: number) => {
    setItensPedido(itensPedido.filter((item) => item.produto.id !== produtoId))
  }

  const salvarComanda = () => {
    if (itensPedido.length === 0) {
      onOpen() // Abrir modal de confirmação
      return
    }

    // Simulando a atualização da comanda
    toast({
      title: "Comanda atualizada",
      description: `Comanda #${pedidoId} atualizada com sucesso!`,
      status: "success",
      duration: 3000,
      isClosable: true,
    })

    // Redirecionar para a página de pedidos
    navigate(`/pedidos`)
  }

  const confirmarSalvarVazia = () => {
    onClose()

    toast({
      title: "Comanda atualizada",
      description: `Comanda #${pedidoId} atualizada com sucesso!`,
      status: "success",
      duration: 3000,
      isClosable: true,
    })

    navigate(`/pedidos`)
  }

  return (
    <Box maxW="1200px" mx="auto" p={4}>
      <Button
        bg="#C25B02"
        color="white"
        size="md"
        borderRadius="full"
        px={6}
        py={2}
        fontWeight="normal"
        fontSize="md"
        mb={6}
        _hover={{ bg: "#B24A01" }}
      >
        Editar Comanda #{pedidoId}
      </Button>

      <Flex direction={{ base: "column", md: "row" }} gap={6}>
        {/* Lista de produtos */}
        <Box flex="2">
          <Box bg="black" p={4} borderRadius="md" mb={6}>
            <Flex justify="space-between" align="center">
              <Heading size="md" color="#E6B325">
                Informações da Comanda
              </Heading>
              <Badge colorScheme="green" fontSize="sm" px={2} py={1} borderRadius="full">
                Aberta
              </Badge>
            </Flex>

            <Flex gap={4} direction={{ base: "column", sm: "row" }} mt={4}>
              <Text color="white">
                Cliente:{" "}
                <Text as="span" fontWeight="bold">
                  {pedido.cliente}
                </Text>
              </Text>
              <Text color="white">
                Mesa:{" "}
                <Text as="span" fontWeight="bold">
                  {pedido.mesa}
                </Text>
              </Text>
            </Flex>
          </Box>

          <Tabs variant="enclosed" colorScheme="yellow" bg="#E6B325" borderRadius="md">
            <TabList>
              <Tab _selected={{ bg: "#C25B02", color: "white" }}>Todos</Tab>
              {categorias.map((categoria) => (
                <Tab key={categoria} _selected={{ bg: "#C25B02", color: "white" }}>
                  {categoria}
                </Tab>
              ))}
            </TabList>

            <TabPanels bg="black" borderBottomRadius="md">
              <TabPanel>
                <Grid templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
                  {produtos.map((produto) => (
                    <GridItem
                      key={produto.id}
                      bg="#E6B325"
                      p={4}
                      borderRadius="md"
                      transition="all 0.3s"
                      _hover={{ bg: "#D6A315" }}
                    >
                      <Flex direction="column" align="center">
                        <Image
                          src={produto.imagem || "/placeholder.svg"}
                          alt={produto.nome}
                          boxSize="100px"
                          objectFit="cover"
                          borderRadius="md"
                          mb={3}
                        />
                        <Text fontWeight="bold" mb={1}>
                          {produto.nome}
                        </Text>
                        <Text mb={3}>R$ {produto.preco.toFixed(2)}</Text>

                        <Flex width="100%" justify="space-between" align="center">
                          <Input
                            placeholder="Observação"
                            size="sm"
                            value={observacaoItem[produto.id] || ""}
                            onChange={(e) =>
                              setObservacaoItem({
                                ...observacaoItem,
                                [produto.id]: e.target.value,
                              })
                            }
                            bg="white"
                            color="black"
                            _placeholder={{ color: "gray.500" }}
                          />
                          <IconButton
                            aria-label="Adicionar item"
                            icon={<FiPlus />}
                            size="sm"
                            ml={2}
                            bg="#C25B02"
                            color="white"
                            onClick={() => adicionarItem(produto)}
                            _hover={{ bg: "#B24A01" }}
                          />
                        </Flex>
                      </Flex>
                    </GridItem>
                  ))}
                </Grid>
              </TabPanel>

              {categorias.map((categoria) => (
                <TabPanel key={categoria}>
                  <Grid
                    templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                    gap={4}
                  >
                    {produtos
                      .filter((produto) => produto.categoria === categoria)
                      .map((produto) => (
                        <GridItem
                          key={produto.id}
                          bg="#E6B325"
                          p={4}
                          borderRadius="md"
                          transition="all 0.3s"
                          _hover={{ bg: "#D6A315" }}
                        >
                          <Flex direction="column" align="center">
                            <Image
                              src={produto.imagem || "/placeholder.svg"}
                              alt={produto.nome}
                              boxSize="100px"
                              objectFit="cover"
                              borderRadius="md"
                              mb={3}
                            />
                            <Text fontWeight="bold" mb={1}>
                              {produto.nome}
                            </Text>
                            <Text mb={3}>R$ {produto.preco.toFixed(2)}</Text>

                            <Flex width="100%" justify="space-between" align="center">
                              <Input
                                placeholder="Observação"
                                size="sm"
                                value={observacaoItem[produto.id] || ""}
                                onChange={(e) =>
                                  setObservacaoItem({
                                    ...observacaoItem,
                                    [produto.id]: e.target.value,
                                  })
                                }
                                bg="white"
                                color="black"
                                _placeholder={{ color: "gray.500" }}
                              />
                              <IconButton
                                aria-label="Adicionar item"
                                icon={<FiPlus />}
                                size="sm"
                                ml={2}
                                bg="#C25B02"
                                color="white"
                                onClick={() => adicionarItem(produto)}
                                _hover={{ bg: "#B24A01" }}
                              />
                            </Flex>
                          </Flex>
                        </GridItem>
                      ))}
                  </Grid>
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </Box>

        {/* Resumo do pedido */}
        <Box
          flex="1"
          bg="black"
          p={4}
          borderRadius="md"
          position="sticky"
          top="20px"
          alignSelf="flex-start"
          borderWidth={1}
          borderColor="#E6B325"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md" color="#E6B325">
              Itens da Comanda
            </Heading>
            <Badge colorScheme="green" fontSize="sm" px={2} py={1} borderRadius="full">
              Aberta
            </Badge>
          </Flex>

          {itensPedido.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              py={10}
              color="whiteAlpha.600"
              bg="whiteAlpha.50"
              borderRadius="md"
            >
              <FiShoppingCart size={40} />
              <Text mt={2}>Nenhum item adicionado</Text>
            </Flex>
          ) : (
            <VStack spacing={3} align="stretch" mb={4} maxH="400px" overflowY="auto" pr={2}>
              {itensPedido.map((item) => (
                <Box key={item.produto.id} bg="whiteAlpha.100" p={3} borderRadius="md">
                  <Flex justify="space-between" mb={2}>
                    <Flex align="center" gap={2}>
                      <Text fontWeight="medium" color="white">
                        {item.produto.nome}
                      </Text>
                      <Badge colorScheme="yellow" fontSize="xs">
                        {item.produto.categoria}
                      </Badge>
                    </Flex>
                    <IconButton
                      aria-label="Remover item"
                      icon={<FiX />}
                      size="xs"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => removerItem(item.produto.id)}
                    />
                  </Flex>

                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm" color="whiteAlpha.800">
                      R$ {item.produto.preco.toFixed(2)} x {item.quantidade} = R${" "}
                      {(item.produto.preco * item.quantidade).toFixed(2)}
                    </Text>
                    <Flex align="center">
                      <IconButton
                        aria-label="Diminuir quantidade"
                        icon={<FiMinus />}
                        size="xs"
                        colorScheme="yellow"
                        variant="ghost"
                        onClick={() => atualizarQuantidade(item.produto.id, Math.max(0, item.quantidade - 1))}
                      />
                      <Text mx={2} color="white">
                        {item.quantidade}
                      </Text>
                      <IconButton
                        aria-label="Aumentar quantidade"
                        icon={<FiPlus />}
                        size="xs"
                        colorScheme="yellow"
                        variant="ghost"
                        onClick={() => atualizarQuantidade(item.produto.id, item.quantidade + 1)}
                      />
                    </Flex>
                  </Flex>

                  {item.observacao && (
                    <Text fontSize="xs" color="whiteAlpha.700" mt={1}>
                      Obs: {item.observacao}
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>
          )}

          <Divider borderColor="whiteAlpha.300" my={4} />

          <Flex justify="space-between" fontWeight="bold" mb={6}>
            <Text color="white">Total:</Text>
            <Text color="#E6B325">R$ {calcularTotal().toFixed(2)}</Text>
          </Flex>

          <Button
            w="100%"
            bg="#C25B02"
            color="white"
            onClick={salvarComanda}
            _hover={{ bg: "#B24A01" }}
            borderRadius="full"
            leftIcon={<FiSave />}
          >
            Salvar Alterações
          </Button>
        </Box>
      </Flex>

      {/* Modal de confirmação para salvar comanda vazia */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="black" borderColor="#E6B325" borderWidth={1}>
          <ModalHeader color="#E6B325">Atenção</ModalHeader>
          <ModalBody>
            <Flex align="center" gap={3}>
              <Icon as={FiAlertCircle} color="yellow.400" boxSize={6} />
              <Text color="white">A comanda não possui itens. Deseja realmente salvar uma comanda vazia?</Text>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" colorScheme="yellow" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button bg="#C25B02" color="white" onClick={confirmarSalvarVazia} _hover={{ bg: "#B24A01" }}>
              Confirmar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default EditarPedidoPage
