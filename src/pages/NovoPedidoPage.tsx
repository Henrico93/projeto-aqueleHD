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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { FiPlus, FiMinus, FiSave, FiX, FiShoppingCart, FiUser } from "react-icons/fi"
import { useData, type ItemPedido, type Cliente } from "../context/DataContext"

const NovoPedidoPage = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { produtos, addPedido, clientes, addCliente, getClienteByNome } = useData()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [itensPedido, setItensPedido] = useState<ItemPedido[]>([])
  const [cliente, setCliente] = useState("")
  const [telefoneCliente, setTelefoneCliente] = useState("")
  const [mesa, setMesa] = useState("")
  const [observacaoItem, setObservacaoItem] = useState<{ [key: number]: string }>({})
  const [clienteExistente, setClienteExistente] = useState<Cliente | null>(null)
  const [clienteSugestoes, setClienteSugestoes] = useState<Cliente[]>([])

  // Obter categorias únicas
  const categorias = [...new Set(produtos.map((p) => p.categoria))]

  useEffect(() => {
    if (cliente.length > 2) {
      const sugestoes = clientes.filter((c) => c.nome.toLowerCase().includes(cliente.toLowerCase())).slice(0, 5)
      setClienteSugestoes(sugestoes)

      const existente = getClienteByNome(cliente)
      setClienteExistente(existente || null)
    } else {
      setClienteSugestoes([])
      setClienteExistente(null)
    }
  }, [cliente, clientes, getClienteByNome])

  const adicionarItem = (produto: (typeof produtos)[0]) => {
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

  const handleSelecionarCliente = (clienteSelecionado: Cliente) => {
    setCliente(clienteSelecionado.nome)
    setTelefoneCliente(clienteSelecionado.telefone || "")
    setClienteExistente(clienteSelecionado)
    setClienteSugestoes([])
  }

  const handleNovoCliente = () => {
    onOpen()
  }

  const salvarNovoCliente = () => {
    if (!cliente.trim() || !telefoneCliente.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o nome e telefone do cliente",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const novoCliente = addCliente({
      nome: cliente,
      telefone: telefoneCliente,
      historicoPedidos: [],
    })

    setClienteExistente(novoCliente)

    toast({
      title: "Cliente adicionado",
      description: `Cliente ${novoCliente.nome} adicionado com sucesso!`,
      status: "success",
      duration: 3000,
      isClosable: true,
    })

    onClose()
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

    // Criar o pedido com os dados atuais
    const valorTotal = calcularTotal()
    const novoPedido = addPedido({
      clienteId: clienteExistente?.id,
      mesa,
      cliente,
      itens: itensPedido.map((item) => ({
        nome: item.produto.nome,
        quantidade: item.quantidade,
        preco: item.produto.preco,
        observacao: item.observacao,
      })),
      status: "aberto",
      timestamp: new Date(),
      valorTotal,
    })

    toast({
      title: "Comanda criada",
      description: `Comanda #${novoPedido.id} criada com sucesso!`,
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
              <FormControl position="relative">
                <FormLabel color="white">Cliente</FormLabel>
                <Flex>
                  <Input
                    placeholder="Nome do cliente"
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    bg="whiteAlpha.100"
                    color="white"
                    _placeholder={{ color: "whiteAlpha.500" }}
                  />
                  <IconButton
                    aria-label="Adicionar cliente"
                    icon={<FiUser />}
                    ml={2}
                    onClick={handleNovoCliente}
                    colorScheme="yellow"
                  />
                </Flex>
                {clienteSugestoes.length > 0 && (
                  <Box
                    position="absolute"
                    zIndex="10"
                    bg="black"
                    width="100%"
                    borderRadius="md"
                    mt={1}
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                  >
                    {clienteSugestoes.map((c) => (
                      <Box
                        key={c.id}
                        p={2}
                        cursor="pointer"
                        _hover={{ bg: "whiteAlpha.200" }}
                        onClick={() => handleSelecionarCliente(c)}
                      >
                        <Text color="white">{c.nome}</Text>
                        {c.telefone && (
                          <Text fontSize="xs" color="whiteAlpha.700">
                            {c.telefone}
                          </Text>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
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
                  {produtos
                    .filter((p) => p.ativo)
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

              {categorias.map((categoria) => (
                <TabPanel key={categoria}>
                  <Grid
                    templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                    gap={4}
                  >
                    {produtos
                      .filter((produto) => produto.categoria === categoria && produto.ativo)
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

      {/* Modal para adicionar novo cliente */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="black" borderColor="#E6B325" borderWidth={1}>
          <ModalHeader color="#E6B325">Adicionar Novo Cliente</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel color="white">Nome</FormLabel>
                <Input
                  placeholder="Nome completo"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  bg="whiteAlpha.100"
                  color="white"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="white">Telefone</FormLabel>
                <Input
                  placeholder="(XX) XXXXX-XXXX"
                  value={telefoneCliente}
                  onChange={(e) => setTelefoneCliente(e.target.value)}
                  bg="whiteAlpha.100"
                  color="white"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" colorScheme="yellow" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button bg="#C25B02" color="white" onClick={salvarNovoCliente} _hover={{ bg: "#B24A01" }}>
              Salvar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default NovoPedidoPage
