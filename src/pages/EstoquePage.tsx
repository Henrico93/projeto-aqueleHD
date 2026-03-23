"use client"

import type React from "react"
import { useState, useRef } from "react"
import {
  Box,
  Heading,
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
  ModalCloseButton,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import { FiEdit2, FiPlusCircle, FiTrash2, FiSearch, FiRefreshCw, FiPackage } from "react-icons/fi"
import { useData, type ItemEstoque } from "../context/DataContext"

const MotionTr = motion(Tr)

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

  const categorias = ["todas", ...new Set(estoque.map((item) => item.categoria))]

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
    if (!formData.nome || !formData.categoria || formData.quantidade < 0 || formData.precoUnitario <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos corretamente.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (editId !== null) {
      updateItemEstoque({
        ...formData,
        id: editId,
        ultimaAtualizacao: new Date(),
      })
      toast({
        title: "Item atualizado",
        description: `${formData.nome} atualizado.`,
        status: "success",
        duration: 3000,
      })
    } else {
      addItemEstoque({
        ...formData,
        ultimaAtualizacao: new Date(),
      })
      toast({
        title: "Item adicionado",
        description: `${formData.nome} adicionado.`,
        status: "success",
        duration: 3000,
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
    if (window.confirm(`Tem certeza que deseja excluir "${nome}"?`)) {
      deleteItemEstoque(id)
      toast({
        title: "Item excluído",
        description: `${nome} foi removido.`,
        status: "error",
        duration: 3000,
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

    if (quantidadeAjuste <= 0 || !motivoAjuste) {
      toast({
        title: "Erro",
        description: "Preencha a quantidade (maior que zero) e o motivo.",
        status: "error",
        duration: 3000,
      })
      return
    }

    let novaQuantidade = itemAjuste.quantidade
    if (tipoAjuste === "adicionar") {
      novaQuantidade += quantidadeAjuste
    } else {
      if (quantidadeAjuste > itemAjuste.quantidade) {
        toast({
          title: "Erro",
          description: "Estoque insuficiente para remover essa quantidade.",
          status: "error",
          duration: 3000,
        })
        return
      }
      novaQuantidade -= quantidadeAjuste
    }

    updateItemEstoque({
      ...itemAjuste,
      quantidade: novaQuantidade,
      ultimaAtualizacao: new Date(),
    })

    toast({
      title: "Estoque ajustado",
      description: `${tipoAjuste === "adicionar" ? "Adicionado" : "Removido"} ${quantidadeAjuste} ${itemAjuste.unidade}(s)`,
      status: "success",
      duration: 3000,
    })

    onCloseAjuste()
  }

  return (
    <Box maxW="1400px" mx="auto" w="100%">
      <Flex justify="space-between" align="center" mb={10} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="xl" color="brand.light" fontWeight="700">
            Controle de Estoque
          </Heading>
          <Text color="gray.400" mt={1}>Gerenciamento de ingredientes e insumos.</Text>
        </Box>
        <Button
          leftIcon={<FiPlusCircle />}
          onClick={() => {
            resetForm()
            onOpen()
          }}
          variant="primary"
          size="lg"
          borderRadius="full"
          px={8}
          boxShadow="0 4px 15px rgba(255,107,0,0.4)"
        >
          Novo Item
        </Button>
      </Flex>

      <Flex mb={8} gap={4} direction={{ base: "column", md: "row" }} bg="brand.surface" p={4} borderRadius="2xl" border="1px solid" borderColor="brand.surfaceborder" backdropFilter="blur(16px)">
        <InputGroup maxW={{ base: "100%", md: "400px" }}>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Buscar ingrediente..."
            bg="whiteAlpha.50"
            color="brand.light"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            border="1px solid"
            borderColor="brand.surfaceborder"
            borderRadius="full"
            _focus={{ borderColor: "brand.primary", boxShadow: "0 0 0 1px #FF6B00" }}
          />
          {searchTerm && (
            <InputRightElement>
              <IconButton
                aria-label="Limpar"
                icon={<FiRefreshCw />}
                size="sm"
                variant="ghost"
                color="brand.secondary"
                onClick={() => setSearchTerm("")}
                isRound
              />
            </InputRightElement>
          )}
        </InputGroup>

        <Select
          maxW={{ base: "100%", md: "250px" }}
          bg="whiteAlpha.50"
          color="brand.light"
          border="1px solid"
          borderColor="brand.surfaceborder"
          borderRadius="full"
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          sx={{"& > option":{background:"#0F172A",color:"white"}}}
        >
          {categorias.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria === "todas" ? "Todas as categorias" : categoria}
            </option>
          ))}
        </Select>
      </Flex>

      <Box variant="glass" borderRadius="2xl" overflow="hidden" boxShadow="xl">
        <Box overflowX="auto">
          <Table variant="unstyled">
            <Thead bg="whiteAlpha.100" borderBottom="1px solid" borderColor="brand.surfaceborder">
              <Tr>
                <Th color="brand.secondary" py={4} letterSpacing="wider">Item</Th>
                <Th color="brand.secondary" py={4} letterSpacing="wider">Categoria</Th>
                <Th color="brand.secondary" py={4} isNumeric letterSpacing="wider">Qtde</Th>
                <Th color="brand.secondary" py={4} isNumeric letterSpacing="wider">Preço Un.</Th>
                <Th color="brand.secondary" py={4} letterSpacing="wider">Status</Th>
                <Th color="brand.secondary" py={4} textAlign="center" letterSpacing="wider">Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredEstoque.map((item, index) => {
                const isBaixo = item.quantidade <= item.estoqueMinimo;
                return (
                  <MotionTr 
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    borderBottom="1px solid" 
                    borderColor="whiteAlpha.50"
                    _hover={{ bg: "whiteAlpha.50" }}
                  >
                    <Td color="brand.light" py={5}>
                      <Flex align="center" gap={3}>
                        <Box p={2} bg="whiteAlpha.100" borderRadius="md"><FiPackage color="#FFD700" /></Box>
                        <Box>
                          <Text fontWeight="600" fontSize="md">{item.nome}</Text>
                          <Text fontSize="xs" color="gray.400">Min: {item.estoqueMinimo} {item.unidade}(s)</Text>
                        </Box>
                      </Flex>
                    </Td>
                    <Td color="gray.300">{item.categoria}</Td>
                    <Td color={isBaixo ? "red.400" : "brand.light"} isNumeric fontWeight={isBaixo ? "bold" : "normal"}>
                      {item.quantidade} <Text as="span" fontSize="xs" color="gray.500">{item.unidade}</Text>
                    </Td>
                    <Td color="brand.secondary" isNumeric fontWeight="500">
                      R$ {item.precoUnitario.toFixed(2)}
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={isBaixo ? "red" : "green"}
                        px={3}
                        py={1}
                        borderRadius="full"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        fontSize="xs"
                        variant="subtle"
                      >
                        {isBaixo ? "Estoque Baixo" : "Estável"}
                      </Badge>
                    </Td>
                    <Td>
                      <Flex justify="center" gap={2}>
                        <IconButton
                          aria-label="Ajustar"
                          icon={<FiRefreshCw />}
                          size="sm"
                          variant="ghost"
                          color="blue.300"
                          _hover={{ bg: "blue.900" }}
                          onClick={() => handleAbrirAjuste(item)}
                          isRound
                        />
                        <IconButton
                          aria-label="Editar"
                          icon={<FiEdit2 />}
                          size="sm"
                          variant="ghost"
                          color="brand.secondary"
                          _hover={{ bg: "yellow.900" }}
                          onClick={() => handleEdit(item)}
                          isRound
                        />
                        <IconButton
                          aria-label="Excluir"
                          icon={<FiTrash2 />}
                          size="sm"
                          variant="ghost"
                          color="red.400"
                          _hover={{ bg: "red.900" }}
                          onClick={() => handleDelete(item.id, item.nome)}
                          isRound
                        />
                      </Flex>
                    </Td>
                  </MotionTr>
                );
              })}
              {filteredEstoque.length === 0 && (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={12} color="gray.500">
                    <Flex direction="column" align="center">
                      <FiPackage size={40} style={{ opacity: 0.5, marginBottom: '16px' }} />
                      Nenhum item encontrado no estoque.
                    </Flex>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Modal Editar/Adicionar */}
      <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={initialRef} isCentered motionPreset="slideInBottom">
        <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.700" />
        <ModalContent bg="brand.surface" borderColor="brand.surfaceborder" borderWidth={1} borderRadius="2xl">
          <ModalHeader color="brand.light">{editId !== null ? "Editar Item" : "Novo Item de Estoque"}</ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel color="gray.400" fontSize="sm">Nome do Item</FormLabel>
                <Input
                  ref={initialRef}
                  placeholder="Ex: Pão para Hot Dog"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  bg="whiteAlpha.100"
                  color="brand.light"
                  border="1px solid"
                  borderColor="brand.surfaceborder"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="gray.400" fontSize="sm">Categoria</FormLabel>
                <Input
                  placeholder="Ex: Pães, Carnes, Bebidas"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  bg="whiteAlpha.100"
                  color="brand.light"
                  border="1px solid"
                  borderColor="brand.surfaceborder"
                />
              </FormControl>

              <Flex gap={4} w="100%">
                <FormControl isRequired>
                  <FormLabel color="gray.400" fontSize="sm">Quantidade</FormLabel>
                  <NumberInput min={0} value={formData.quantidade} onChange={(_, val) => handleNumberChange("quantidade", val)}>
                    <NumberInputField bg="whiteAlpha.100" color="brand.light" borderColor="brand.surfaceborder" />
                    <NumberInputStepper>
                      <NumberIncrementStepper color="brand.secondary" />
                      <NumberDecrementStepper color="brand.secondary" />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.400" fontSize="sm">Unidade</FormLabel>
                  <Select name="unidade" value={formData.unidade} onChange={handleChange} bg="whiteAlpha.100" color="brand.light" borderColor="brand.surfaceborder" sx={{"& > option":{background:"#0F172A"}}}>
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

              <Flex gap={4} w="100%">
                <FormControl isRequired>
                  <FormLabel color="gray.400" fontSize="sm">Preço (R$)</FormLabel>
                  <NumberInput min={0} step={0.01} precision={2} value={formData.precoUnitario} onChange={(_, val) => handleNumberChange("precoUnitario", val)}>
                    <NumberInputField bg="whiteAlpha.100" color="brand.light" borderColor="brand.surfaceborder" />
                    <NumberInputStepper>
                      <NumberIncrementStepper color="brand.secondary" />
                      <NumberDecrementStepper color="brand.secondary" />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.400" fontSize="sm">Alerta (Mín.)</FormLabel>
                  <NumberInput min={0} value={formData.estoqueMinimo} onChange={(_, val) => handleNumberChange("estoqueMinimo", val)}>
                    <NumberInputField bg="whiteAlpha.100" color="brand.light" borderColor="brand.surfaceborder" />
                    <NumberInputStepper>
                      <NumberIncrementStepper color="brand.secondary" />
                      <NumberDecrementStepper color="brand.secondary" />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </Flex>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" color="gray.400" mr={3} onClick={onClose}>Cancelar</Button>
            <Button variant="primary" onClick={handleSubmit}>{editId !== null ? "Atualizar Item" : "Salvar Item"}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Ajuste */}
      <Modal isOpen={isOpenAjuste} onClose={onCloseAjuste} isCentered>
        <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.700" />
        <ModalContent bg="brand.surface" borderColor="brand.surfaceborder" borderWidth={1} borderRadius="2xl">
          <ModalHeader color="brand.light">Ajustar Quantidade</ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody pb={6}>
            {itemAjuste && (
              <VStack spacing={5} align="stretch">
                <Box bg="whiteAlpha.100" p={4} borderRadius="lg" border="1px dashed" borderColor="brand.surfaceborder">
                  <Text color="brand.secondary" fontWeight="bold" fontSize="lg">{itemAjuste.nome}</Text>
                  <Text color="gray.400" mt={1}>Atual: {itemAjuste.quantidade} {itemAjuste.unidade}(s)</Text>
                </Box>

                <FormControl isRequired>
                  <FormLabel color="gray.400">Operação</FormLabel>
                  <Select value={tipoAjuste} onChange={(e) => setTipoAjuste(e.target.value as "adicionar" | "remover")} bg="whiteAlpha.100" color="brand.light" borderColor="brand.surfaceborder" sx={{"& > option":{background:"#0F172A"}}}>
                    <option value="adicionar">Adicionar (+)</option>
                    <option value="remover">Remover (-)</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.400">Quantidade</FormLabel>
                  <NumberInput min={1} value={quantidadeAjuste} onChange={(_, val) => setQuantidadeAjuste(val)}>
                    <NumberInputField bg="whiteAlpha.100" color="brand.light" borderColor="brand.surfaceborder" />
                    <NumberInputStepper>
                      <NumberIncrementStepper color="brand.secondary" />
                      <NumberDecrementStepper color="brand.secondary" />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.400">Motivo</FormLabel>
                  <Input placeholder="Desperdício, nova compra, etc." value={motivoAjuste} onChange={(e) => setMotivoAjuste(e.target.value)} bg="whiteAlpha.100" color="brand.light" borderColor="brand.surfaceborder" />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" color="gray.400" mr={3} onClick={onCloseAjuste}>Cancelar</Button>
            <Button variant="primary" onClick={handleAjustarEstoque}>Confirmar Ajuste</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default EstoquePage
