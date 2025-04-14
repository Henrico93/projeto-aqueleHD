"use client"

import { useState } from "react"
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
  FormControl,
  FormLabel,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  IconButton,
  Divider,
} from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { FiPlus, FiMinus, FiSave, FiX, FiShoppingCart } from "react-icons/fi"

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

const NovoPedidoPage = () => {
  const navigate = useNavigate()
  const toast = useToast()

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

  const [itensPedido, setItensPedido] = useState<ItemPedido[]>([])
  const [cliente, setCliente] = useState("")
  const [mesa, setMesa] = useState("")
  const [observacaoItem, setObservacaoItem] = useState<{ [key: number]: string }>({})

  // Obter categorias únicas
  const categorias = [...new Set(produtos.map((p) => p.categoria))]

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
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item à comanda",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (!cliente) {
      toast({
        title: "Erro",
        description: "Informe o nome do cliente",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (!mesa) {
      toast({
        title: "Erro",
        description: "Informe a mesa ou balcão",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    // Simulando a criação de uma comanda
    const novaComandaId = Math.floor(Math.random() * 1000) + 6

    toast({
      title: "Comanda criada",
      description: `Comanda #${novaComandaId} criada com sucesso!`,
      status: "success",
      duration: 3000,
      isClosable: true,
    })

    // Redirecionar para a página de pedidos
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
        Nova Comanda
      </Button>

      <Flex direction={{ base: "column", md: "row" }} gap={6}>
        {/* Informações da comanda e lista de produtos */}
        <Box flex="2">
          <Box bg="black" p={4} borderRadius="md" mb={6}>
            <Heading size="md" mb={4} color="#E6B325">
              Informações da Comanda
            </Heading>

            <Flex gap={4} direction={{ base: "column", sm: "row" }}>
              <FormControl>
                <FormLabel color="white">Cliente</FormLabel>
                <Input
                  placeholder="Nome do cliente"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  bg="whiteAlpha.100"
                  color="white"
                  _placeholder={{ color: "whiteAlpha.500" }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color="white">Mesa/Balcão</FormLabel>
                <Input
                  placeholder="Ex: Mesa 1, Balcão 2, Delivery"
                  value={mesa}
                  onChange={(e) => setMesa(e.target.value)}
                  bg="whiteAlpha.100"
                  color="white"
                  _placeholder={{ color: "whiteAlpha.500" }}
                />
              </FormControl>
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
            isDisabled={itensPedido.length === 0 || !cliente || !mesa}
            _hover={{ bg: "#B24A01" }}
            borderRadius="full"
            leftIcon={<FiSave />}
          >
            Salvar Comanda
          </Button>
        </Box>
      </Flex>
    </Box>
  )
}

export default NovoPedidoPage
