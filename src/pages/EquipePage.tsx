import React, { useState } from "react"
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Flex,
  Badge,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Switch,
  useDisclosure,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import { FiPlus, FiTrash2, FiEdit2, FiShield } from "react-icons/fi"
import { useData, Usuario } from "../context/DataContext"

const MotionBox = motion(Box)

const EquipePage = () => {
  const { usuarios, currentUser, addUsuario, updateUsuario, deleteUsuario } = useData()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const [usuarioEdit, setUsuarioEdit] = useState<Partial<Usuario> | null>(null)
  
  // Form refs
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [isPermPedidos, setIsPermPedidos] = useState(false)
  const [isPermEstoque, setIsPermEstoque] = useState(false)
  const [isPermProdutos, setIsPermProdutos] = useState(false)
  const [isPermRelatorios, setIsPermRelatorios] = useState(false)

  const handleOpenModal = (usuario?: Usuario) => {
    if (usuario) {
      setUsuarioEdit(usuario)
      setNome(usuario.nome)
      setEmail(usuario.email)
      setSenha(usuario.senha || "")
      setIsPermPedidos(usuario.permissoes.includes("pedidos"))
      setIsPermEstoque(usuario.permissoes.includes("estoque"))
      setIsPermProdutos(usuario.permissoes.includes("produtos"))
      setIsPermRelatorios(usuario.permissoes.includes("relatorios"))
    } else {
      setUsuarioEdit(null)
      setNome("")
      setEmail("")
      setSenha("")
      setIsPermPedidos(false)
      setIsPermEstoque(false)
      setIsPermProdutos(false)
      setIsPermRelatorios(false)
    }
    onOpen()
  }

  const handleSave = async () => {
    if (!nome || !email || (!usuarioEdit && !senha)) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha Nome, Email e Senha (novo usuário).",
        status: "warning",
      })
      return
    }

    const permissoesArr: string[] = []
    if (isPermPedidos) permissoesArr.push("pedidos")
    if (isPermEstoque) permissoesArr.push("estoque")
    if (isPermProdutos) permissoesArr.push("produtos")
    if (isPermRelatorios) permissoesArr.push("relatorios")

    try {
      if (usuarioEdit && usuarioEdit.id) {
        // Edit
        await updateUsuario({
          ...usuarioEdit,
          nome,
          email,
          senha: senha || usuarioEdit.senha,
          role: usuarioEdit.role || "funcionario",
          permissoes: usuarioEdit.role === "admin" ? ["pedidos", "estoque", "produtos", "relatorios", "equipe"] : permissoesArr,
          id: usuarioEdit.id,
          criadoEm: usuarioEdit.criadoEm || new Date()
        } as Usuario)
        toast({ title: "Usuário atualizado", status: "success" })
      } else {
        // Create
        await addUsuario({
          nome,
          email,
          senha,
          role: "funcionario",
          permissoes: permissoesArr,
        })
        toast({ title: "Funcionário cadastrado", status: "success" })
      }
      onClose()
    } catch (e) {
      toast({ title: "Erro ao salvar", status: "error" })
    }
  }

  const handleDelete = async (id: string, role: string) => {
    if (role === "admin") {
      toast({ title: "Ação não permitida", description: "Não é possível apagar a conta administradora principal", status: "error" })
      return
    }
    if (window.confirm("Deseja mesmo remover o acesso deste funcionário?")) {
      await deleteUsuario(id)
      toast({ title: "Usuário removido", status: "info" })
    }
  }

  // Apenas Admin deveria ver esta página, idealmente protegido nas Rotas,
  // mas vamos colocar uma trava extra de visual garantida.
  if (currentUser?.role !== "admin") {
    return (
      <Box p={8}>
        <Heading color="red.400">Acesso Restrito</Heading>
        <Text color="gray.400">Você não tem permissão para acessar o painel da equipe.</Text>
      </Box>
    )
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="xl" mb={2}>
            Gestão de Equipe
          </Heading>
          <Text color="gray.400">
            Controle quem tem acesso ao sistema e quais permissões eles possuem.
          </Text>
        </Box>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="orange"
          bg="brand.primary"
          _hover={{ bg: "orange.400" }}
          onClick={() => handleOpenModal()}
        >
          Novo Funcionário
        </Button>
      </Flex>

      <MotionBox
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
      >
        <Box
          bg="brand.surface"
          p={6}
          borderRadius="2xl"
          border="1px solid"
          borderColor="brand.surfaceborder"
          overflowX="auto"
        >
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th color="gray.400">Nome do Funcionário</Th>
                <Th color="gray.400">Cargo</Th>
                <Th color="gray.400">Acessos Liberados</Th>
                <Th color="gray.400" isNumeric>
                  Ações
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {usuarios.map((user) => (
                <Tr key={user.id} _hover={{ bg: "whiteAlpha.50" }}>
                  <Td>
                    <Box>
                      <Text fontWeight="bold">{user.nome}</Text>
                      <Text fontSize="sm" color="gray.400">
                        {user.email}
                      </Text>
                    </Box>
                  </Td>
                  <Td>
                    {user.role === "admin" ? (
                      <Badge colorScheme="red" p={1} borderRadius="md">Administrador</Badge>
                    ) : (
                      <Badge colorScheme="green" p={1} borderRadius="md">Funcionário</Badge>
                    )}
                  </Td>
                  <Td>
                    <Flex gap={2} flexWrap="wrap">
                      {user.role === "admin" ? (
                        <Badge colorScheme="purple"><FiShield style={{display: "inline", marginRight: "4px"}}/>Acesso Total</Badge>
                      ) : (
                        <>
                          {user.permissoes.includes("pedidos") && <Badge>Pedidos</Badge>}
                          {user.permissoes.includes("estoque") && <Badge>Estoque</Badge>}
                          {user.permissoes.includes("produtos") && <Badge>Cardápio</Badge>}
                          {user.permissoes.includes("relatorios") && <Badge colorScheme="yellow">Relatórios</Badge>}
                          {user.permissoes.length === 0 && <Text color="gray.500" fontSize="sm">Acesso Bloqueado</Text>}
                        </>
                      )}
                    </Flex>
                  </Td>
                  <Td isNumeric>
                    <Flex justify="flex-end" gap={2}>
                      <IconButton
                        aria-label="Editar"
                        icon={<FiEdit2 />}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => handleOpenModal(user)}
                      />
                      <IconButton
                        aria-label="Excluir"
                        icon={<FiTrash2 />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDelete(user.id, user.role)}
                        isDisabled={user.role === "admin"}
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </MotionBox>

      {/* Modal de Gestão de Usuário */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent bg="brand.background" border="1px solid" borderColor="brand.surfaceborder">
          <ModalHeader>{usuarioEdit ? "Editar Acessos" : "Cadastrar Novo Funcionário"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Nome Completo</FormLabel>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: João da Silva"/>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Email de Acesso</FormLabel>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="caixa@aquelehotdogs.com"/>
              </FormControl>
              
              <FormControl isRequired={!usuarioEdit}>
                <FormLabel>Senha</FormLabel>
                <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder={usuarioEdit ? "(Deixe em branco para manter a atual)" : "*********"}/>
              </FormControl>

              {usuarioEdit?.role !== "admin" && (
                <Box mt={4} p={4} bg="brand.surface" borderRadius="xl" border="1px solid" borderColor="brand.surfaceborder">
                  <Text mb={4} fontWeight="bold" color="brand.primary">Definir Níveis de Acesso</Text>
                  <VStack align="stretch" spacing={3}>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="perm-pedidos" mb="0" flex="1">
                        Área de Pedidos (Abrir comandas e Cobrar)
                      </FormLabel>
                      <Switch id="perm-pedidos" colorScheme="orange" isChecked={isPermPedidos} onChange={(e) => setIsPermPedidos(e.target.checked)} />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="perm-produtos" mb="0" flex="1">
                        Gestão do Cardápio (Mudar preços e Itens)
                      </FormLabel>
                      <Switch id="perm-produtos" colorScheme="orange" isChecked={isPermProdutos} onChange={(e) => setIsPermProdutos(e.target.checked)} />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="perm-estoque" mb="0" flex="1">
                        Controle de Estoque (Adicionar insumos)
                      </FormLabel>
                      <Switch id="perm-estoque" colorScheme="orange" isChecked={isPermEstoque} onChange={(e) => setIsPermEstoque(e.target.checked)} />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="perm-relatorios" mb="0" flex="1">
                        Inteligência (Ver Faturamento e Relatórios)
                      </FormLabel>
                      <Switch id="perm-relatorios" colorScheme="orange" isChecked={isPermRelatorios} onChange={(e) => setIsPermRelatorios(e.target.checked)} />
                    </FormControl>
                  </VStack>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
             <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
             <Button colorScheme="orange" bg="brand.primary" onClick={handleSave}>Salvar Permissões</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default EquipePage
