"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  Image,
  Badge,
  IconButton,
  useToast,
  Input,
  Select,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  VStack,
  Divider,
} from "@chakra-ui/react"
import { FiEdit2, FiPlusCircle, FiTrash2, FiSearch, FiRefreshCw, FiPackage, FiLink } from "react-icons/fi"
import { useData, type Produto, type ItemEstoque } from "../context/DataContext"
import api from "../services/api"

const ProdutosPage = () => {
  const { produtos, addProduto, updateProduto, deleteProduto, estoque, updateItemEstoque, refreshData } = useData()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isOpenEstoque, onOpen: onOpenEstoque, onClose: onCloseEstoque } = useDisclosure()

  const [formData, setFormData] = useState<Omit<Produto, "id">>({
    nome: "",
    preco: 0,
    imagem: "/placeholder.svg?height=100&width=100",
    categoria: "",
    ativo: true,
  })

  const [editId, setEditId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas")
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [itensEstoqueProduto, setItensEstoqueProduto] = useState<ItemEstoque[]>([])
  const [itensEstoqueDisponiveis, setItensEstoqueDisponiveis] = useState<ItemEstoque[]>([])
  const [itemEstoqueSelecionado, setItemEstoqueSelecionado] = useState<ItemEstoque | null>(null)
  const [filtroItensEstoque, setFiltroItensEstoque] = useState("")

  const initialRef = useRef(null)

  // Obter categorias únicas para o filtro
  const categorias = ["todas", ...new Set(produtos.map((p) => p.categoria))]

  // Filtrar produtos
  const filteredProdutos = produtos.filter((produto) => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategoria = categoriaFiltro === "todas" || produto.categoria === categoriaFiltro
    return matchesSearch && matchesCategoria
  })

  // Função para buscar itens de estoque relacionados a um produto
  const buscarItensEstoqueProduto = (produtoId: number) => {
    return estoque.filter((item) => item.produtoId === produtoId)
  }

  // Função para buscar itens de estoque disponíveis (não associados a nenhum produto)
  const buscarItensEstoqueDisponiveis = () => {
    return estoque.filter((item) => item.produtoId === -1 || item.produtoId === 0)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, ativo: e.target.checked }))
  }

  const handleNumberChange = (value: string) => {
    setFormData((prev) => ({ ...prev, preco: Number.parseFloat(value) || 0 }))
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      preco: 0,
      imagem: "/placeholder.svg?height=100&width=100",
      categoria: "",
      ativo: true,
    })
    setEditId(null)
  }

  const handleSubmit = () => {
    // Validar o formulário
    if (!formData.nome || !formData.categoria || formData.preco <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos corretamente",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (editId !== null) {
      // Atualizar produto existente
      updateProduto({
        ...formData,
        id: editId,
      })
      toast({
        title: "Produto atualizado",
        description: `${formData.nome} foi atualizado com sucesso.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } else {
      // Adicionar novo produto
      addProduto(formData)
      toast({
        title: "Produto adicionado",
        description: `${formData.nome} foi adicionado com sucesso.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    }

    resetForm()
    onClose()
  }

  const handleEdit = (produto: Produto) => {
    setFormData({
      nome: produto.nome,
      preco: produto.preco,
      imagem: produto.imagem,
      categoria: produto.categoria,
      ativo: produto.ativo,
    })
    setEditId(produto.id)
    onOpen()
  }

  const handleDelete = (id: number, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir "${nome}"?`)) {
      deleteProduto(id)
      toast({
        title: "Produto excluído",
        description: `${nome} foi removido com sucesso.`,
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleOpenEstoqueModal = (produto: Produto) => {
    setProdutoSelecionado(produto)

    // Buscar itens de estoque relacionados ao produto
    const itensProduto = buscarItensEstoqueProduto(produto.id)
    setItensEstoqueProduto(itensProduto)

    // Buscar itens de estoque disponíveis
    const itensDisponiveis = buscarItensEstoqueDisponiveis()
    setItensEstoqueDisponiveis(itensDisponiveis)

    onOpenEstoque()
  }

  const handleAssociarItemEstoque = async () => {
    if (!itemEstoqueSelecionado || !produtoSelecionado) return

    try {
      // Atualizar o produtoId do item de estoque
      const itemAtualizado = {
        ...itemEstoqueSelecionado,
        produtoId: produtoSelecionado.id,
        ultimaAtualizacao: new Date(),
      }

      // Enviar para a API
      await api.put(`/estoque/${itemEstoqueSelecionado.id}`, itemAtualizado)

      // Atualizar o estado local
      await updateItemEstoque(itemAtualizado)

      // Atualizar as listas
      setItensEstoqueProduto([...itensEstoqueProduto, itemAtualizado])
      setItensEstoqueDisponiveis(itensEstoqueDisponiveis.filter((item) => item.id !== itemEstoqueSelecionado.id))

      // Limpar seleção
      setItemEstoqueSelecionado(null)

      toast({
        title: "Item associado",
        description: `${itemAtualizado.nome} foi associado ao produto ${produtoSelecionado.nome}.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (err) {
      console.error("Erro ao associar item de estoque:", err)
      toast({
        title: "Erro",
        description: "Não foi possível associar o item de estoque ao produto.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleDesassociarItemEstoque = async (item: ItemEstoque) => {
    try {
      // Atualizar o produtoId do item de estoque para -1 (não associado)
      const itemAtualizado = {
        ...item,
        produtoId: -1,
        ultimaAtualizacao: new Date(),
      }

      // Enviar para a API
      await api.put(`/estoque/${item.id}`, itemAtualizado)

      // Atualizar o estado local
      await updateItemEstoque(itemAtualizado)

      // Atualizar as listas
      setItensEstoqueProduto(itensEstoqueProduto.filter((i) => i.id !== item.id))
      setItensEstoqueDisponiveis([...itensEstoqueDisponiveis, itemAtualizado])

      toast({
        title: "Item desassociado",
        description: `${itemAtualizado.nome} foi desassociado do produto.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (err) {
      console.error("Erro ao desassociar item de estoque:", err)
      toast({
        title: "Erro",
        description: "Não foi possível desassociar o item de estoque do produto.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const verificarRelacaoEstoqueProduto = async (produtoId: number) => {
    try {
      console.log(`Verificando relação de estoque do produto ${produtoId}...`)

      // Buscar itens de estoque relacionados ao produto
      const itensRelacionados = estoque.filter((item) => item.produtoId === produtoId)

      if (itensRelacionados.length > 0) {
        const itensInfo = itensRelacionados
          .map((item) => `${item.nome} (${item.quantidade} ${item.unidade}s)`)
          .join(", ")

        toast({
          title: "Relação encontrada",
          description: `O produto possui ${itensRelacionados.length} itens de estoque: ${itensInfo}`,
          status: "success",
          duration: 5000,
          isClosable: true,
        })
      } else {
        toast({
          title: "Sem relação",
          description: "Este produto não possui itens de estoque associados.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (err) {
      console.error("Erro ao verificar relação:", err)
      toast({
        title: "Erro",
        description: "Não foi possível verificar a relação com estoque.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
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
          Produtos
        </Button>
        <Flex gap={2}>
          <Button
            leftIcon={<FiRefreshCw />}
            onClick={refreshData}
            bg="gray.700"
            color="white"
            _hover={{ bg: "gray.600" }}
          >
            Atualizar
          </Button>
          <Button
            leftIcon={<FiPlusCircle />}
            onClick={() => {
              resetForm()
              onOpen()
            }}
            bg="#C25B02"
            color="white"
            _hover={{ bg: "#B24A01" }}
          >
            Novo Produto
          </Button>
        </Flex>
      </Flex>

      <Flex mb={6} gap={4} direction={{ base: "column", md: "row" }}>
        <InputGroup maxW={{ base: "100%", md: "300px" }}>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Buscar produto..."
            bg="black"
            color="white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            borderColor="whiteAlpha.300"
          />
          {searchTerm && (
            <InputRightElement>
              <IconButton
                aria-label="Limpar busca"
                icon={<FiRefreshCw />}
                size="sm"
                variant="ghost"
                color="whiteAlpha.700"
                onClick={() => setSearchTerm("")}
              />
            </InputRightElement>
          )}
        </InputGroup>

        <Select
          maxW={{ base: "100%", md: "200px" }}
          bg="black"
          color="white"
          borderColor="whiteAlpha.300"
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
        >
          {categorias.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria === "todas" ? "Todas as categorias" : categoria}
            </option>
          ))}
        </Select>
      </Flex>

      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
        {filteredProdutos.map((produto) => {
          // Buscar itens de estoque relacionados ao produto
          const itensRelacionados = buscarItensEstoqueProduto(produto.id)

          return (
            <GridItem key={produto.id}>
              <Box bg="black" borderRadius="lg" overflow="hidden" h="100%">
                <Image
                  src={produto.imagem || "/placeholder.svg?height=100&width=100"}
                  alt={produto.nome}
                  w="100%"
                  h="150px"
                  objectFit="cover"
                />
                <Box p={4}>
                  <Flex justify="space-between" align="center" mb={2}>
                    <Heading size="md" color="#E6B325">
                      {produto.nome}
                    </Heading>
                    <Badge colorScheme={produto.ativo ? "green" : "red"}>{produto.ativo ? "Ativo" : "Inativo"}</Badge>
                  </Flex>

                  <Text color="white" mb={2}>
                    R$ {produto.preco.toFixed(2)}
                  </Text>

                  <Text color="whiteAlpha.700" fontSize="sm" mb={4}>
                    Categoria: {produto.categoria}
                  </Text>

                  {/* Exibir itens de estoque relacionados */}
                  {itensRelacionados.length > 0 ? (
                    <Box bg="whiteAlpha.100" p={2} borderRadius="md" mb={4}>
                      <Text color="#E6B325" fontSize="sm" mb={1}>
                        Itens de Estoque:
                      </Text>
                      <VStack align="stretch" spacing={1}>
                        {itensRelacionados.map((item) => (
                          <Flex key={item.id} justify="space-between">
                            <Text color="white" fontSize="sm">
                              {item.nome}
                            </Text>
                            <Text color="white" fontSize="sm">
                              {item.quantidade} {item.unidade}(s)
                            </Text>
                          </Flex>
                        ))}
                      </VStack>
                    </Box>
                  ) : (
                    <Box bg="whiteAlpha.100" p={2} borderRadius="md" mb={4}>
                      <Text color="whiteAlpha.600" fontSize="sm" textAlign="center">
                        Sem itens de estoque
                      </Text>
                    </Box>
                  )}

                  <Flex gap={2} mt={4}>
                    <IconButton
                      aria-label="Editar produto"
                      icon={<FiEdit2 />}
                      onClick={() => handleEdit(produto)}
                      colorScheme="yellow"
                      size="sm"
                    />
                    <IconButton
                      aria-label="Excluir produto"
                      icon={<FiTrash2 />}
                      onClick={() => handleDelete(produto.id, produto.nome)}
                      colorScheme="red"
                      size="sm"
                    />
                    <Button
                      leftIcon={<FiPackage />}
                      onClick={() => handleOpenEstoqueModal(produto)}
                      colorScheme="blue"
                      size="sm"
                      flex="1"
                    >
                      Itens de Estoque
                    </Button>
                    <IconButton
                      aria-label="Verificar relação"
                      icon={<FiLink />}
                      onClick={() => verificarRelacaoEstoqueProduto(produto.id)}
                      colorScheme="green"
                      size="sm"
                    />
                  </Flex>
                </Box>
              </Box>
            </GridItem>
          )
        })}
      </Grid>

      {/* Modal de Criar/Editar Produto */}
      <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={initialRef} size="lg">
        <ModalOverlay />
        <ModalContent bg="black" borderColor="#E6B325" borderWidth={1}>
          <ModalHeader color="#E6B325">{editId !== null ? "Editar Produto" : "Adicionar Novo Produto"}</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody pb={6}>
            <FormControl mb={4} isRequired>
              <FormLabel color="white">Nome do Produto</FormLabel>
              <Input
                ref={initialRef}
                placeholder="Ex: Hot Dog Tradicional"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                bg="whiteAlpha.100"
                color="white"
              />
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel color="white">Categoria</FormLabel>
              <Input
                placeholder="Ex: Hot Dogs, Bebidas, Acompanhamentos"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                bg="whiteAlpha.100"
                color="white"
              />
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel color="white">Preço (R$)</FormLabel>
              <NumberInput
                min={0}
                step={0.5}
                precision={2}
                value={formData.preco}
                onChange={handleNumberChange}
                bg="whiteAlpha.100"
                color="white"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper color="white" />
                  <NumberDecrementStepper color="white" />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel color="white">URL da Imagem</FormLabel>
              <Input
                placeholder="URL da imagem do produto"
                name="imagem"
                value={formData.imagem}
                onChange={handleChange}
                bg="whiteAlpha.100"
                color="white"
              />
            </FormControl>

            <FormControl display="flex" alignItems="center" mb={4}>
              <FormLabel htmlFor="ativo" mb="0" color="white">
                Produto Ativo
              </FormLabel>
              <Switch id="ativo" isChecked={formData.ativo} onChange={handleSwitchChange} colorScheme="yellow" />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button bg="#C25B02" color="white" onClick={handleSubmit} _hover={{ bg: "#B24A01" }}>
              {editId !== null ? "Atualizar" : "Adicionar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Itens de Estoque */}
      <Modal isOpen={isOpenEstoque} onClose={onCloseEstoque} size="xl">
        <ModalOverlay />
        <ModalContent bg="black" borderColor="#E6B325" borderWidth={1}>
          <ModalHeader color="#E6B325">
            Itens de Estoque - {produtoSelecionado ? produtoSelecionado.nome : ""}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Flex gap={4}>
                <FormControl flex="3">
                  <FormLabel color="white">Associar Item de Estoque</FormLabel>
                  <Select
                    placeholder="Selecione um item disponível"
                    bg="whiteAlpha.100"
                    color="white"
                    onChange={(e) => {
                      const item = estoque.find((i) => i.id === Number(e.target.value))
                      setItemEstoqueSelecionado(item || null)
                    }}
                    value={itemEstoqueSelecionado?.id || ""}
                  >
                    {itensEstoqueDisponiveis.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nome} ({item.quantidade} {item.unidade}s disponíveis)
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  colorScheme="blue"
                  alignSelf="flex-end"
                  onClick={handleAssociarItemEstoque}
                  isDisabled={!itemEstoqueSelecionado}
                >
                  Associar
                </Button>
              </Flex>

              <Divider borderColor="whiteAlpha.300" my={2} />

              <Box>
                <Heading size="sm" color="#E6B325" mb={2}>
                  Itens Associados a este Produto
                </Heading>
                {itensEstoqueProduto.length > 0 ? (
                  <Table variant="simple" colorScheme="whiteAlpha" size="sm">
                    <Thead>
                      <Tr>
                        <Th color="#E6B325">Item</Th>
                        <Th color="#E6B325" isNumeric>
                          Quantidade
                        </Th>
                        <Th color="#E6B325">Unidade</Th>
                        <Th color="#E6B325" width="80px"></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {itensEstoqueProduto.map((item) => (
                        <Tr key={item.id}>
                          <Td color="white">{item.nome}</Td>
                          <Td color="white" isNumeric>
                            {item.quantidade}
                          </Td>
                          <Td color="white">{item.unidade}</Td>
                          <Td>
                            <IconButton
                              aria-label="Desassociar item"
                              icon={<FiTrash2 />}
                              size="xs"
                              colorScheme="red"
                              onClick={() => handleDesassociarItemEstoque(item)}
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Text color="whiteAlpha.600" textAlign="center">
                    Nenhum item associado a este produto
                  </Text>
                )}
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" onClick={onCloseEstoque}>
              Fechar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default ProdutosPage
