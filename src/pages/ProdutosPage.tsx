"use client"

import type React from "react"

import { useState } from "react"
import {
  Box,
  Heading,
  Button,
  Flex,
  Grid,
  GridItem,
  Image,
  Text,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  useToast,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react"
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi"
import { useData, type Produto } from "../context/DataContext"

const ProdutosPage = () => {
  const { produtos, addProduto, updateProduto, deleteProduto } = useData()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

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

  // Obter categorias únicas para o filtro
  const categorias = ["todas", ...new Set(produtos.map((p) => p.categoria))]

  // Filtrar produtos
  const filteredProdutos = produtos.filter((produto) => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategoria = categoriaFiltro === "todas" || produto.categoria === categoriaFiltro
    return matchesSearch && matchesCategoria
  })

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

  return (
    <Box maxW="1200px" mx="auto" p={4}>
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
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
          Gerenciar Produtos
        </Button>

        <Flex gap={4}>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="black"
              color="white"
              borderColor="whiteAlpha.300"
            />
          </InputGroup>

          <Select
            maxW="200px"
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

          <Button
            leftIcon={<FiPlus />}
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

      <Grid templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
        {filteredProdutos.map((produto) => (
          <GridItem key={produto.id}>
            <Box
              bg="black"
              borderRadius="lg"
              overflow="hidden"
              borderWidth={1}
              borderColor={produto.ativo ? "#E6B325" : "gray.600"}
              opacity={produto.ativo ? 1 : 0.7}
            >
              <Image
                src={produto.imagem || "/placeholder.svg"}
                alt={produto.nome}
                height="180px"
                width="100%"
                objectFit="cover"
              />
              <Box p={4}>
                <Flex justify="space-between" align="center" mb={2}>
                  <Heading size="md" color="#E6B325" isTruncated>
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

                <Flex justify="space-between">
                  <IconButton
                    aria-label="Editar produto"
                    icon={<FiEdit2 />}
                    size="sm"
                    colorScheme="yellow"
                    onClick={() => handleEdit(produto)}
                  />
                  <IconButton
                    aria-label="Excluir produto"
                    icon={<FiTrash2 />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDelete(produto.id, produto.nome)}
                  />
                </Flex>
              </Box>
            </Box>
          </GridItem>
        ))}
      </Grid>

      {filteredProdutos.length === 0 && (
        <Box textAlign="center" p={8} bg="black" borderRadius="md" mt={4}>
          <Text color="white">Nenhum produto encontrado.</Text>
        </Box>
      )}

      {/* Modal de Criar/Editar Produto */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="black" borderColor="#E6B325" borderWidth={1}>
          <ModalHeader color="#E6B325">{editId !== null ? "Editar Produto" : "Adicionar Novo Produto"}</ModalHeader>
          <ModalBody pb={6}>
            <FormControl mb={4} isRequired>
              <FormLabel color="white">Nome do Produto</FormLabel>
              <Input
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

            <FormControl display="flex" alignItems="center">
              <FormLabel color="white" mb="0">
                Produto Ativo?
              </FormLabel>
              <Switch colorScheme="yellow" isChecked={formData.ativo} onChange={handleSwitchChange} />
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
    </Box>
  )
}

export default ProdutosPage
