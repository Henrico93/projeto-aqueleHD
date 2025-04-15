"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  Box,
  Button,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
  useDisclosure,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  VStack,
  Text,
} from "@chakra-ui/react"
import { FiEdit2, FiPlusCircle, FiTrash2, FiSearch, FiRefreshCw } from "react-icons/fi"
import { useData, type ItemEstoque } from "../context/DataContext"

const EstoquePage = () => {
  const { estoque, addItemEstoque, updateItemEstoque, deleteItemEstoque } = useData()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isOpenAjuste, onOpen: onOpenAjuste, onClose: onCloseAjuste } = useDisclosure()

  const [formData, setFormData] = useState<Omit<ItemEstoque, "id">>({
    produtoId: -1,
    nome: "",
    quantidade: 0,
    unidade: "unidade",
    precoUnitario: 0,
    categoria: "",
    ultimaAtualizacao: new Date(),
    estoqueMinimo: 0,
  })

  const [editId, setEditId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas")
  const [itemAjuste, setItemAjuste] = useState<ItemEstoque | null>(null)
  const [quantidadeAjuste, setQuantidadeAjuste] = useState(0)
  const [tipoAjuste, setTipoAjuste] = useState<"adicionar" | "remover">("adicionar")
  const [motivoAjuste, setMotivoAjuste] = useState("")

  const initialRef = useRef(null)

  // Obter categorias únicas para o filtro
  const categorias = ["todas", ...new Set(estoque.map((item) => item.categoria))]

  // Filtrar itens de estoque
  const filteredEstoque = estoque.filter((item) => {
    const matchesSearch =
      item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoria.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategoria = categoriaFiltro === "todas" || item.categoria === categoriaFiltro

    return matchesSearch && matchesCategoria
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (name: string, value: number) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      produtoId: -1,
      nome: "",
      quantidade: 0,
      unidade: "unidade",
      precoUnitario: 0,
      categoria: "",
      ultimaAtualizacao: new Date(),
      estoqueMinimo: 0,
    })
    setEditId(null)
  }

  const handleSubmit = () => {
    // Validar o formulário
    if (!formData.nome || !formData.categoria || formData.quantidade < 0 || formData.precoUnitario <= 0) {
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
      // Atualizar item existente
      updateItemEstoque({
        ...formData,
        id: editId,
        ultimaAtualizacao: new Date(),
      })
      toast({
        title: "Item atualizado",
        description: `${formData.nome} foi atualizado no estoque.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } else {
      // Adicionar novo item
      addItemEstoque({
        ...formData,
        ultimaAtualizacao: new Date(),
      })
      toast({
        title: "Item adicionado",
        description: `${formData.nome} foi adicionado ao estoque.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    }

    resetForm()
    onClose()
  }

  const handleEdit = (item: ItemEstoque) => {
    setFormData({
      produtoId: item.produtoId,
      nome: item.nome,
      quantidade: item.quantidade,
      unidade: item.unidade,
      precoUnitario: item.precoUnitario,
      categoria: item.categoria,
      ultimaAtualizacao: item.ultimaAtualizacao,
      estoqueMinimo: item.estoqueMinimo,
    })
    setEditId(item.id)
    onOpen()
  }

  const handleDelete = (id: number, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir "${nome}" do estoque?`)) {
      deleteItemEstoque(id)
      toast({
        title: "Item excluído",
        description: `${nome} foi removido do estoque.`,
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleAbrirAjuste = (item: ItemEstoque) => {
    setItemAjuste(item)
    setQuantidadeAjuste(0)
    setTipoAjuste("adicionar")
    setMotivoAjuste("")
    onOpenAjuste()
  }

  const handleAjustarEstoque = () => {
    if (!itemAjuste) return

    if (quantidadeAjuste <= 0) {
      toast({
        title: "Erro",
        description: "A quantidade deve ser maior que zero",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (!motivoAjuste) {
      toast({
        title: "Erro",
        description: "Informe o motivo do ajuste",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    // Calcular nova quantidade
    let novaQuantidade = itemAjuste.quantidade
    if (tipoAjuste === "adicionar") {
      novaQuantidade += quantidadeAjuste
    } else {
      if (quantidadeAjuste > itemAjuste.quantidade) {
        toast({
          title: "Erro",
          description: "Não é possível remover mais do que existe em estoque",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
        return
      }
      novaQuantidade -= quantidadeAjuste
    }

    // Atualizar o item
    updateItemEstoque({
      ...itemAjuste,
      quantidade: novaQuantidade,
      ultimaAtualizacao: new Date(),
    })

    toast({
      title: "Estoque ajustado",
      description: `${tipoAjuste === "adicionar" ? "Adicionado" : "Removido"} ${quantidadeAjuste} ${itemAjuste.unidade}(s) de ${itemAjuste.nome}`,
      status: "success",
      duration: 3000,
      isClosable: true,
    })

    onCloseAjuste()
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
          Controle de Estoque
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
          Novo Item
        </Button>
      </Flex>

      <Flex mb={6} gap={4} direction={{ base: "column", md: "row" }}>
        <InputGroup maxW={{ base: "100%", md: "300px" }}>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Buscar item..."
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

      <Box bg="black" borderRadius="xl" p={4} overflowX="auto">
        <Table variant="simple" colorScheme="whiteAlpha">
          <Thead>
            <Tr>
              <Th color="#E6B325">Item</Th>
              <Th color="#E6B325">Categoria</Th>
              <Th color="#E6B325" isNumeric>
                Quantidade
              </Th>
              <Th color="#E6B325" isNumeric>
                Preço Un.
              </Th>
              <Th color="#E6B325">Última Atualização</Th>
              <Th color="#E6B325">Status</Th>
              <Th color="#E6B325" textAlign="center">
                Ações
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredEstoque.map((item) => (
              <Tr key={item.id}>
                <Td color="white">
                  {item.nome}
                  <Text fontSize="xs" color="whiteAlpha.700">
                    Mínimo: {item.estoqueMinimo} {item.unidade}(s)
                  </Text>
                </Td>
                <Td color="white">{item.categoria}</Td>
                <Td color="white" isNumeric>
                  {item.quantidade} {item.unidade}(s)
                </Td>
                <Td color="white" isNumeric>
                  R$ {item.precoUnitario.toFixed(2)}
                </Td>
                <Td color="white" fontSize="sm">
                  {new Date(item.ultimaAtualizacao).toLocaleString("pt-BR")}
                </Td>
                <Td>
                  <Badge
                    colorScheme={item.quantidade <= item.estoqueMinimo ? "red" : "green"}
                    p={1}
                    borderRadius="full"
                    fontSize="xs"
                  >
                    {item.quantidade <= item.estoqueMinimo ? "Baixo" : "Adequado"}
                  </Badge>
                </Td>
                <Td>
                  <Flex justify="center" gap={2}>
                    <IconButton
                      aria-label="Ajustar estoque"
                      icon={<FiRefreshCw />}
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleAbrirAjuste(item)}
                    />
                    <IconButton
                      aria-label="Editar item"
                      icon={<FiEdit2 />}
                      size="sm"
                      colorScheme="yellow"
                      onClick={() => handleEdit(item)}
                    />
                    <IconButton
                      aria-label="Excluir item"
                      icon={<FiTrash2 />}
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDelete(item.id, item.nome)}
                    />
                  </Flex>
                </Td>
              </Tr>
            ))}
            {filteredEstoque.length === 0 && (
              <Tr>
                <Td colSpan={7} textAlign="center" color="white">
                  Nenhum item encontrado.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Modal de Criar/Editar Item */}
      <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={initialRef}>
        <ModalOverlay />
        <ModalContent bg="black" borderColor="#E6B325" borderWidth={1}>
          <ModalHeader color="#E6B325">{editId !== null ? "Editar Item" : "Adicionar Novo Item"}</ModalHeader>
          <ModalBody pb={6}>
            <FormControl mb={4} isRequired>
              <FormLabel color="white">Nome do Item</FormLabel>
              <Input
                ref={initialRef}
                placeholder="Ex: Pão para Hot Dog"
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
                placeholder="Ex: Pães, Carnes, Bebidas"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                bg="whiteAlpha.100"
                color="white"
              />
            </FormControl>

            <Flex gap={4} mb={4}>
              <FormControl isRequired>
                <FormLabel color="white">Quantidade</FormLabel>
                <NumberInput
                  min={0}
                  value={formData.quantidade}
                  onChange={(_, val) => handleNumberChange("quantidade", val)}
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

              <FormControl isRequired>
                <FormLabel color="white">Unidade</FormLabel>
                <Select
                  name="unidade"
                  value={formData.unidade}
                  onChange={handleChange}
                  bg="whiteAlpha.100"
                  color="white"
                >
                  <option value="unidade">Unidade</option>
                  <option value="kg">Kg</option>
                  <option value="g">Gramas</option>
                  <option value="l">Litros</option>
                  <option value="ml">ml</option>
                  <option value="caixa">Caixa</option>
                  <option value="pacote">Pacote</option>
                </Select>
              </FormControl>
            </Flex>

            <Flex gap={4} mb={4}>
              <FormControl isRequired>
                <FormLabel color="white">Preço Unitário (R$)</FormLabel>
                <NumberInput
                  min={0}
                  step={0.01}
                  precision={2}
                  value={formData.precoUnitario}
                  onChange={(_, val) => handleNumberChange("precoUnitario", val)}
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

              <FormControl isRequired>
                <FormLabel color="white">Estoque Mínimo</FormLabel>
                <NumberInput
                  min={0}
                  value={formData.estoqueMinimo}
                  onChange={(_, val) => handleNumberChange("estoqueMinimo", val)}
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
            </Flex>
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

      {/* Modal de Ajuste de Estoque */}
      <Modal isOpen={isOpenAjuste} onClose={onCloseAjuste}>
        <ModalOverlay />
        <ModalContent bg="black" borderColor="#E6B325" borderWidth={1}>
          <ModalHeader color="#E6B325">Ajustar Estoque</ModalHeader>
          <ModalBody pb={6}>
            {itemAjuste && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text color="white" fontWeight="bold">
                    Item: {itemAjuste.nome}
                  </Text>
                  <Text color="whiteAlpha.700">
                    Estoque atual: {itemAjuste.quantidade} {itemAjuste.unidade}(s)
                  </Text>
                </Box>

                <FormControl isRequired>
                  <FormLabel color="white">Tipo de Ajuste</FormLabel>
                  <Select
                    value={tipoAjuste}
                    onChange={(e) => setTipoAjuste(e.target.value as "adicionar" | "remover")}
                    bg="whiteAlpha.100"
                    color="white"
                  >
                    <option value="adicionar">Entrada de Estoque (Adicionar)</option>
                    <option value="remover">Saída de Estoque (Remover)</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="white">Quantidade</FormLabel>
                  <NumberInput
                    min={1}
                    value={quantidadeAjuste}
                    onChange={(_, val) => setQuantidadeAjuste(val)}
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

                <FormControl isRequired>
                  <FormLabel color="white">Motivo do Ajuste</FormLabel>
                  <Input
                    placeholder="Ex: Compra de fornecedor, Perda, Extravio..."
                    value={motivoAjuste}
                    onChange={(e) => setMotivoAjuste(e.target.value)}
                    bg="whiteAlpha.100"
                    color="white"
                  />
                </FormControl>

                {tipoAjuste === "adicionar" && (
                  <Box bg="green.800" p={2} borderRadius="md">
                    <Text color="white">
                      Novo estoque após ajuste: {itemAjuste.quantidade + quantidadeAjuste} {itemAjuste.unidade}(s)
                    </Text>
                  </Box>
                )}

                {tipoAjuste === "remover" && (
                  <Box bg={quantidadeAjuste > itemAjuste.quantidade ? "red.800" : "orange.800"} p={2} borderRadius="md">
                    <Text color="white">
                      {quantidadeAjuste > itemAjuste.quantidade
                        ? "Erro: Quantidade a remover maior que o estoque atual!"
                        : `Novo estoque após ajuste: ${itemAjuste.quantidade - quantidadeAjuste} ${itemAjuste.unidade}(s)`}
                    </Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onCloseAjuste}>
              Cancelar
            </Button>
            <Button
              bg="#C25B02"
              color="white"
              onClick={handleAjustarEstoque}
              _hover={{ bg: "#B24A01" }}
              isDisabled={tipoAjuste === "remover" && quantidadeAjuste > (itemAjuste?.quantidade || 0)}
            >
              Confirmar Ajuste
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default EstoquePage
